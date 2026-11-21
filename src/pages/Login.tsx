import { createSignal, For, Show } from "solid-js";
import {
  Mail,
  Lock,
  LogIn,
  UserPlus,
  ShieldAlert,
  Calendar,
  Users,
  Flame,
  FileText,
  X,
} from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import { supabase } from "../lib/supabase";

const HABITOS_OPCIONES = [
  { id: "tabaco", label: "Tabaco / cigarrillo / vapeo" },
  { id: "alcohol", label: "Consumo de alcohol" },
  { id: "bebidas_calientes", label: "Bebidas o infusiones muy calientes" },
  { id: "sol_labios", label: "Exposición solar frecuente (labios)" },
  { id: "otro", label: "Otro" },
] as const;

const Login = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [modoRegistro, setModoRegistro] = createSignal(false);

  // Campos clínicos y consentimiento de registro
  const [edad, setEdad] = createSignal<string>("");
  const [sexoBiologico, setSexoBiologico] = createSignal<string>("");
  const [habitos, setHabitos] = createSignal<string[]>([]);
  const [otroHabito, setOtroHabito] = createSignal("");
  const [aceptoTerminos, setAceptoTerminos] = createSignal(false);
  const [mostrarTerminos, setMostrarTerminos] = createSignal(false);

  const [loading, setLoading] = createSignal(false);
  const [mensaje, setMensaje] = createSignal("");

  const navigate = useNavigate();

  const toggleHabito = (id: string) => {
    const actuales = habitos();
    if (actuales.includes(id)) {
      setHabitos(actuales.filter((h) => h !== id));
    } else {
      setHabitos([...actuales, id]);
    }
  };

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email(),
      password: password(),
    });

    if (error) {
      setMensaje("❌ " + error.message);
      setLoading(false);
    } else {
      navigate("/upload");
    }
  };

  const handleRegistro = async (e?: Event) => {
    if (e) e.preventDefault();

    if (!modoRegistro()) {
      setMensaje("");
      setModoRegistro(true);
      return;
    }

    if (password().length < 6) {
      setMensaje("❌ La contraseña debe tener al menos 6 caracteres");
      return;
    }

    const edadNum = Number(edad());
    if (!edad() || Number.isNaN(edadNum) || edadNum < 1 || edadNum > 120) {
      setMensaje("❌ Ingresa una edad válida");
      return;
    }

    if (!sexoBiologico()) {
      setMensaje("❌ Selecciona tu sexo biológico");
      return;
    }

    if (!aceptoTerminos()) {
      setMensaje("❌ Debes aceptar los Términos de Uso y Política de Protección de Datos");
      return;
    }

    setLoading(true);
    setMensaje("");

    const listaFinalHabitos = habitos().map((h) =>
      h === "otro" && otroHabito().trim() ? `Otro: ${otroHabito().trim()}` : h
    );

    const { error } = await supabase.auth.signUp({
      email: email(),
      password: password(),
      options: {
        data: {
          edad: edadNum,
          sexo_biologico: sexoBiologico(),
          habitos_cancerigenos: listaFinalHabitos,
          acepto_terminos: true,
          fecha_aceptacion_terminos: new Date().toISOString(),
        },
      },
    });

    if (error) {
      setMensaje("❌ " + error.message);
    } else {
      setMensaje("✅ ¡Cuenta creada! Ya puedes iniciar sesión.");
      setModoRegistro(false);
      setAceptoTerminos(false);
    }
    setLoading(false);
  };

  return (
    <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-medical-light/30">
      <div class="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-6 border border-slate-100">
        <div class="flex flex-col items-center text-center space-y-2">
          <div class="bg-medical-light p-3 rounded-full mb-2">
            <ShieldAlert size={40} class="text-medical" />
          </div>
          <h2 class="text-2xl font-bold text-slate-800">CancerApp</h2>
          <p class="text-sm text-slate-500">
            {modoRegistro()
              ? "Completa tus datos clínicos y acepta los términos"
              : "Inicia sesión para continuar con tu análisis"}
          </p>
        </div>

        <form onSubmit={modoRegistro() ? handleRegistro : handleLogin} class="space-y-4">
          {/* Input Email */}
          <div class="relative">
            <Mail size={20} class="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical focus:bg-white transition-all"
              required
            />
          </div>

          {/* Input Password */}
          <div class="relative">
            <Lock size={20} class="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="password"
              placeholder="Contraseña"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical focus:bg-white transition-all"
              required
            />
          </div>

          {/* Campos adicionales solo en registro */}
          <Show when={modoRegistro()}>
            <div class="space-y-4 pt-2 border-t border-slate-100">
              {/* Edad */}
              <div class="relative">
                <Calendar size={20} class="absolute left-3 top-3.5 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Edad"
                  value={edad()}
                  onInput={(e) => setEdad(e.currentTarget.value)}
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical focus:bg-white transition-all"
                  required
                />
              </div>

              {/* Sexo biológico */}
              <div class="relative">
                <Users size={20} class="absolute left-3 top-3.5 text-slate-400" />
                <select
                  value={sexoBiologico()}
                  onChange={(e) => setSexoBiologico(e.currentTarget.value)}
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical focus:bg-white transition-all text-slate-700"
                  required
                >
                  <option value="" disabled>
                    Selecciona sexo biológico
                  </option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                </select>
              </div>

              {/* Hábitos carcinógenos */}
              <div class="space-y-2">
                <div class="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Flame size={16} class="text-medical" />
                  <span>Hábitos o factores de riesgo</span>
                </div>
                <div class="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <For each={[...HABITOS_OPCIONES]}>
                    {(item) => (
                      <label class="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={habitos().includes(item.id)}
                          onChange={() => toggleHabito(item.id)}
                          class="rounded border-slate-300 text-medical focus:ring-medical"
                        />
                        <span>{item.label}</span>
                      </label>
                    )}
                  </For>

                  <Show when={habitos().includes("otro")}>
                    <input
                      type="text"
                      placeholder="Especifica otro hábito..."
                      value={otroHabito()}
                      onInput={(e) => setOtroHabito(e.currentTarget.value)}
                      class="mt-2 w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical"
                    />
                  </Show>
                </div>
              </div>

              {/* Consentimiento de protección de datos y términos */}
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label class="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer leading-relaxed">
                  <input
                    type="checkbox"
                    checked={aceptoTerminos()}
                    onChange={(e) => setAceptoTerminos(e.currentTarget.checked)}
                    class="mt-0.5 rounded border-slate-300 text-medical focus:ring-medical shrink-0"
                    required
                  />
                  <span>
                    Acepto que mi información de cuenta y antecedentes (correo, edad, sexo biológico y hábitos) se almacenen conforme a la normativa de protección de datos, y entiendo que{" "}
                    <strong>las imágenes no se guardan en ninguna base de datos</strong>.
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setMostrarTerminos(true)}
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-medical hover:underline"
                >
                  <FileText size={14} /> Leer Términos de Uso y Privacidad
                </button>
              </div>
            </div>
          </Show>

          {/* Alertas */}
          {mensaje() && (
            <div
              class={`p-3 rounded-lg text-sm text-center font-medium ${
                mensaje().includes("❌") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
              }`}
            >
              {mensaje()}
            </div>
          )}

          {/* Botones */}
          <div class="pt-2 space-y-3">
            <Show when={!modoRegistro()}>
              <button
                type="submit"
                disabled={loading()}
                class="w-full flex justify-center items-center gap-2 py-3 bg-medical hover:bg-medical-dark text-white font-semibold rounded-xl transition-colors shadow-md shadow-medical/30 disabled:opacity-70"
              >
                {loading() ? (
                  "Cargando..."
                ) : (
                  <>
                    <LogIn size={20} /> Entrar
                  </>
                )}
              </button>
            </Show>

            <button
              type={modoRegistro() ? "submit" : "button"}
              onClick={!modoRegistro() ? () => handleRegistro() : undefined}
              disabled={loading()}
              class="w-full flex justify-center items-center gap-2 py-3 bg-white text-slate-600 border-2 border-slate-200 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-70"
            >
              <UserPlus size={20} /> {modoRegistro() ? "Confirmar registro" : "Registrarme"}
            </button>

            <Show when={modoRegistro()}>
              <button
                type="button"
                onClick={() => {
                  setModoRegistro(false);
                  setMensaje("");
                }}
                class="w-full text-xs text-slate-500 hover:text-slate-700 py-1"
              >
                Volver a iniciar sesión
              </button>
            </Show>
          </div>
        </form>
      </div>

      {/* Modal de Términos de Uso y Protección de Datos */}
      <Show when={mostrarTerminos()}>
        <div class="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 border border-slate-200">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText size={18} class="text-medical" /> Términos de Uso y Protección de Datos
              </h3>
              <button
                type="button"
                onClick={() => setMostrarTerminos(false)}
                class="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div class="text-xs text-slate-600 space-y-2.5 max-h-64 overflow-y-auto leading-relaxed">
              <p>
                <strong>1. Finalidad orientativa:</strong> Esta aplicación realiza un triaje preliminar asistido por inteligencia artificial y no constituye un diagnóstico médico definitivo ni reemplaza la evaluación odontológica o médica presencial.
              </p>
              <p>
                <strong>2. Datos personales almacenados:</strong> Al crear tu cuenta, se almacenan tus credenciales de acceso, edad, sexo biológico y hábitos declarados para fines de perfil y generación de reportes, bajo los principios de licitud, finalidad y minimización de datos de la normativa de protección de datos personales.
              </p>
              <p>
                <strong>3. Privacidad de las imágenes:</strong> Las fotografías de lesiones orales se procesan exclusivamente en memoria volátil durante la inferencia y <strong>no se almacenan</strong> en bases de datos ni en repositorios persistentes tras el análisis.
              </p>
            </div>

            <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAceptoTerminos(true);
                  setMostrarTerminos(false);
                }}
                class="px-4 py-2 text-xs font-semibold rounded-xl bg-medical text-white hover:bg-medical-dark transition-colors"
              >
                Aceptar y cerrar
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default Login;