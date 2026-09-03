import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

const HOTMART_TOKEN = process.env.HOTMART_TOKEN || '';

export async function POST(req: Request) {
  try {
    if (HOTMART_TOKEN) {
      const hottok = req.headers.get('x-hotmart-hottok')
      if (hottok !== HOTMART_TOKEN) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await req.json()
    
    // Verificar se é 'PURCHASE_APPROVED', ou cancelamento/reembolso
    const event = body.event || ""
    const status = body.data?.purchase?.status || body.status || ""
    const isApproved = event === "PURCHASE_APPROVED" || status === "APPROVED" || status === "approved"
    const isRefunded = event === "PURCHASE_CANCELED" || event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK" ||
                       status === "CANCELED" || status === "canceled" || status === "REFUNDED" || status === "refunded" || status === "CHARGEBACK" || status === "chargeback"

    if (!isApproved && !isRefunded) {
      return NextResponse.json({ message: `Ignored status/event: ${event || status}` }, { status: 200 })
    }

    const email = body.data?.buyer?.email || body.email
    const transaction = body.data?.purchase?.transaction || body.transaction
    const amountPaid = body.data?.purchase?.price?.value || body.price || 0
    
    if (!email) {
      return NextResponse.json({ error: 'Email not found in payload' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Buscar usuário
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !userData) {
      console.error(`Usuário não encontrado para o email: ${email}`)
      return NextResponse.json({ message: 'User not found for this email. Credits not added.' }, { status: 200 })
    }

    // Identificar o ID do produto da Hotmart
    const productIdRaw = body.data?.product?.id || body.product?.id || body.hproduct_id || body.prod || ""
    const productId = String(productIdRaw)

    // Mapeamento de Produtos x Créditos
    let creditsToModify = 0
    if (productId === "8451873") creditsToModify = 1000
    else if (productId === "8451847") creditsToModify = 300
    else if (productId === "8451787") creditsToModify = 100
    else {
      console.warn(`Produto ID não reconhecido: ${productId}`)
      return NextResponse.json({ message: `Unmapped product ID: ${productId}. Ignored.` }, { status: 200 })
    }

    if (isRefunded) {
      creditsToModify = -creditsToModify
    }

    // Não permite saldo ficar negativo
    const newCredits = Math.max(0, (userData.credits || 0) + creditsToModify)

    const { error: updateError } = await supabase
      .from('users')
      .update({ credits: newCredits })
      .eq('id', userData.id)

    if (updateError) {
      console.error('Erro ao atualizar créditos:', updateError)
      return NextResponse.json({ error: 'Failed to update credits' }, { status: 500 })
    }

    // Salvar transação
    await supabase.from('transactions').insert({
      user_id: userData.id,
      amount_paid: isRefunded ? -amountPaid : amountPaid,
      credits_added: creditsToModify,
      stripe_session_id: transaction
    })

    return NextResponse.json({ success: true, message: `Processed ${creditsToModify} credits for ${email}` }, { status: 200 })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
