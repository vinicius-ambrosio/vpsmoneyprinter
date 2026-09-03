"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, Loader2, Store, UserCheck, Sparkles, Tag, ArrowRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const [formData, setFormData] = useState({
    product_name: "",
    target_audience: "",
    main_benefit: "",
    price: ""
  })

  const [importUrl, setImportUrl] = useState("")
  const [isScraping, setIsScraping] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('brand_contexts').select('*').eq('user_id', user.id).maybeSingle()
        if (data) {
          setFormData({
            product_name: data.product_name || "",
            target_audience: data.target_audience || "",
            main_benefit: data.main_benefit || "",
            price: data.price || ""
          })
          if (data.url) setImportUrl(data.url)
          // Keep localstorage in sync
          localStorage.setItem("brandContext", JSON.stringify({
            nomeProduto: data.product_name,
            publico: data.target_audience,
            beneficio: data.main_benefit,
            preco: data.price
          }))
        } else {
          // If no supabase data but has localstorage, populate from it
          const local = localStorage.getItem("brandContext")
          if (local) {
            const parsed = JSON.parse(local)
            setFormData({
              product_name: parsed.nomeProduto || "",
              target_audience: parsed.publico || "",
              main_benefit: parsed.beneficio || "",
              price: parsed.preco || ""
            })
          }
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: existing } = await supabase.from('brand_contexts').select('id').eq('user_id', user.id).maybeSingle()
        
        let error;
        if (existing) {
          const res = await supabase.from('brand_contexts').update({
            product_name: formData.product_name,
            target_audience: formData.target_audience,
            main_benefit: formData.main_benefit,
            price: formData.price,
            url: importUrl || ""
          }).eq('user_id', user.id)
          error = res.error
        } else {
          const res = await supabase.from('brand_contexts').insert({
            user_id: user.id,
            product_name: formData.product_name,
            target_audience: formData.target_audience,
            main_benefit: formData.main_benefit,
            price: formData.price,
            url: importUrl || ""
          })
          error = res.error
        }

        if (error) throw error

        localStorage.setItem("brandContext", JSON.stringify({
          nomeProduto: formData.product_name,
          publico: formData.target_audience,
          beneficio: formData.main_benefit,
          preco: formData.price
        }))

        setMessageType("success")
        setMessage("Configurações salvas com sucesso!")
      } else {
        // User not logged in, just save locally
        localStorage.setItem("brandContext", JSON.stringify({
          nomeProduto: formData.product_name,
          publico: formData.target_audience,
          beneficio: formData.main_benefit,
          preco: formData.price
        }))
        setMessageType("success")
        setMessage("Configurações salvas localmente.")
      }
    } catch (err: any) {
      console.error(err)
      setMessageType("error")
      setMessage("Erro ao salvar: " + err.message)
    } finally {
      setIsSaving(false)
      setTimeout(() => setMessage(""), 4000)
    }
  }

  const handleScrapeUrl = async () => {
    if (!importUrl) return;
    setIsScraping(true);
    
    let retries = 0;
    const maxRetries = 6;
    let delay = 3000;

    while (retries <= maxRetries) {
      try {
        if (retries > 0) {
          setMessageType("success");
          setMessage(`Fila de espera... A IA está ocupada. Tentando novamente (${retries}/${maxRetries}).`);
        }

        const res = await fetch('/api/read-site-context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: importUrl })
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (data.error === 'RATE_LIMIT' || res.status === 429) {
            if (retries < maxRetries) {
              retries++;
              await new Promise(r => setTimeout(r, delay));
              delay += 2000; // aumenta a espera a cada tentativa
              continue; 
            } else {
              setMessageType("error");
              setMessage("A IA está muito congestionada no momento. Tente novamente em 1 minuto.");
              setIsScraping(false);
              setTimeout(() => setMessage(""), 5000);
              return;
            }
          }

          let errorMsg = data.error || 'Falha ao ler o site';
          setMessageType("error");
          setMessage(errorMsg);
          setIsScraping(false);
          setTimeout(() => setMessage(""), 5000);
          return;
        }
        
        setFormData({
          product_name: data.nomeProduto || "",
          target_audience: data.publico || "",
          main_benefit: data.beneficio || "",
          price: data.preco || ""
        });
        setMessageType("success");
        setMessage("Site lido com sucesso! Revise e salve as configurações.");
        break;
      } catch (e: any) {
        console.error(e);
        setMessageType("error");
        setMessage(e.message || 'Erro ao extrair site');
        break;
      }
    }
    
    setIsScraping(false);
    setTimeout(() => setMessage(""), 5000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-8 mb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="h-14 w-14 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
            <Store className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Configurações da Marca</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Defina o contexto do seu produto para a IA gerar roteiros perfeitos.</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <Card className="border-gray-200 shadow-sm rounded-2xl bg-white overflow-hidden">
          <div className="h-1.5 w-full bg-zinc-900"></div>
          <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-6">
            <CardTitle className="text-xl text-gray-900">Contexto Padrão (Brand Context)</CardTitle>
            <CardDescription className="text-gray-500 text-base">
              Essas informações serão usadas pela IA quando você importar links de fora ou usar o modo em Lote, garantindo que o vídeo tenha a sua cara e faça o seu pitch de vendas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Cole a URL do seu site para a IA preencher tudo..." 
                    className="border-gray-200 shadow-sm focus-visible:ring-zinc-900 rounded-xl h-12 text-base flex-1"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={isScraping}
                  />
                  <Button 
                    onClick={handleScrapeUrl}
                    disabled={isScraping || !importUrl}
                    className="h-12 w-12 rounded-xl bg-black hover:bg-zinc-800 text-white p-0 flex items-center justify-center transition-all shrink-0"
                  >
                    {isScraping ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
                  </Button>
                </div>
                
                <div className="w-full h-px bg-gray-100" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-gray-900 font-semibold flex items-center gap-2 text-base">
                    <Store className="h-4 w-4 text-gray-400" /> Nome do Produto ou Serviço
                  </Label>
                  <Input 
                    placeholder="Ex: Curso Emagrecimento Turbo" 
                    className="border-gray-200 shadow-sm focus-visible:ring-zinc-900 rounded-xl h-12 text-base"
                    value={formData.product_name}
                    onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-900 font-semibold flex items-center gap-2 text-base">
                    <Tag className="h-4 w-4 text-gray-400" /> Preço ou Oferta
                  </Label>
                  <Input 
                    placeholder="Ex: De R$ 197 por apenas R$ 97" 
                    className="border-gray-200 shadow-sm focus-visible:ring-zinc-900 rounded-xl h-12 text-base"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label className="text-gray-900 font-semibold flex items-center gap-2 text-base">
                    <UserCheck className="h-4 w-4 text-gray-400" /> Público-Alvo (Persona)
                  </Label>
                  <Textarea 
                    placeholder="Ex: Mulheres de 25 a 45 anos que tentam emagrecer mas não têm tempo de ir à academia." 
                    className="border-gray-200 shadow-sm focus-visible:ring-zinc-900 rounded-xl min-h-[100px] resize-y text-base p-4"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  />
                </div>

                <div className="space-y-3 md:col-span-2">
                  <Label className="text-gray-900 font-semibold flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-gray-400" /> Principal Benefício ou Promessa
                  </Label>
                  <Textarea 
                    placeholder="Ex: Perca até 5kg em 30 dias sem precisar cortar seus alimentos favoritos." 
                    className="border-gray-200 shadow-sm focus-visible:ring-zinc-900 rounded-xl min-h-[100px] resize-y text-base p-4"
                    value={formData.main_benefit}
                    onChange={(e) => setFormData({...formData, main_benefit: e.target.value})}
                  />
                </div>
              </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 p-6 flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
            <span className={`text-sm font-medium transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'} ${messageType === 'error' ? 'text-red-600' : 'text-emerald-600'}`}>
              {message}
            </span>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || isSaving}
              className="bg-black hover:bg-zinc-800 text-white shadow-sm transition-all px-8 rounded-xl h-12 font-bold w-full sm:w-auto"
            >
              {isSaving ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="mr-2 h-5 w-5" /> Salvar Configurações</>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
