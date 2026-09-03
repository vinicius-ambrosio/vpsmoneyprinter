"use server"

import { createClient } from "@/utils/supabase/server"

export async function getUserCredits() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { credits: 0, error: "Usuário não autenticado" }
  }

  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single()

  if (error) {
    return { credits: 0, error: error.message }
  }

  return { credits: data.credits }
}

export async function produceVideos(videosToInsert: Record<string, unknown>[]) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: "Usuário não autenticado" }
  }

  // Cost per video is 10
  const totalCost = videosToInsert.length * 10

  // 1. Check current credits
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("credits")
    .eq("id", user.id)
    .single()

  if (userError || !userData) {
    return { error: "Erro ao buscar saldo de créditos." }
  }

  if (userData.credits < totalCost) {
    return { error: `Saldo insuficiente. Você precisa de ${totalCost} créditos, mas possui apenas ${userData.credits}.` }
  }

  // 2. Deduct credits
  const newCredits = userData.credits - totalCost
  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Erro ao descontar créditos." }
  }

  // 3. Insert videos
  const { error: insertError } = await supabase
    .from('videos')
    .insert(videosToInsert)

  if (insertError) {
    // Attempt rollback if insert failed
    await supabase.from("users").update({ credits: userData.credits }).eq("id", user.id)
    return { error: "Erro ao salvar vídeos: " + insertError.message }
  }

  return { success: true, remainingCredits: newCredits }
}
