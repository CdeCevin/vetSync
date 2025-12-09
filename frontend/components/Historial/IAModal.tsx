"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Loader2, Search, FileText, BrainCircuit } from "lucide-react"
import { useAIService, IAHistorialResponse } from "@/hooks/useIAService"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAlertStore } from "@/hooks/use-alert-store"


interface AIQueryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIQueryModal({ isOpen, onClose }: AIQueryModalProps) {
  const { consultarHistorialIA, loadingAI } = useAIService()
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<IAHistorialResponse | null>(null)
  const { onOpen: openAlert } = useAlertStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
        openAlert("Error", "Ha ocurrido un problema con la consulta", "error")
        return}
    
    try {
      const data = await consultarHistorialIA(query)
      setResult(data)
    } catch (error) {
    openAlert("Error", "Ha ocurrido un problema con la consulta", "error")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" /> Asistente Clínico IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">

          {/* Formulario de busqueda */}
          <form onSubmit={handleSubmit} className="space-y-4  bg-background">
            <div className="relative">
              <Textarea 
                placeholder="Ej: Pacientes tratados con Amoxicilina que no mejoraron en 5 días..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="min-h-[100px] bg-white/30 resize-none text-base p-4 border-accent/10 focus:border-accent/30 focus:ring-accent"
              />
              <Button 
                type="submit" 
                disabled={loadingAI || !query.trim()}
                className="absolute bottom-3 right-3 bg-accent hover:bg-accent/70 text-white"
                size="sm"
              >
                {loadingAI && <Loader2 className="h-4 w-4 animate-spin mr-2" /> }
                Analizar
              </Button>
            </div>
          </form>

          {/* Resultados */}
          {result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="p-5 rounded-lg border border-accent/10 space-y-3">
                <h4 className="font-semibold text-accent flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Análisis General
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <HighlightedText text={result.analisis_general}/>
                </p>
                {result.resumen_paciente && (
                  <div className="mt-3 pt-3 border-t border-indigo-100">
                    <p className="text-sm font-medium text-accent">Resumen de Pacientes:</p>
                    <p className="text-sm text-slate-600"><HighlightedText text={result.resumen_paciente}/></p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-700 text-sm uppercase tracking-wider">
                  Registros Relacionados ({result.registros.length})
                </h4>
                
                {result.registros.map((reg) => (
                  <Card key={reg.id} className="p-4 border-l-4 border-l-accent shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h5 className="font-bold text-slate-800">{reg.paciente}</h5>
                        <p className="text-xs text-slate-500">{reg.fecha} • {reg.diagnostico_completo}</p>
                      </div>
                      <Badge variant="secondary" className="bg-accent/10 text-accent">
                        {reg.relevancia}% Relevancia
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mt-3">
                      <div className="bg-white p-2 rounded text-sm text-slate-600 italic border border-slate-100">
                        "<HighlightedText text={reg.fragmento_destacado} />"
                      </div>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">Por qué coincide:</span> <HighlightedText text={reg.razon}/>
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

//cambio de markdown a html
const HighlightedText = ({ text }: { text: string }) => {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={index} className="font-bold text-slate-900 px-0.5 rounded">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};