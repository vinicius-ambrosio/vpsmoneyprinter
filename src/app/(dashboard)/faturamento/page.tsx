"use client"

import { useState } from "react"
import { CreditCard, Zap, CheckCircle2, Clock, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useCredits } from "@/components/CreditsProvider"

export default function FaturamentoPage() {
  const { credits: userCredits, isLoading } = useCredits()
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Mock de transações para o histórico
  const transactions = [
    {
      id: "tx_123456",
      date: "03/09/2026",
      plan: "Pacote Básico",
      credits: 50,
      amount: "R$ 47,00",
      status: "completed"
    },
    {
      id: "tx_123455",
      date: "15/08/2026",
      plan: "Pacote Pro",
      credits: 200,
      amount: "R$ 147,00",
      status: "completed"
    },
    {
      id: "tx_123454",
      date: "01/08/2026",
      plan: "Pacote Básico",
      credits: 50,
      amount: "R$ 47,00",
      status: "failed"
    }
  ]

  const packages = [
    {
      id: "basic",
      name: "Básico",
      credits: 50,
      price: "R$ 47,00",
      pricePerVideo: "R$ 0,94 por vídeo",
      popular: false,
      features: ["50 vídeos gerados", "Sem expiração", "Suporte padrão"]
    },
    {
      id: "pro",
      name: "Pro",
      credits: 200,
      price: "R$ 147,00",
      pricePerVideo: "R$ 0,73 por vídeo",
      popular: true,
      features: ["200 vídeos gerados", "Sem expiração", "Suporte prioritário"]
    },
    {
      id: "agency",
      name: "Agência",
      credits: 1000,
      price: "R$ 497,00",
      pricePerVideo: "R$ 0,49 por vídeo",
      popular: false,
      features: ["1000 vídeos gerados", "Sem expiração", "Gerente de conta"]
    }
  ]

  const handlePurchase = async (pkgId: string) => {
    setIsPurchasing(true)
    // Aqui seria feita a integração com o Stripe
    setTimeout(() => {
      alert(`Redirecionando para o checkout do pacote ${pkgId}...`)
      setIsPurchasing(false)
    }, 1000)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Faturamento e Créditos</h1>
        <p className="text-gray-500 mt-2">Gerencie seu saldo, compre novos pacotes e veja o histórico de transações.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {/* Saldo Atual */}
        <Card className="md:col-span-1 border-gray-200 shadow-sm bg-zinc-900 text-white rounded-xl">
          <CardHeader>
            <CardTitle className="text-gray-400 text-sm font-medium uppercase tracking-wider">Saldo Atual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black">
                {isLoading ? "..." : userCredits}
              </span>
              <span className="text-gray-400 font-medium">créditos</span>
            </div>
            <p className="text-sm text-gray-500">
              {isLoading ? "Carregando saldo..." : `Equivale a aprox. ${userCredits} vídeos gerados pela IA.`}
            </p>
          </CardContent>
        </Card>

        {/* Informações Rápidas */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gray-100 text-gray-700 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Como funciona?</h3>
              </div>
              <p className="text-sm text-gray-500">Cada vídeo gerado consome 1 crédito do seu saldo. Os créditos não expiram.</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6 flex flex-col justify-center h-full">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-50 text-green-700 rounded-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-gray-900">Pagamento Seguro</h3>
              </div>
              <p className="text-sm text-gray-500">Aceitamos Pix e os principais cartões de crédito via Stripe.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pacotes de Créditos */}
      <div className="mb-12">
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">Comprar mais créditos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={`relative flex flex-col border-gray-200 shadow-sm transition-all rounded-xl hover:border-gray-300 hover:shadow-md ${pkg.popular ? 'border-zinc-900 ring-2 ring-zinc-900/10' : ''}`}>
              {pkg.popular && (
                <div className="absolute -top-3 inset-x-0 flex justify-center">
                  <Badge className="bg-black hover:bg-zinc-800 text-white uppercase text-[10px] font-bold tracking-wider py-1 px-3">
                    Mais Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pt-8 pb-4">
                <CardTitle className="text-lg text-gray-700">{pkg.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-black text-gray-900">{pkg.credits}</span>
                  <span className="text-gray-500 font-medium ml-1">créditos</span>
                </div>
                <CardDescription className="text-gray-900 font-bold mt-2 text-lg">
                  {pkg.price}
                </CardDescription>
                <p className="text-xs text-gray-400 mt-1">{pkg.pricePerVideo}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3 text-sm text-gray-600 mt-4">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full gap-2 rounded-lg font-semibold ${pkg.popular ? 'bg-black hover:bg-zinc-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isPurchasing}
                >
                  Comprar {pkg.name} <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Histórico de Transações */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 mb-6">Histórico de Transações</h2>
        <Card className="border-gray-200 shadow-sm overflow-hidden rounded-xl bg-white">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="text-gray-600 font-semibold">Data</TableHead>
                <TableHead className="text-gray-600 font-semibold">Descrição</TableHead>
                <TableHead className="text-gray-600 font-semibold">Valor</TableHead>
                <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-600 font-semibold">Recibo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className="border-gray-100">
                  <TableCell className="text-gray-500 font-medium">{tx.date}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">{tx.plan}</div>
                    <div className="text-xs text-gray-500">+{tx.credits} créditos</div>
                  </TableCell>
                  <TableCell className="font-medium text-gray-900">{tx.amount}</TableCell>
                  <TableCell>
                    {tx.status === 'completed' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 font-medium">
                        Concluído
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 font-medium">
                        Falhou
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-gray-700 hover:text-black hover:bg-gray-100" disabled={tx.status !== 'completed'}>
                      <FileText className="h-4 w-4 mr-2" />
                      Recibo
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

    </div>
  )
}
