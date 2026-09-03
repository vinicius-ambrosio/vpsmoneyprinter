import { Download, Clock, Loader2, CheckCircle2, Play, Trash2, VideoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBody
} from "@/components/ui/table"
import { createClient } from "@/utils/supabase/server"

export default async function HistoricoPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let videos: any[] = []
  
  if (user) {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      
    if (data) {
      videos = data
    }
  }

  const formatData = (dateString: string) => {
    const data = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(data)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meus Vídeos</h1>
        <p className="text-gray-500 mt-2">Acompanhe a fila de processamento e baixe seus vídeos prontos.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 border-b border-gray-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[400px] text-gray-600 font-semibold">Tema / Roteiro</TableHead>
              <TableHead className="text-gray-600 font-semibold">Estilo</TableHead>
              <TableHead className="text-gray-600 font-semibold">Data</TableHead>
              <TableHead className="text-gray-600 font-semibold">Status</TableHead>
              <TableHead className="text-right text-gray-600 font-semibold">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  <VideoIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  Nenhum vídeo criado ainda. Vá para a página inicial para gerar seu primeiro gancho!
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Play className="h-4 w-4" />
                      </div>
                      <span className="truncate max-w-[300px]">{video.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500 capitalize">{video.style || 'Automático'}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-500">{formatData(video.created_at)}</span>
                  </TableCell>
                  <TableCell>
                    {video.status === "completed" && (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1.5 font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Pronto
                      </Badge>
                    )}
                    {video.status === "processing" && (
                      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1.5 font-medium">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Gerando
                      </Badge>
                    )}
                    {(video.status === "draft" || !video.status) && (
                      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200 gap-1.5 font-medium">
                        <Clock className="h-3.5 w-3.5" /> Na Fila
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-black hover:bg-gray-100" disabled={video.status !== 'pronto'}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
