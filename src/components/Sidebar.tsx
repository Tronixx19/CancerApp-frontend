import { createSignal, Show } from "solid-js";
import { Menu, X, Settings, LogOut, Camera } from "lucide-solid";
import { useNavigate } from "@solidjs/router";
import { supabase } from "../lib/supabase";

const Sidebar = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    navigate("/"); // Devolvemos al usuario al Login
  };

  return (
    <>
      {/* Botón flotante para abrir el menú */}
      <button 
        onClick={() => setIsOpen(true)}
        class="fixed top-4 left-4 z-40 p-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
      >
        <Menu size={24} />
      </button>

      {/* Fondo oscuro cuando el menú está abierto */}
      <Show when={isOpen()}>
        <div 
          class="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      </Show>

      {/* El Menú Lateral */}
      <div class={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen() ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div class="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
          <h2 class="font-bold text-lg text-medical dark:text-medical-light">Menú</h2>
          <button onClick={() => setIsOpen(false)} class="text-slate-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <nav class="p-4 space-y-2">
          <button 
            onClick={() => { setIsOpen(false); navigate("/upload"); }}
            class="w-full flex items-center gap-3 p-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Camera size={20} /> Analizar Imagen
          </button>

          <button 
            onClick={() => { setIsOpen(false); navigate("/settings"); }}
            class="w-full flex items-center gap-3 p-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Settings size={20} /> Configuración
          </button>

          <hr class="my-4 border-slate-200 dark:border-slate-800" />

          <button 
            onClick={handleLogout}
            class="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;