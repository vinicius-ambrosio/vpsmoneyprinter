"use client"

import { useState } from "react"
import { Loader2, Wand2, CheckCircle, Circle, ArrowLeft, ArrowRight, Link2, Building2, Type } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useCredits } from "@/components/CreditsProvider"
import { createClient } from "@/utils/supabase/client"
import { produceVideos } from "@/app/actions"

const SELECT_LABELS: Record<string, string> = {
  "curiosidades": "Curiosidades",
  "top5": "Top 5 / Lista",
  "polemica": "Polêmica / Opinião Forte",
  "dicas": "Dicas Práticas",
  "historia": "História de Sucesso",
  "conspiracao": "Teoria da Conspiração",
  "1": "1 Roteiro",
  "2": "2 Roteiros",
  "3": "3 Roteiros",
  "4": "4 Roteiros",
  "5": "5 Roteiros",
  "pt-BR-AntonioNeural": "Antônio (Masculino - Forte/Grave)",
  "pt-BR-JulioNeural": "Júlio (Masculino - Jovem)",
  "pt-BR-FranciscaNeural": "Francisca (Feminina - Enérgica)",
  "pt-BR-ThalitaNeural": "Thalita (Feminina - Suave)",
  "0.9": "Lento (0.9x)",
  "1.0": "Normal (1.0x)",
  "1.15": "Dinâmico (1.15x)",
  "1.3": "Muito Rápido (1.3x)",
  "Roboto-Black": "Roboto Black (Padrão Tiktok)",
  "Montserrat-Bold": "Montserrat Bold",
  "Impact": "Impact (Meme clássico)",
  "top": "Topo",
  "center": "Centro",
  "bottom": "Rodapé"
}

