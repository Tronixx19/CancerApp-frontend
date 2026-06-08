import { type Component, createMemo, createSignal } from "solid-js";
import { AlertTriangle, Info, ArrowLeft, Download, Activity, Loader2 } from "lucide-solid";
import { useNavigate, useLocation } from "@solidjs/router";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const Results: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Estado para el botón de descarga
  const [descargando, setDescargando] = createSignal(false);
  
  // Referencia para saber qué parte de la pantalla vamos a convertir en PDF
  let reporteRef: HTMLDivElement | undefined;

  const state = location.state as { diagnostico?: string; confianza?: number } | undefined;

  if (!state || !state.diagnostico) {
    navigate("/upload", { replace: true });
    return null;
  }

  const isCancer = state.diagnostico.toLowerCase() === "cancer";
  const confidencePercent = state.confianza ? (state.confianza * 100).toFixed(1) + "%" : "N/A";

  const resultData = createMemo(() => {
    if (isCancer) {
      return {
        riskLevel: "Alto Riesgo",
        bgColor: "bg-red-600",
        iconBg: "bg-white/30",
        confidence: confidencePercent,
        description: "La Inteligencia Artificial ha detectado características y patrones visuales que sugieren la posible presencia de tejido anómalo o maligno. Requiere atención médica prioritaria.",
        recommendation: "Agendar una cita de URGENCIA con un especialista (Odontólogo o Maxilofacial) para realizar una evaluación clínica y/o biopsia confirmatoria."
      };
    } else {
      return {
        riskLevel: "Bajo Riesgo (Aparente Benigno)",
        bgColor: "bg-green-600",
        iconBg: "bg-white/30",
        confidence: confidencePercent,
        description: "La Inteligencia Artificial no ha detectado patrones visuales evidentes de malignidad en la imagen proporcionada. El tejido tiene un aspecto mayoritariamente regular.",
        recommendation: "Mantener rutinas de higiene oral. Si presenta dolor, sangrado, o si la lesión no desaparece en 14 días, consulte a su odontólogo preventivamente."
      };
    }
  });

  // --- NUEVA FUNCIÓN PARA GENERAR EL PDF ---
  const generarPDF = async () => {
    if (!reporteRef) return;
    
    setDescargando(true);
    
    try {
      // 1. Tomar una "foto" de alta calidad del contenedor
      const canvas = await html2canvas(reporteRef, { 
        scale: 2, // Mejora la resolución del texto
        useCORS: true, 
        backgroundColor: "#ffffff" 
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // 2. Crear el documento PDF tamaño A4
      const pdf = new jsPDF("p", "mm", "a4");
      
      // 3. Calcular dimensiones para que la imagen encaje bien
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // 4. Pegar la imagen y guardar
      pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
      pdf.save(`Reporte_Deteccion_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
      
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      alert("Hubo un problema al generar el documento. Intenta nuevamente.");
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div class="min-h-screen pt-20 pb-10 flex flex-col items-center justify-center p-6 bg-medical-light/30 dark:bg-slate-950 transition-colors duration-300">

      {/* Agregamos el ref={reporteRef} a este div. Todo lo que esté adentro será el PDF */}
      <div ref={reporteRef} class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">

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
              <strong>Aviso Médico:</strong> Este análisis es generado por Inteligencia Artificial con fines informativos. <strong>No sustituye</strong> un diagnóstico médico profesional. Consulte siempre a un especialista en salud oral.
            </p>
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

          {/* ESTOS BOTONES DE ACCIÓN LOS SACAREMOS DEL PDF */}
          {/* Para eso, html2canvas nos permite usar la clase 'data-html2canvas-ignore' */}
          <div data-html2canvas-ignore class="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
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
                <><Loader2 size={20} class="animate-spin" /> Creando PDF...</>
              ) : (
                <><Download size={20} /> Guardar Reporte</>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Results;