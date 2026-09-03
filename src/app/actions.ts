"use server"

import { createClient } from "@/utils/supabase/server"

export async function getUserCredits() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { credits: 0, error: "UsuÃ¡rio nÃ£o autenticado" }
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
    return { error: "UsuÃ¡rio nÃ£o autenticado" }
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
    return { error: "Erro ao buscar saldo de crÃ©ditos." }
  }

  if (userData.credits < totalCost) {
    return { error: `Saldo insuficiente. VocÃª precisa de ${totalCost} crÃ©ditos, mas possui apenas ${userData.credits}.` }
  }

  // 2. Deduct credits
  const newCredits = userData.credits - totalCost
  const { error: updateError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Erro ao descontar crÃ©ditos." }
  }

  // 3. Insert videos
  const { error: insertError } = await supabase
    .from('videos')
    .insert(videosToInsert)

  if (insertError) {
    // Attempt rollback if insert failed
    await supabase.from("users").update({ credits: userData.credits }).eq("id", user.id)
    return { error: "Erro ao salvar vÃ­deos: " + insertError.message }
  }

  return { success: true, remainingCredits: newCredits }
}

import { revalidatePath } from "next/cache"

export async function deleteVideo(videoId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: "UsuÃ¡rio nÃ£o autenticado" }
  }

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", videoId)
    .eq("user_id", user.id)

  if (error) {
    return { error: "Erro ao excluir vÃ­deo: " + error.message }
  }

  revalidatePath('/historico');
  return { success: true }
}

export async function retryVideo(videoId: string) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: "Usuario nao autenticado" }
  }

  const { error } = await supabase
    .from("videos")
    .update({ status: "draft" })
    .eq("id", videoId)
    .eq("user_id", user.id)
    .eq("status", "failed") // Apenas se estiver falhado

  if (error) {
    return { error: "Erro ao tentar novamente: " + error.message }
  }

  revalidatePath('/historico');
  return { success: true }
}
