"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { deleteVideo } from "@/app/actions"

export function DeleteVideoButton({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este vídeo da sua conta?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteVideo(videoId);
      if (res.error) {
        alert(res.error);
      }
    } catch (error) {
      alert("Erro ao excluir vídeo");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-gray-400 hover:text-red-600 hover:bg-red-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
