import { type Component, createMemo, createSignal, onMount, For, Show } from "solid-js";
import { AlertTriangle, Info, ArrowLeft, Download, Activity, Loader2, Clock, User } from "lucide-solid";
import { useNavigate, useLocation } from "@solidjs/router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { supabase } from "../lib/supabase";

interface PerfilClinico {
  edad?: number;
  sexo_biologico?: string;
  habitos_cancerigenos?: string[];
}

const ETIQUETAS_TIEMPO: Record<string, string> = {
  menos_1_semana: "Menos de 1 semana",
  "1_a_2_semanas": "Entre 1 y 2 semanas",
  "2_a_4_semanas": "Entre 2 y 4 semanas",
  "1_a_3_meses": "Entre 1 y 3 meses",
  mas_3_meses: "Más de 3 meses",
  no_recuerda: "No lo recuerda con exactitud",
};

const ETIQUETAS_SEXO: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
};

const ETIQUETAS_HABITOS: Record<string, string> = {
  tabaco: "Tabaco / cigarrillo / vapeo",
  alcohol: "Consumo de alcohol",
  bebidas_calientes: "Bebidas o infusiones muy calientes",
  sol_labios: "Exposición solar frecuente (labios)",
};

const Results: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [descargando, setDescargando] = createSignal(false);
  const [perfil, setPerfil] = createSignal<PerfilClinico | null>(null);

  let reporteRef: HTMLDivElement | undefined;

  const state = location.state as
    | {
        diagnostico?: string;
        confianza?: number;
        tiempoLesion?: string;
        detalleLesion?: string;
      }
    | undefined;

  if (!state || !state.diagnostico) {
    navigate("/upload", { replace: true });
    return null;
  }

  onMount(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user?.user_metadata) {
        const meta = data.user.user_metadata;
        setPerfil({
          edad: typeof meta.edad === "number" ? meta.edad : Number(meta.edad) || undefined,
          sexo_biologico:
            typeof meta.sexo_biologico === "string"
              ? meta.sexo_biologico
              : typeof meta.genero === "string"
              ? meta.genero
              : undefined,
          habitos_cancerigenos: Array.isArray(meta.habitos_cancerigenos)
            ? meta.habitos_cancerigenos
            : [],
        });
      }
    } catch (err) {
      console.error("No se pudieron cargar los datos del perfil:", err);
    }
  });

  const tiempoTexto = createMemo(() => {
    if (!state.tiempoLesion) return "No especificado";
    return ETIQUETAS_TIEMPO[state.tiempoLesion] ?? state.tiempoLesion;
  });

  const sexoTexto = createMemo(() => {
    const s = perfil()?.sexo_biologico;
    if (!s) return "No especificado";
    return ETIQUETAS_SEXO[s] ?? s;
  });

  const habitosFormateados = createMemo(() => {
    const lista = perfil()?.habitos_cancerigenos ?? [];
    if (lista.length === 0) return ["Ninguno declarado"];
    return lista.map((item) => ETIQUETAS_HABITOS[item] ?? item);
  });

  const isCancer = state.diagnostico.toLowerCase() === "cancer";
  const confidencePercent = state.confianza ? (state.confianza * 100).toFixed(1) + "%" : "N/A";

  const resultData = createMemo(() => {
    if (isCancer) {
      return {
        riskLevel: "Alto Riesgo",
        bgColor: "bg-red-600",
        iconBg: "bg-white/30",
        confidence: confidencePercent,
        description:
          "La Inteligencia Artificial ha detectado características y patrones visuales que sugieren la posible presencia de tejido anómalo o maligno. Requiere atención médica prioritaria.",
        recommendation:
          "Agendar una cita de URGENCIA con un especialista (Odontólogo o Maxilofacial) para realizar una evaluación clínica y/o biopsia confirmatoria.",
      };
    } else {
      return {
        riskLevel: "Bajo Riesgo (Aparente Benigno)",
        bgColor: "bg-green-600",
        iconBg: "bg-white/30",
        confidence: confidencePercent,
        description:
          "La Inteligencia Artificial no ha detectado patrones visuales evidentes de malignidad en la imagen proporcionada. El tejido tiene un aspecto mayoritariamente regular.",
        recommendation:
          "Mantener rutinas de higiene oral. Si presenta dolor, sangrado, o si la lesión no desaparece en 14 días, consulte a su odontólogo preventivamente.",
      };
    }
  });

  const generarPDF = async () => {
    if (!reporteRef) return;

    setDescargando(true);

    try {
      const canvas = await html2canvas(reporteRef, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Deteccion_${new Date().toLocaleDateString().replace(/\//g, "-")}.pdf`);
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un problema al generar el documento. Intenta nuevamente.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div class="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center p-6 bg-medical-light/30 dark:bg-slate-950 transition-colors duration-300">
      <div
        ref={reporteRef}
        class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300"
      >
        <div class={`${resultData().bgColor} text-white p-6 flex items-center gap-4 transition-colors`}>
          <div class={`${resultData().iconBg} p-3 rounded-full`}>
            <Activity size={32} />
          </div>
          <div>
            <h2 class="text-2xl font-bold">Nivel de Riesgo: {resultData().riskLevel}</h2>
            <p class="opacity-90 font-medium">Confianza de la IA: {resultData().confidence}</p>
          </div>
        </div>

        <div class="p-8 space-y-6">
          <div class="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 rounded-xl border border-orange-200 dark:border-orange-800/50 transition-colors">
            <AlertTriangle class="shrink-0 mt-0.5" size={20} />
            <p class="text-sm">
              <strong>Aviso Médico:</strong> Este análisis es generado por Inteligencia Artificial con fines informativos.{" "}
              <strong>No sustituye</strong> un diagnóstico médico profesional. Consulte siempre a un especialista en salud oral.
            </p>
          </div>

          {/* Tiempo de evolución de la lesión */}
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-1.5 transition-colors">
            <h3 class="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <Clock size={18} class="text-medical" /> Tiempo desde que notó la lesión
            </h3>
            <p class="text-sm text-slate-700 dark:text-slate-300 font-medium">{tiempoTexto()}</p>
            <Show when={state.detalleLesion && state.detalleLesion.trim().length > 0}>
              <p class="text-xs text-slate-500 dark:text-slate-400 pt-1">
                Nota: {state.detalleLesion}
              </p>
            </Show>
          </div>

          {/* Antecedentes y datos clínicos del usuario */}
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 space-y-3 transition-colors">
            <h3 class="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-white">
              <User size={18} class="text-medical" /> Antecedentes clínicos del usuario
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 dark:text-slate-300">
              <div>
                <span class="text-slate-500 dark:text-slate-400">Edad: </span>
                <span class="font-medium">
                  {perfil()?.edad ? `${perfil()!.edad} años` : "No especificada"}
                </span>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400">Sexo biológico: </span>
                <span class="font-medium">{sexoTexto()}</span>
              </div>
            </div>
            <div class="text-sm text-slate-700 dark:text-slate-300">
              <span class="text-slate-500 dark:text-slate-400 block mb-1.5">
                Hábitos o factores asociados:
              </span>
              <div class="flex flex-wrap gap-1.5">
                <For each={habitosFormateados()}>
                  {(habito) => (
                    <span class="px-2.5 py-1 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
                      {habito}
                    </span>
                  )}
                </For>
              </div>
            </div>
          </div>

          <div class="space-y-4 text-slate-700 dark:text-slate-300">
            <div>
              <h3 class="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-white mb-2">
                <Info size={20} class="text-medical" /> Hallazgos Clínicos
              </h3>
              <p class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                {resultData().description}
              </p>
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Recomendación a seguir</h3>
              <p class="bg-medical-light/30 dark:bg-medical-dark/20 p-4 rounded-xl border border-medical/20 text-medical-dark dark:text-medical-light font-medium transition-colors">
                {resultData().recommendation}
              </p>
            </div>
          </div>

          <div
            data-html2canvas-ignore
            class="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800 transition-colors"
          >
            <button
              onClick={() => navigate("/upload")}
              class="flex-1 flex justify-center items-center gap-2 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={20} /> Analizar otra imagen
            </button>

            <button
              onClick={generarPDF}
              disabled={descargando()}
              class="flex-1 flex justify-center items-center gap-2 py-3 bg-medical hover:bg-medical-dark text-white font-bold rounded-xl transition-all shadow-md shadow-medical/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {descargando() ? (
                <>
                  <Loader2 size={20} class="animate-spin" /> Creando PDF...
                </>
              ) : (
                <>
                  <Download size={20} /> Guardar Reporte
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;