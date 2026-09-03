import { login, signup } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, Quote } from 'lucide-react'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen bg-white w-full">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute top-[60%] -right-[20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10">
          <Link href="/">
            <Image 
              src="/Hookify - Logo SF.png" 
              alt="Hookify" 
              width={160} 
              height={46} 
              className="h-10 w-auto brightness-0 invert" 
              priority 
            />
          </Link>
        </div>
        
        <div className="relative z-10 max-w-lg">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white border border-white/10 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Inteligência Artificial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Pare de perder tempo pensando no que gravar.
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Gere ganchos magnéticos em segundos e transforme visualizações em seguidores fiéis para suas redes sociais.
          </p>
        </div>
        
        <div className="relative z-10 flex items-center justify-between text-sm font-medium text-zinc-500">
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4" />
            <span>Design System Premium</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors">Termos</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen relative">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 flex justify-center">
            <Link href="/">
              <Image 
                src="/Hookify - Logo SF.png" 
                alt="Hookify Logo" 
                width={150} 
                height={42} 
                className="h-10 w-auto object-contain" 
                priority 
              />
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo(a)</h2>
            <p className="text-gray-500 mt-2 text-base">Acesse sua conta ou cadastre-se para começar.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="flex w-full bg-gray-100 p-1 rounded-xl mb-8 h-12">
              <TabsTrigger 
                value="login" 
                className="flex-1 rounded-lg text-sm font-semibold transition-all data-active:bg-white data-active:text-gray-900 data-active:shadow-sm text-gray-500 h-full border-none ring-0 outline-none"
              >
                Entrar
              </TabsTrigger>
              <TabsTrigger 
                value="register" 
                className="flex-1 rounded-lg text-sm font-semibold transition-all data-active:bg-white data-active:text-gray-900 data-active:shadow-sm text-gray-500 h-full border-none ring-0 outline-none"
              >
                Criar Conta
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form action={login} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium flex gap-3 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      required 
                      className="border-gray-200 bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 transition-all focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Senha</Label>
                      <Link href="#" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors">
                        Esqueceu?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      name="password" 
                      type="password"
                      placeholder="••••••••" 
                      required 
                      className="border-gray-200 bg-gray-50/50 focus:bg-white text-gray-900 rounded-xl h-12 px-4 transition-all focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <Button className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-14 font-semibold text-base transition-colors shadow-lg shadow-black/10 mt-6" type="submit">
                  Entrar na plataforma
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <form action={signup} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium flex gap-3 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-register" className="text-sm font-semibold text-gray-700">E-mail</Label>
                    <Input 
                      id="email-register" 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      required 
                      className="border-gray-200 bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 transition-all focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register" className="text-sm font-semibold text-gray-700">Senha</Label>
                    <Input 
                      id="password-register" 
                      name="password" 
                      type="password" 
                      placeholder="••••••••"
                      minLength={6}
                      required 
                      className="border-gray-200 bg-gray-50/50 focus:bg-white text-gray-900 rounded-xl h-12 px-4 transition-all focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <Button className="w-full bg-black hover:bg-zinc-800 text-white rounded-full h-14 font-semibold text-base transition-colors shadow-lg shadow-black/10 mt-6" type="submit">
                  Criar minha conta
                </Button>
                
                <p className="text-center text-sm text-gray-500 mt-6 font-medium">
                  Ao se cadastrar, você concorda com nossos{' '}
                  <Link href="#" className="text-black underline-offset-4 hover:underline transition-all">Termos</Link>
                  {' '}e{' '}
                  <Link href="#" className="text-black underline-offset-4 hover:underline transition-all">Privacidade</Link>.
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
