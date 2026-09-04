'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const errorMsg = error.message.includes('Email not confirmed') 
        ? 'Este e-mail ainda nÃ£o foi confirmado. Verifique sua caixa de entrada ou crie uma conta nova.' 
        : `Erro ao logar: ${error.message}`;
        
      redirect(`/login?error=${encodeURIComponent(errorMsg)}`)
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (err: any) {
    // Caso de erro nÃ£o tratado (ex: erro de rede, JSON parse invÃ¡lido do servidor self-hosted)
    if (err.message === 'NEXT_REDIRECT' || (err.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err; // NEXT_REDIRECT needs to propagate
    redirect(`/login?error=${encodeURIComponent('Erro de comunicaÃ§Ã£o com o servidor: ' + (err.message || 'Desconhecido'))}`)
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    const adminSupabase = await import('@/utils/supabase/admin').then(m => m.createAdminClient());
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    })

    if (error) {
      redirect('/login?error=' + encodeURIComponent(`Erro ao cadastrar: ${error.message}`))
    }

    // Create user row with 20 credits
    if (data?.user) {
      await adminSupabase.from('users').upsert({
        id: data.user.id,
        email: email,
        full_name: name,
        credits: 20
      }, { onConflict: 'id' })
    }

    if (data?.session === null) {
      redirect('/login?message=Se este e-mail for novo, verifique sua caixa de entrada. Se vocÃª jÃ¡ tem conta, clique na aba "Entrar" para fazer login.')
    }

    revalidatePath('/', 'layout')
    redirect('/')
  } catch (err: any) {
    if (err.message === 'NEXT_REDIRECT' || (err.digest && err.digest.startsWith('NEXT_REDIRECT'))) throw err;
    redirect(`/login?error=${encodeURIComponent('Erro de comunicaÃ§Ã£o com o servidor: ' + (err.message || 'Desconhecido'))}`)
  }
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/login?error=Erro ao sair da conta')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}


