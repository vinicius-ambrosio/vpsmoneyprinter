"use client"

import { useState } from "react"
import { RefreshCcw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { retryVideo } from "@/app/actions"

export function RetryVideoButton({ videoId }: { videoId: string }) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const res = await retryVideo(videoId);
      if (res.error) {
        alert(res.error);
      }
    } catch (error) {
      alert("Erro ao tentar novamente");
    } finally {
      setIsRetrying(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      title="Tentar novamente"
      className="text-gray-400 hover:text-blue-600 hover:bg-blue-50"
      onClick={handleRetry}
      disabled={isRetrying}
    >
      {isRetrying ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCcw className="h-4 w-4" />
      )}
    </Button>
  )
}
