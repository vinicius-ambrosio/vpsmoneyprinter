"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, PlaySquare, Settings, CreditCard, Sparkles, HelpCircle, MessageSquare, Layers, LogOut, Images, Lock, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { logout } from "@/app/(auth)/login/actions"
import { useCredits } from "@/components/CreditsProvider"

export function Sidebar() {
  const pathname = usePathname();
  const { credits, isLoading } = useCredits();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const SidebarContent = () => (
    <>
      <div className="px-5 pt-5 pb-2">
        <Link href="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
          <Image src="/Hookify - Logo SF.png" alt="Hookify Logo" width={140} height={40} className="h-8 w-auto" priority />
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className={cn(
            "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3">
            <LayoutDashboard className={cn("h-4 w-4", pathname === "/" ? "text-gray-900" : "text-gray-400")} />
            Criador
          </div>
        </Link>

        <div
          className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-gray-400 bg-gray-50/50 cursor-not-allowed opacity-60"
          title="Funcionalidade em breve"
        >
          <div className="flex items-center gap-3">
            <Images className="h-4 w-4 text-gray-400" />
            Carrossel
          </div>
          <Lock className="h-3.5 w-3.5 text-gray-400" />
        </div>
        
        <Link
          href="/historico"
          onClick={closeMobileMenu}
          className={cn(
            "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/historico" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <div className="flex items-center gap-3">
            <PlaySquare className={cn("h-4 w-4", pathname === "/historico" ? "text-gray-900" : "text-gray-400")} />
            Meus Vídeos
          </div>
        </Link>
        
        <div className="pt-4 pb-1">
          <p className="text-xs font-medium text-gray-400 px-3">CONTA</p>
        </div>

        <Link
          href="/faturamento"
          onClick={closeMobileMenu}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/faturamento" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <CreditCard className={cn("h-4 w-4", pathname === "/faturamento" ? "text-gray-900" : "text-gray-400")} />
          Faturamento
        </Link>

        <Link
          href="/configuracoes"
          onClick={closeMobileMenu}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/configuracoes" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          )}
        >
          <Settings className={cn("h-4 w-4", pathname === "/configuracoes" ? "text-gray-900" : "text-gray-400")} />
          Configurações
        </Link>
      </nav>

      <div className="p-3 mt-auto shrink-0">
        <nav className="space-y-1 mb-3 px-3">
          <a href="https://wa.me/5562993859686?text=Olá,%20preciso%20de%20ajuda%20com%20o%20Hookify!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
            <HelpCircle className="h-4 w-4 text-gray-400" /> Suporte
          </a>
          <a href="https://wa.me/5562993859686?text=Olá,%20tenho%20um%20feedback%20sobre%20o%20Hookify!" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-400" /> Feedback
          </a>
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
              <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500" /> Sair
            </button>
          </form>
        </nav>

        <div className="bg-zinc-900 rounded-2xl p-4 flex flex-col gap-1 text-white shadow-sm">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Seus Créditos</div>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <span className="text-gray-500 text-lg">Carregando...</span>
            ) : (
              credits
            )}
          </div>
          <Link href="/faturamento" onClick={closeMobileMenu} className="mt-3">
            <button className="w-full bg-white text-black font-semibold py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm">
              Adicionar Saldo
            </button>
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 w-full shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/Hookify - Logo SF.png" alt="Hookify Logo" width={110} height={32} className="h-7 w-auto" priority />
        </Link>
        <button onClick={() => setMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-white flex-col h-screen overflow-hidden border-r border-gray-100 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={closeMobileMenu}></div>
          <div className="relative flex w-64 max-w-sm flex-col bg-white h-full transform transition-transform duration-300 ease-in-out">
            <button onClick={closeMobileMenu} className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg z-50">
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
