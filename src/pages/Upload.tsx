import { createSignal, type Component } from "solid-js";
import { Camera, Upload as UploadIcon, Activity, Image as ImageIcon, CheckCircle2, AlertCircle } from "lucide-solid";
import { supabase } from "../lib/supabase";
import { useNavigate } from "@solidjs/router"

const Upload: Component = () => {
  const [image, setImage] = createSignal<string | null>(null);
  const [file, setFile] = createSignal<File | null>(null);
  const [uploading, setUploading] = createSignal(false);
  const [status, setStatus] = createSignal<{ type: 'success' | 'error', msg: string } | null>(null);
  const navigate = useNavigate();

  const handleCapture = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      const selectedFile = target.files[0];
      setFile(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setStatus(null); 
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const sendToAI = async () => {
    const currentFile = file();
    if (!currentFile) return;

    setUploading(true);
    setStatus(null); 
    
    try {
      // 1. Subida a Supabase (Tu código original)
      const fileExt = currentFile.name.split('.').pop() || 'jpg';
      const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('fotos-analisis')
        .upload(fileName, currentFile);

      if (error) throw error;

      // Actualizamos el estado para que el usuario sepa qué está pasando
      setStatus({ type: 'success', msg: '¡Imagen guardada! Analizando con la IA...' });

      // --- 2. NUEVA CONEXIÓN AL BACKEND DE PYTHON ---
      const formData = new FormData();
      formData.append("file", currentFile); // "file" es la palabra clave que FastAPI espera

      const response = await fetch("https://tronixx19-cancerapp-api.hf.space/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("El motor de IA no responde. Verifica que Uvicorn esté encendido.");
      }

      const iaData = await response.json(); 
      
      // Imprimimos en la consola del navegador para ver qué respondió realmente Python
      console.log("Respuesta de la IA:", iaData);

      // Si Python mandó un error interno, lo atrapamos y detenemos el proceso
      if (iaData.error) {
        throw new Error(iaData.error);
      }

      // Si no hay error, continuamos normalmente...
      setStatus({ type: 'success', msg: '¡Análisis completado!' });

      setTimeout(() => {
        navigate("/results", { 
          state: { 
            diagnostico: iaData.prediction,
            confianza: iaData.confidence_score
          } 
        });
      }, 1000);
      
    } catch (error: any) {
      console.error(error);
      setStatus({ type: 'error', msg: "Error: " + (error.message || "Fallo en la red") });
    } finally {
      setUploading(false); 
    }
  };

  return (

    <div class="min-h-screen pt-20 flex flex-col items-center justify-center p-6 bg-medical-light/30 dark:bg-slate-950 transition-colors duration-300">

      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white transition-colors">Análisis de Imagen</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">Captura o sube una foto de la zona afectada para la IA</p>
        </div>
        <div class="relative w-full h-64 mb-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
          {image() ? (
            <img src={image()!} class="w-full h-full object-contain p-2" alt="Previsualización" />
          ) : (
            <div class="flex flex-col items-center text-slate-400 dark:text-slate-500">
              <ImageIcon size={48} class="mb-3 opacity-50" />
              <p class="text-sm font-medium">No hay imagen seleccionada</p>
            </div>
          )}
        </div>
        {status() && (
          <div class={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${status()?.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
            {status()?.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status()?.msg}
          </div>
        )}

        <input type="file" accept="image/*" capture="environment" onChange={handleCapture} class="hidden" id="camera-input" />
        <input type="file" accept="image/*" onChange={handleCapture} class="hidden" id="gallery-input" />
        
        <div class="flex gap-4 mb-6">
          <label for="camera-input" class="flex-1 flex justify-center items-center gap-2 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition-colors shadow-sm">
            <Camera size={20} /> Cámara
          </label>

          <label for="gallery-input" class="flex-1 flex justify-center items-center gap-2 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-semibold rounded-xl cursor-pointer transition-colors">
            <UploadIcon size={20} /> Galería
          </label>
        </div>
        {image() && (
          <button 
            onClick={sendToAI}
            disabled={uploading()}
            class="w-full flex justify-center items-center gap-2 py-4 bg-medical hover:bg-medical-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-medical/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading() ? "Subiendo a la nube..." : <><Activity size={22} /> Analizar con IA</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default Upload;