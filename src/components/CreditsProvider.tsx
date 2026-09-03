"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getUserCredits } from '@/app/actions'

interface CreditsContextType {
  credits: number
  isLoading: boolean
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType>({
  credits: 0,
  isLoading: true,
  refreshCredits: async () => {},
})

export function useCredits() {
  return useContext(CreditsContext)
}

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCredits = async () => {
    setIsLoading(true)
    try {
      const res = await getUserCredits()
      if (res && res.credits !== undefined) {
        setCredits(res.credits)
      }
    } catch (error) {
      console.error("Erro ao buscar créditos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  return (
    <CreditsContext.Provider value={{ credits, isLoading, refreshCredits: fetchCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}
