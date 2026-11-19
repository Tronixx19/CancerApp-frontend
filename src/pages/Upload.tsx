import { createSignal, Show, type Component } from "solid-js";
import {
  Camera,
  Upload as UploadIcon,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-solid";
import { useNavigate } from "@solidjs/router";

const Upload: Component = () => {
  const [image, setImage] = createSignal<string | null>(null);
  const [file, setFile] = createSignal<File | null>(null);
  const [tiempoLesion, setTiempoLesion] = createSignal<string>("");
  const [detalleLesion, setDetalleLesion] = createSignal<string>("");
  const [uploading, setUploading] = createSignal(false);
  const [status, setStatus] = createSignal<{ type: "success" | "error"; msg: string } | null>(null);
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

    if (!tiempoLesion()) {
      setStatus({
        type: "error",
        msg: "Indica desde cuándo notaste la lesión antes de analizar.",
      });
      return;
    }

    setUploading(true);
    setStatus({ type: "success", msg: "Analizando imagen de forma segura con la IA..." });

    try {
      // Envío directo en memoria a FastAPI (sin almacenamiento persistente en BD)
      const formData = new FormData();
      formData.append("file", currentFile);
      formData.append("lesion_duration", tiempoLesion());
      if (detalleLesion().trim()) {
        formData.append("lesion_notes", detalleLesion().trim());
      }

      const response = await fetch("https://tronixx19-cancerapp-api.hf.space/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("El motor de IA no responde. Verifica el servicio en Hugging Face o Uvicorn.");
      }

      const iaData = await response.json();
      console.log("Respuesta de la IA:", iaData);

      if (iaData.error) {
        throw new Error(iaData.error);
      }

      setStatus({ type: "success", msg: "¡Análisis completado!" });

      setTimeout(() => {
        navigate("/results", {
          state: {
            diagnostico: iaData.prediction,
            confianza: iaData.confidence_score,
            tiempoLesion: tiempoLesion(),
            detalleLesion: detalleLesion().trim(),
          },
        });
      }, 1000);
    } catch (error: unknown) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : "Fallo en la red";
      setStatus({ type: "error", msg: "Error: " + errorMsg });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div class="min-h-screen pt-20 flex flex-col items-center justify-center p-6 bg-medical-light/30 dark:bg-slate-950 transition-colors duration-300">
      <div class="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-800 dark:text-white transition-colors">
            Análisis de Imagen
          </h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 transition-colors">
            Captura o sube una foto de la zona afectada para la IA
          </p>
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

        {/* Cuadro de antigüedad de la lesión al tener imagen */}
        <Show when={image()}>
          <div class="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 transition-colors">
            <label
              for="tiempo-lesion"
              class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <Clock size={18} class="text-medical" />
              ¿Desde cuándo notaste la lesión que te llevó a revisarte?
            </label>

            <select
              id="tiempo-lesion"
              value={tiempoLesion()}
              onChange={(e) => setTiempoLesion(e.currentTarget.value)}
              class="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-medical"
            >
              <option value="" disabled>
                Selecciona hace cuánto tiempo la notaste
              </option>
              <option value="menos_1_semana">Menos de 1 semana</option>
              <option value="1_a_2_semanas">Entre 1 y 2 semanas</option>
              <option value="2_a_4_semanas">Entre 2 y 4 semanas</option>
              <option value="1_a_3_meses">Entre 1 y 3 meses</option>
              <option value="mas_3_meses">Más de 3 meses</option>
              <option value="no_recuerda">No lo recuerdo con exactitud</option>
            </select>

            <input
              type="text"
              value={detalleLesion()}
              onInput={(e) => setDetalleLesion(e.currentTarget.value)}
              placeholder="Comentario opcional (ej. molestia, sangrado, cambio reciente)..."
              class="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-medical"
            />
          </div>
        </Show>

        {status() && (
          <div
            class={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-medium transition-colors ${
              status()?.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {status()?.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            {status()?.msg}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          class="hidden"
          id="camera-input"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleCapture}
          class="hidden"
          id="gallery-input"
        />

        <div class="flex gap-4 mb-6">
          <label
            for="camera-input"
            class="flex-1 flex justify-center items-center gap-2 py-3 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-semibold rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            <Camera size={20} /> Cámara
          </label>

          <label
            for="gallery-input"
            class="flex-1 flex justify-center items-center gap-2 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-semibold rounded-xl cursor-pointer transition-colors"
          >
            <UploadIcon size={20} /> Galería
          </label>
        </div>

        {image() && (
          <button
            onClick={sendToAI}
            disabled={uploading()}
            class="w-full flex justify-center items-center gap-2 py-4 bg-medical hover:bg-medical-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-medical/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {uploading() ? (
              "Analizando imagen..."
            ) : (
              <>
                <Activity size={22} /> Analizar con IA
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default Upload;