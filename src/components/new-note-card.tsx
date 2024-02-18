import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";


interface NewNoteCardProps{
  onNoteCreated:(content: string) => void
}

 let SpeechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps ) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false)
  const [content, setContent]= useState('');

  function handleStartEditar() {
    setShouldShowOnboarding(false);
  }

  function handleContentOnChange(event: ChangeEvent<HTMLTextAreaElement>) {
      setContent(event.target.value)

    if (event.target.value == "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event:FormEvent){
    event.preventDefault()

     if(content == ''){
      return
     }

    onNoteCreated(content)
    setContent('')
    setShouldShowOnboarding(true)
    toast.success("Nota criada com sucesso!")
  }

  function handleStartRecording(){
    
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    
    if (!isSpeechRecognitionAPIAvailable){
      alert('infelizmente seu navegador nao suporta a API de gravacao')
      return
    }

    setIsRecording(true)
    setShouldShowOnboarding(false)
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    
    SpeechRecognition = new SpeechRecognitionAPI()

    SpeechRecognition.lang = 'pt-BR'
    SpeechRecognition.continuous = true
    SpeechRecognition.maxAlternatives = 1
    SpeechRecognition.interimResults = true

    SpeechRecognition.onresult = (event) =>{
      const transcription = Array.from(event.results).reduce((text, result)=>{
          return text.concat(result[0].transcript)
      },'')
      setContent(transcription)
    }
    
    SpeechRecognition.onerror = (event) =>{
      console.error(event)
    }

    SpeechRecognition.start()
  }

  function handleStopRecording(){
    setIsRecording(false)

    if (SpeechRecognition != null){
     SpeechRecognition.stop()
    }
    
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sn font-medium text-slate-300">
          Adicionar notas
        </span>
        <p className="text-sn leading-6 text-slate-400">
          Grave uma nota em audio que sera convertida para texto
          automanticamente
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[100vh] a-full md:h-[70vh] bg-slate-700 md:rounded-md flex flex-col ">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5 ">
              <span className="text-sn font-medium text-slate-300">
                Adicionar notas
              </span>

              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400 ">
                  Comece <button type="button" onClick={handleStartRecording} className="font-medium text-lime-400 hover:underline"> gravando uma nota  </button> em áudio ou se preferir <button type="button" onClick={handleStartEditar} className="font-medium text-lime-400 hover:underline">utilize apenas texto. </button>
                </p>

               ) : (
                <textarea
                  autoFocus
                  onChange={handleContentOnChange}
                  value={content}
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                >
                </textarea>
              )}

            </div>
                {isRecording ? (

                  <button
                  type="button"
                  onClick={handleStopRecording}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100"
                  >
                  <div className="size-3 rounded-full bg-red-500 animate-pulse"/>
                  Gravando! (clique p/ interromper)
                  </button>

                ) : (
                  <button
                  type="button"
                  onClick={handleSaveNote}
                  className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-700"
                >
                  Salvar nota
                </button>
                )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
