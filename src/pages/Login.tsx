import { createSignal } from "solid-js";
import { Mail, Lock, LogIn, UserPlus, ShieldAlert } from "lucide-solid";
import { useNavigate } from "@solidjs/router"; 
import { supabase } from "../lib/supabase";

const Login = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [mensaje, setMensaje] = createSignal(""); 
  
  const navigate = useNavigate(); 

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

  const handleRegistro = async () => {
    if (password().length < 6) {
      setMensaje("❌ La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    setMensaje("");

    const { error } = await supabase.auth.signUp({
      email: email(),
      password: password(),
    });

    if (error) {
      setMensaje("❌ " + error.message);
    } else {
      setMensaje("✅ ¡Cuenta creada! Ya puedes iniciar sesión.");
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
          <p class="text-sm text-slate-500">Inicia sesión para continuar con tu análisis</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} class="space-y-4">
          
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

          {/* Alertas */}
          {mensaje() && (
            <div class={`p-3 rounded-lg text-sm text-center font-medium ${mensaje().includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {mensaje()}
            </div>
          )}

          {/* Botones */}
          <div class="pt-2 space-y-3">
            <button 
              type="submit" 
              disabled={loading()}
              class="w-full flex justify-center items-center gap-2 py-3 bg-medical hover:bg-medical-dark text-white font-semibold rounded-xl transition-colors shadow-md shadow-medical/30 disabled:opacity-70"
            >
              {loading() ? "Cargando..." : <><LogIn size={20} /> Entrar</>}
            </button>

            <button 
              type="button" 
              onClick={handleRegistro}
              disabled={loading()}
              class="w-full flex justify-center items-center gap-2 py-3 bg-white text-slate-600 border-2 border-slate-200 font-semibold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-70"
            >
              <UserPlus size={20} /> Registrarme
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default Login;