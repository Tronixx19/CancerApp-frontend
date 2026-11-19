import { createSignal, For, Show } from "solid-js";
import { Mail, Lock, LogIn, UserPlus, ShieldAlert, Calendar, Users, Flame } from "lucide-solid";
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

  // Campos clínicos de registro
  const [edad, setEdad] = createSignal<string>("");
  const [genero, setGenero] = createSignal<string>("");
  const [habitos, setHabitos] = createSignal<string[]>([]);
  const [otroHabito, setOtroHabito] = createSignal("");

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

    if (!genero()) {
      setMensaje("❌ Selecciona tu género");
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
          genero: genero(),
          habitos_cancerigenos: listaFinalHabitos,
        },
      },
    });

    if (error) {
      setMensaje("❌ " + error.message);
    } else {
      setMensaje("✅ ¡Cuenta creada! Ya puedes iniciar sesión.");
      setModoRegistro(false);
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
              ? "Completa tus datos para crear tu cuenta"
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

              {/* Género */}
              <div class="relative">
                <Users size={20} class="absolute left-3 top-3.5 text-slate-400" />
                <select
                  value={genero()}
                  onChange={(e) => setGenero(e.currentTarget.value)}
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical focus:bg-white transition-all text-slate-700"
                  required
                >
                  <option value="" disabled>
                    Selecciona tu género
                  </option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="no_binario">No binario</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
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
    </div>
  );
};

export default Login;