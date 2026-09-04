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
  const searchParamsAwaited = await searchParams;
  const error = searchParamsAwaited?.error;
  const message = searchParamsAwaited?.message;
  const view = searchParamsAwaited?.view === 'register' ? 'register' : 'login';

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
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 min-h-screen relative bg-gray-50 lg:bg-white">
        <div className="w-full max-w-[420px] bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:shadow-none lg:p-0 border border-gray-100 lg:border-none">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image 
                src="/Hookify - Logo SF.png" 
                alt="Hookify Logo" 
                width={140} 
                height={40} 
                className="h-9 w-auto object-contain" 
                priority 
              />
            </Link>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              {view === 'register' ? 'Crie sua conta' : 'Bem-vindo(a) de volta'}
            </h2>
            <p className="text-gray-500 mt-2 text-base">
              {view === 'register' 
                ? 'Preencha seus dados para começar.'
                : 'Acesse sua conta para continuar.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 font-medium flex gap-3 items-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-600 border border-emerald-100 font-medium flex gap-3 items-start">
              <Sparkles className="shrink-0 mt-0.5 h-4 w-4" />
              <span>{message}</span>
            </div>
          )}

          {view === 'register' ? (
            <form action={signup} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name-register" className="text-sm font-semibold text-gray-700">Nome</Label>
                  <Input 
                    id="name-register" 
                    name="name" 
                    type="text" 
                    placeholder="Seu nome" 
                    required 
                    className="border-gray-200 bg-gray-50/50 focus:bg-white text-gray-900 placeholder:text-gray-400 rounded-xl h-12 px-4 transition-all focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
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
              
              <div className="mt-6 text-center space-y-4">
                <p className="text-sm text-gray-500 font-medium">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-black font-semibold hover:underline transition-all">
                    Entrar
                  </Link>
                </p>
                <p className="text-xs text-gray-400 font-medium px-4">
                  Ao se cadastrar, você concorda com nossos{' '}
                  <Link href="/termos" className="underline hover:text-gray-600 transition-all">Termos</Link>
                  {' '}e{' '}
                  <Link href="/privacidade" className="underline hover:text-gray-600 transition-all">Privacidade</Link>.
                </p>
              </div>
            </form>
          ) : (
            <form action={login} className="space-y-5">
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

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 font-medium">
                  Ainda não tem conta?{' '}
                  <Link href="/cadastro" className="text-black font-semibold hover:underline transition-all">
                    Criar conta
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
