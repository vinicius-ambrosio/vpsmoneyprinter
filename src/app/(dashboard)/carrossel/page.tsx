"use client"

import { useState } from "react"
import { ArrowRight, Loader2, Images as ImagesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { useCredits } from "@/components/CreditsProvider"

export default function CarrosselPage() {
  const { credits, isLoading } = useCredits()
  
  // Form States
  const [prompt, setPrompt] = useState("")
  
  // Geral
  const [cta, setCta] = useState("")
  const [quantidadeSlides, setQuantidadeSlides] = useState("5")



  // Design (Textos/Legendas)
  const [fonte, setFonte] = useState("Roboto-Black")
  const [corTexto, setCorTexto] = useState("#FFFFFF")
  const [corFundo, setCorFundo] = useState("#000000")
  
  // Audio
  const [musicaFundo, setMusicaFundo] = useState("viral-1")
  const [bgmVolume, setBgmVolume] = useState([20])

  // Lote states
  const [urlIndividual, setUrlIndividual] = useState("")
  const [isReadingSite, setIsReadingSite] = useState(false)

  const handleLerSite = async () => {
    if (!urlIndividual) return;
    setIsReadingSite(true);
    
    try {
      const savedContext = localStorage.getItem("brandContext");
      const brandContext = savedContext ? JSON.parse(savedContext) : null;

      const res = await fetch('/api/read-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlIndividual, brandContext })
      });
      const data = await res.json();
      
      if (res.ok && data.text) {
        setPrompt(data.text);
      } else {
        alert(data.error || "Erro ao ler site");
      }
    } catch (error) {
      alert("Erro ao conectar com a API");
    } finally {
      setIsReadingSite(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Bonito */}
      <div className="bg-white border-b border-gray-200 px-6 py-8 mb-8">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <div className="h-14 w-14 bg-zinc-900 rounded-xl flex items-center justify-center shadow-sm">
            <ImagesIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gerador de Carrosséis</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Crie slideshows e carrosséis com fotos reais (Pexels) a partir de links ou textos.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-8">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: O Roteiro */}
          <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
            <div className="h-1.5 w-full bg-zinc-900"></div>
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-gray-900">O Conteúdo</CardTitle>
              <CardDescription className="text-base text-gray-500">Qual será o tema do seu carrossel?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Extração por Link */}
              <div className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <Label className="text-gray-900 font-semibold">
                  Importar de um Link ou Notícia
                </Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ex: g1.globo.com/noticia..." 
                    className="flex-1 bg-white border-gray-200 shadow-sm focus-visible:ring-zinc-900"
                    value={urlIndividual}
                    onChange={(e) => setUrlIndividual(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLerSite()}
                  />
                  <Button 
                    className="bg-black hover:bg-zinc-800 text-white shadow-sm transition-all px-5 rounded-lg"
                    onClick={handleLerSite}
                    disabled={isReadingSite || !urlIndividual}
                  >
                    {isReadingSite ? (
                      <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extraindo</span>
                    ) : (
                      <span className="flex items-center">Ler Site <ArrowRight className="h-4 w-4 ml-2" /></span>
                    )}
                  </Button>
                </div>
              </div>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-bold tracking-wider rounded-full">Ou digite manualmente</span>
                </div>
              </div>

              {/* Textarea Manual */}
              <div className="space-y-3">
                <Label className="text-gray-900 font-semibold">
                  Seu Texto ou Ideia
                </Label>
                <Textarea 
                  placeholder="Ex: Top 5 dicas de organização para o home office..." 
                  className="min-h-[160px] resize-y text-base p-4 border-gray-200 focus-visible:ring-zinc-900 shadow-sm rounded-xl"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Configurações Avançadas */}
          <Card className="border-gray-200 shadow-sm rounded-xl bg-white">
            <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-5">
              <CardTitle className="text-lg text-gray-900">Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="geral" className="w-full">
                <div className="px-6 pt-5">
                  <TabsList className="bg-gray-100 p-1 rounded-lg w-full grid grid-cols-3 h-auto">
                    <TabsTrigger value="geral" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Geral</TabsTrigger>
                    <TabsTrigger value="texto" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Textos</TabsTrigger>
                    <TabsTrigger value="audio" className="rounded-md py-2.5 !h-auto data-active:bg-white data-active:shadow-sm data-active:text-gray-900 text-gray-500 font-medium">Áudio</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* ABA GERAL */}
                <TabsContent value="geral" className="p-6 space-y-6 outline-none">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-gray-700">Quantidade de Slides</Label>
                      <Select value={quantidadeSlides} onValueChange={(v) => v && setQuantidadeSlides(v)}>
                        <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Slides (Curto)</SelectItem>
                          <SelectItem value="5">5 Slides (Recomendado)</SelectItem>
                          <SelectItem value="7">7 Slides (Longo)</SelectItem>
                          <SelectItem value="10">10 Slides (Muito Longo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-gray-700">Chamada para Ação (CTA Final)</Label>
                    <Input placeholder="Ex: Clica no link da bio para saber mais!" value={cta} onChange={(e) => setCta(e.target.value)} className="border-gray-200 shadow-sm focus-visible:ring-zinc-900" />
                    <p className="text-xs text-gray-500">Aparecerá no último slide do seu carrossel.</p>
                  </div>
                </TabsContent>


                {/* ABA TEXTOS */}
                <TabsContent value="texto" className="p-6 space-y-6 outline-none">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-gray-700">Fonte do Texto</Label>
                      <Select value={fonte} onValueChange={(v) => v && setFonte(v)}>
                        <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Roboto-Black">Roboto Black (Padrão Tiktok)</SelectItem>
                          <SelectItem value="Montserrat-Bold">Montserrat Bold</SelectItem>
                          <SelectItem value="Impact">Impact (Meme clássico)</SelectItem>
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
                      <Label className="text-gray-700">Cor do Fundo do Texto</Label>
                      <div className="flex gap-2 items-center">
                        <Input type="color" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="w-12 p-1 h-10 cursor-pointer rounded-md border-gray-200 shadow-sm" />
                        <Input type="text" value={corFundo} onChange={(e) => setCorFundo(e.target.value)} className="flex-1 font-mono uppercase text-sm border-gray-200 shadow-sm focus-visible:ring-zinc-900" />
                      </div>
                    </div>
                  </div>

                  {/* PREVIEW DA LEGENDA */}
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Label className="mb-3 block text-gray-500 font-semibold">Preview Visual (Aproximado)</Label>
                    <div className="w-full h-40 bg-zinc-900 rounded-xl overflow-hidden relative flex items-center justify-center border border-zinc-800 shadow-inner" style={{ backgroundImage: 'linear-gradient(45deg, #18181b 25%, #09090b 25%, #09090b 50%, #18181b 50%, #18181b 75%, #09090b 75%, #09090b 100%)', backgroundSize: '20px 20px' }}>
                      <div className="absolute inset-0 bg-black/40"></div>
                      <span 
                        className="relative z-10 text-4xl font-black uppercase text-center px-4 leading-tight tracking-tight"
                        style={{
                          color: corTexto,
                          fontFamily: fonte === 'Impact' ? 'Impact, sans-serif' : fonte === 'Montserrat-Bold' ? '"Montserrat", sans-serif' : '"Roboto", sans-serif',
                          WebkitTextStroke: `4px ${corFundo}`,
                          paintOrder: 'stroke fill',
                          textShadow: `0px 4px 16px ${corFundo}90`
                        }}
                      >
                        TEXTO NO SLIDE
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* ABA AUDIO */}
                <TabsContent value="audio" className="p-6 space-y-6 outline-none">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <Label className="text-gray-700">Música Viral</Label>
                      <Select value={musicaFundo} onValueChange={(v) => v && setMusicaFundo(v)}>
                        <SelectTrigger className="border-gray-200 shadow-sm focus:ring-zinc-900"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viral-1">Phonk Motivacional</SelectItem>
                          <SelectItem value="viral-2">Batida Lo-fi Relaxante</SelectItem>
                          <SelectItem value="viral-3">Pop Upbeat</SelectItem>
                          <SelectItem value="none">Sem Música</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

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
                    <p className="text-sm text-gray-500">Volume ideal para música de fundo em slideshows é entre <span className="font-semibold text-gray-900">20% e 50%</span>.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-gray-200 shadow-sm sticky top-8 overflow-hidden rounded-xl bg-white">
            <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-5">
              <CardTitle className="text-lg text-gray-900">
                Resumo da Criação
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6 space-y-6 relative">
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Custo do Carrossel</span>
                  <Badge variant="secondary" className="bg-white text-gray-900 hover:bg-gray-50 font-bold border border-gray-200">
                    1 Crédito
                  </Badge>
                </div>
                <div className="h-px bg-gray-200 w-full"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Seu Saldo Restante</span>
                  <span className="text-sm font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-md">
                    {isLoading ? "..." : `${credits} Créditos`}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  size="lg" 
                  className="w-full h-14 bg-black hover:bg-zinc-800 text-white shadow-sm text-lg font-bold transition-all rounded-xl"
                >
                  Criar Slideshow
                </Button>
                <p className="text-center text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1">
                  Tempo estimado: <span className="text-gray-900 font-semibold">~1 minuto</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