export default function GeneradorPage() {
  const router = useRouter()
  const supabase = createClient()
  const { credits, isLoading, refreshCredits } = useCredits()
  
  const [currentStep, setCurrentStep] = useState(1)
  
  // Batch Generation States
  const [topic, setTopic] = useState("")
  const [sourceType, setSourceType] = useState<"link" | "tema" | "brand">("link")
  const [format, setFormat] = useState("curiosidades")
  const [quantity, setQuantity] = useState("3")
  const [hasCta, setHasCta] = useState(false)
  const [cta, setCta] = useState("")
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState<Array<{ title: string, script: string }>>([])
  const [selectedScripts, setSelectedScripts] = useState<number[]>([]) // Array of indices
  
  // Geral
  const [voz, setVoz] = useState("pt-BR-AntonioNeural")
  const [velocidade, setVelocidade] = useState("1.0")

  // Legendas
  const [posicaoLegenda, setPosicaoLegenda] = useState("center")
  const [fonte, setFonte] = useState("Roboto-Black")
  const [corTexto, setCorTexto] = useState("#FFFFFF")
  const [corFundo, setCorFundo] = useState("#000000")
  
  // Audio
  const [bgmVolume, setBgmVolume] = useState([15])

  const [isFilaLoading, setIsFilaLoading] = useState(false)

  const handleGerarLote = async () => {
    if ((sourceType === "link" || sourceType === "tema") && !topic) {
      alert(sourceType === "link" ? "Insira um link de referência!" : "Escreva um tema!");
      return;
    }

    setIsGeneratingBatch(true);
    setGeneratedOptions([]);
    setSelectedScripts([]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      let brandContextData = null;

      if (sourceType === "brand" && user) {
        const { data } = await supabase.from('brand_contexts').select('*').eq('user_id', user.id).maybeSingle();
        if (data) {
          brandContextData = {
            nomeProduto: data.product_name,
            publico: data.target_audience,
            beneficio: data.main_benefit,
            preco: data.price
          };
        } else {
          alert("Nenhuma configuração de marca encontrada. Configure primeiro em Configurações > Branding.");
          setIsGeneratingBatch(false);
          return;
        }
      }

      const res = await fetch('/api/generate-scripts-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, format, quantity, cta: hasCta ? cta : "", brandContext: brandContextData })
      });
      const data = await res.json();
      
      if (res.ok && data.scripts) {
        setGeneratedOptions(data.scripts);
        setCurrentStep(2); // Auto advance to next step
      } else {
        let errorMsg = data.error || "Erro ao gerar roteiros";
        if (typeof errorMsg === 'string' && errorMsg.includes('Quota exceeded')) {
          errorMsg = 'A IA está sobrecarregada no momento (limite atingido). Tente novamente em alguns minutos.';
        }
        alert(errorMsg);
      }
    } catch {
      alert("Erro ao conectar com a API");
    } finally {
      setIsGeneratingBatch(false);
    }
  }

  const toggleSelection = (index: number) => {
    setSelectedScripts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    );
  }

  const handleUpdateScript = (index: number, newText: string) => {
    setGeneratedOptions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], script: newText };
      return updated;
    });
  }

  const handleColocarNaFila = async () => {
    if (selectedScripts.length === 0) {
      alert("Selecione pelo menos um roteiro para produzir!");
      return;
    }

    const totalCost = selectedScripts.length * 10;
    if (credits < totalCost) {
      alert(`Saldo insuficiente. Você precisa de ${totalCost} créditos.`);
      return;
    }

    setIsFilaLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const videosToInsert = selectedScripts.map(index => {
        const option = generatedOptions[index];
        return {
          user_id: user.id,
          title: option.title.substring(0, 50),
          script: option.script,
          style: 'pexels',
          status: 'draft',
          voice_id: voz,
          voice_speed: parseFloat(velocidade),
          subtitle_position: posicaoLegenda,
          subtitle_font: fonte,
          subtitle_color: corTexto,
          subtitle_bg_color: corFundo,
          bgm_volume: bgmVolume[0],
          broll_mode: 'auto',
        };
      });

      const res = await produceVideos(videosToInsert);
      
      if (res.success) {
        await refreshCredits();
        router.push('/historico');
      } else {
        alert(res.error || "Erro ao salvar vídeos");
        setIsFilaLoading(false);
      }
    } else {
      alert("Usuário não autenticado");
      setIsFilaLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Assistente de Criação</h1>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Siga os passos para gerar e produzir vídeos de alta conversão.</p>
            </div>
          </div>
          
          <div className="flex items-center w-full md:w-[320px] shrink-0 mt-2 md:mt-0 pb-6 md:pb-0">
            {[1, 2, 3].map((stepNum, idx) => (
              <div key={stepNum} className={`flex items-center ${idx < 2 ? 'flex-1' : ''}`}>
                
                <div 
                  className={`relative flex flex-col items-center transition-all ${currentStep >= stepNum ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => {
                    if (stepNum < currentStep || (stepNum === 2 && generatedOptions.length > 0) || (stepNum === 3 && selectedScripts.length > 0)) {
                      setCurrentStep(stepNum)
                    }
                  }}
                  style={{ cursor: (stepNum < currentStep || (stepNum === 2 && generatedOptions.length > 0) || (stepNum === 3 && selectedScripts.length > 0)) ? 'pointer' : 'default' }}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all z-10 ${currentStep >= stepNum ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' : 'bg-white border-gray-300 text-gray-500'}`}>
                    {stepNum}
                  </div>
                  <span className={`absolute top-10 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${currentStep >= stepNum ? 'text-zinc-900' : 'text-gray-500'}`}>
                    {stepNum === 1 ? 'Ideias' : stepNum === 2 ? 'Seleção' : 'Produção'}
                  </span>
                </div>

                {idx < 2 && (
                  <div className={`flex-1 h-1 -mx-1 z-0 rounded-full transition-all duration-300 ${currentStep > stepNum ? 'bg-zinc-900' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* PASSO 1: GERAR IDEIAS */}
        {currentStep === 1 && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
              <div className="h-1.5 w-full bg-zinc-900"></div>
              <CardHeader className="pb-5 border-b border-gray-100 bg-gray-50/50">
                <CardTitle className="text-xl text-gray-900">1. Tema e Formato</CardTitle>
                <CardDescription className="text-base text-gray-500 mt-1">Forneça um contexto para a IA criar as opções.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6 pb-6 px-6">
                
                <div className="space-y-3">
                  <Label className="text-gray-900 font-semibold text-sm">Fonte do Conteúdo</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div 
                      className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-2 ${sourceType === 'link' ? 'border-zinc-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setSourceType('link')}
                    >
                      <Link2 className={`h-4 w-4 ${sourceType === 'link' ? 'text-zinc-900' : 'text-gray-500'}`} />
                      <span className={`font-bold text-sm ${sourceType === 'link' ? 'text-zinc-900' : 'text-gray-700'}`}>Link</span>
                    </div>
                    
                    <div 
                      className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-2 ${sourceType === 'tema' ? 'border-zinc-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setSourceType('tema')}
                    >
                      <Type className={`h-4 w-4 ${sourceType === 'tema' ? 'text-zinc-900' : 'text-gray-500'}`} />
                      <span className={`font-bold text-sm ${sourceType === 'tema' ? 'text-zinc-900' : 'text-gray-700'}`}>Tema livre</span>
                    </div>

                    <div 
                      className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex items-center justify-center gap-2 ${sourceType === 'brand' ? 'border-zinc-900 bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => setSourceType('brand')}
                    >
                      <Building2 className={`h-4 w-4 ${sourceType === 'brand' ? 'text-zinc-900' : 'text-gray-500'}`} />
                      <span className={`font-bold text-sm ${sourceType === 'brand' ? 'text-zinc-900' : 'text-gray-700'}`}>Meu Produto</span>
                    </div>
                  </div>
                </div>

                {(sourceType === 'link' || sourceType === 'tema') && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-gray-900 font-semibold text-sm">{sourceType === 'link' ? 'Link de Referência' : 'Tema do Vídeo'}</Label>
                    <Input 
                      placeholder={sourceType === 'link' ? "Ex: https://seusite.com/artigo-interessante" : "Ex: 5 dicas para emagrecer rápido"} 
                      className="text-sm p-3 border-gray-200 focus-visible:ring-zinc-900 shadow-sm rounded-lg"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-semibold">Formato do Vídeo</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="border-gray-200 shadow-sm h-12 focus:ring-zinc-900">
                        <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[format]}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="curiosidades">Curiosidades</SelectItem>
                        <SelectItem value="top5">Top 5 / Lista</SelectItem>
                        <SelectItem value="polemica">Polêmica / Opinião Forte</SelectItem>
                        <SelectItem value="dicas">Dicas Práticas</SelectItem>
                        <SelectItem value="historia">História de Sucesso</SelectItem>
                        <SelectItem value="conspiracao">Teoria da Conspiração</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-900 font-semibold">Quantidade de Opções</Label>
                    <Select value={quantity} onValueChange={setQuantity}>
                      <SelectTrigger className="border-gray-200 shadow-sm h-12 focus:ring-zinc-900">
                        <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[quantity]}</span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Roteiro</SelectItem>
                        <SelectItem value="2">2 Roteiros</SelectItem>
                        <SelectItem value="3">3 Roteiros</SelectItem>
                        <SelectItem value="4">4 Roteiros</SelectItem>
                        <SelectItem value="5">5 Roteiros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-100 mt-2">
                  <div 
                    className="flex items-center gap-3 cursor-pointer select-none"
                    onClick={() => setHasCta(!hasCta)}
                  >
                    <div className="pt-0.5">
                      {hasCta ? (
                        <CheckCircle className="h-5 w-5 text-zinc-900" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                    <Label className="text-gray-900 font-semibold cursor-pointer text-base">
                      Incluir Chamada para Ação (CTA)?
                    </Label>
                  </div>
                  
                  {hasCta && (
                    <div className="space-y-3 pl-8 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Input 
                        placeholder="Ex: Curta e comente 'EU QUERO', ou Clique no link da bio..." 
                        className="text-sm p-3 border-gray-200 focus-visible:ring-zinc-900 shadow-sm rounded-lg"
                        value={cta}
                        onChange={(e) => setCta(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">A IA vai incorporar essa chamada no final dos roteiros.</p>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 bg-black hover:bg-zinc-800 text-white shadow-sm text-base font-bold transition-all rounded-xl mt-2"
                  onClick={handleGerarLote}
                  disabled={isGeneratingBatch}
                >
                  {isGeneratingBatch ? (
                    <span className="flex items-center"><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Gerando Ideias...</span>
                  ) : (
                    <span className="flex items-center">Gerar {quantity} Opções <ArrowRight className="ml-2 h-5 w-5" /></span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PASSO 2: SELEÇÃO */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
              <div className="h-1.5 w-full bg-zinc-900"></div>
              <CardHeader className="pb-5 border-b border-gray-100 bg-gray-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">2. Escolha os Melhores</CardTitle>
                  <CardDescription className="text-base text-gray-500 mt-1">Selecione e faça ajustes finais nos textos.</CardDescription>
                </div>
                <Button variant="outline" className="border-gray-200 shadow-sm rounded-xl bg-white" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              </CardHeader>
              <CardContent className="p-6 bg-gray-50/30">
                <div className="grid md:grid-cols-2 gap-6">
                  {generatedOptions.map((option, index) => {
                    const isSelected = selectedScripts.includes(index);
                    return (
                      <div 
                        key={index} 
                        className={`relative rounded-xl border-2 transition-all overflow-hidden flex flex-col ${isSelected ? 'border-zinc-900 bg-white shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                      >
                        <div 
                          className={`p-4 flex items-start gap-4 cursor-pointer transition-colors ${isSelected ? 'bg-gray-50' : 'bg-white'}`}
                          onClick={() => toggleSelection(index)}
                        >
                          <div className="pt-1">
                            {isSelected ? (
                              <CheckCircle className="h-6 w-6 text-zinc-900 fill-zinc-900/10" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">{option.title}</h3>
                          </div>
                        </div>
                        
                        <div className="px-4 pb-4 flex-1 flex flex-col bg-white">
                          <Textarea 
                            className="flex-1 min-h-[160px] resize-y text-sm p-3 border-gray-200 focus-visible:ring-zinc-900 shadow-sm rounded-lg bg-white"
                            value={option.script}
                            onChange={(e) => handleUpdateScript(index, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
                  <Button 
                    size="lg"
                    className={`h-14 shadow-sm text-lg font-bold transition-all rounded-xl px-8 ${selectedScripts.length > 0 ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    onClick={() => {
                      if (selectedScripts.length > 0) setCurrentStep(3);
                    }}
                    disabled={selectedScripts.length === 0}
                  >
                    Continuar para Produção ({selectedScripts.length} Selecionados) <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* PASSO 3: CONFIGURAÇÕES E PRODUÇÃO */}
        {currentStep === 3 && (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2">
              <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
                <div className="h-1.5 w-full bg-zinc-900"></div>
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-5 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">3. Configurações Finais</CardTitle>
                    <CardDescription className="text-base text-gray-500 mt-1">Defina voz, legenda e trilha sonora.</CardDescription>
                  </div>
                  <Button variant="outline" className="border-gray-200 shadow-sm rounded-xl bg-white" onClick={() => setCurrentStep(2)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs defaultValue="geral" className="w-full">
                    <div className="px-6 pt-5">
                      <TabsList className="bg-gray-100 p-1 rounded-lg w-full grid grid-cols-3 !h-auto">
                        <TabsTrigger value="geral" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Locutor</TabsTrigger>
                        <TabsTrigger value="legenda" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Legendas</TabsTrigger>
                        <TabsTrigger value="audio" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Áudio</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="geral" className="p-6 space-y-6 outline-none">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-gray-700">Locutor(a) IA</Label>
                          <Select value={voz} onValueChange={(v) => v && setVoz(v)}>
                            <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900">
                              <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[voz]}</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt-BR-AntonioNeural">Antônio (Masculino - Forte/Grave)</SelectItem>
                              <SelectItem value="pt-BR-JulioNeural">Júlio (Masculino - Jovem)</SelectItem>
                              <SelectItem value="pt-BR-FranciscaNeural">Francisca (Feminina - Enérgica)</SelectItem>
                              <SelectItem value="pt-BR-ThalitaNeural">Thalita (Feminina - Suave)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-700">Velocidade da Narração</Label>
                          <Select value={velocidade} onValueChange={(v) => v && setVelocidade(v)}>
                            <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900">
                              <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[velocidade]}</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0.9">Lento (0.9x)</SelectItem>
                              <SelectItem value="1.0">Normal (1.0x)</SelectItem>
                              <SelectItem value="1.15">Dinâmico (1.15x)</SelectItem>
                              <SelectItem value="1.3">Muito Rápido (1.3x)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="legenda" className="p-6 space-y-6 outline-none">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-gray-700">Fonte da Legenda</Label>
                          <Select value={fonte} onValueChange={(v) => v && setFonte(v)}>
                            <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900">
                              <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[fonte]}</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Roboto-Black">Roboto Black (Padrão Tiktok)</SelectItem>
                              <SelectItem value="Montserrat-Bold">Montserrat Bold</SelectItem>
                              <SelectItem value="Impact">Impact (Meme clássico)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-700">Posição na Tela</Label>
                          <Select value={posicaoLegenda} onValueChange={(v) => v && setPosicaoLegenda(v)}>
                            <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900">
                              <span className="flex flex-1 text-left line-clamp-1">{SELECT_LABELS[posicaoLegenda]}</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top">Topo</SelectItem>
                              <SelectItem value="center">Centro</SelectItem>
                              <SelectItem value="bottom">Rodapé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-gray-700">Cor do Texto</Label>
                          <div className="flex gap-2 items-center">
                            <Input type="color" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} className="w-12 p-1 h-10 cursor-pointer rounded-md border-gray-200 shadow-sm" />
                            <Input type="text" value={corTexto} onChange={(e) => setCorTexto(e.target.value)} className="flex-1 font-mono uppercase text-sm border-gray-200 shadow-sm focus-visible:ring-zinc-900" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-gray-700">Cor do Contorno</Label>
                          <div className="flex gap-2 items-center">
                            <Input type="color" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="w-12 p-1 h-10 cursor-pointer rounded-md border-gray-200 shadow-sm" />
                            <Input type="text" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="flex-1 font-mono uppercase text-sm border-gray-200 shadow-sm focus-visible:ring-zinc-900" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="audio" className="p-6 space-y-6 outline-none">
                      <div className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <div className="flex justify-between items-center">
                          <Label className="text-gray-900 font-semibold text-base">
                            Volume da Música de Fundo
                          </Label>
                          <Badge variant="outline" className="text-gray-900 bg-white border-gray-200 shadow-sm px-3 py-1 font-bold text-sm rounded-full">
                            {bgmVolume}%
                          </Badge>
                        </div>
                        <Slider 
                          value={bgmVolume} 
                          onValueChange={(v) => setBgmVolume(v as number[])} 
                          max={100} 
                          step={1}
                          className="w-full py-2 cursor-pointer"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 mt-10 lg:mt-0">
              <Card className="border-gray-200 shadow-sm sticky top-8 overflow-hidden rounded-xl bg-white">
                <div className="h-1.5 w-full bg-emerald-500"></div>
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-5">
                  <CardTitle className="text-xl text-gray-900">
                    Resumo e Produção
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6 relative">
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">Vídeos para Produzir</span>
                      <Badge variant="secondary" className="bg-white text-gray-900 font-bold border border-gray-200">
                        {selectedScripts.length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 font-medium">Custo Total</span>
                      <Badge variant="secondary" className="bg-white text-gray-900 font-bold border border-gray-200">
                        {selectedScripts.length * 10} Créditos
                      </Badge>
                    </div>
                    <div className="h-px bg-gray-200 w-full"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">Seu Saldo Restante</span>
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                        {isLoading ? "..." : `${credits} Créditos`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button 
                      size="lg" 
                      className={`w-full h-14 shadow-sm text-lg font-bold transition-all rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white`}
                      onClick={handleColocarNaFila}
                      disabled={isFilaLoading || selectedScripts.length === 0}
                    >
                      {isFilaLoading ? "Enviando..." : `Colocar ${selectedScripts.length} na Fila`}
                    </Button>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
                      Tempo estimado: <span className="text-gray-900 font-semibold">~{Math.max(2, selectedScripts.length * 1.5)} minutos</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
