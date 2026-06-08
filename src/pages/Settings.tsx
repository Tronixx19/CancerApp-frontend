import { type Component } from "solid-js";
import { isDarkMode, setIsDarkMode, isLargeText, setIsLargeText } from "../store";
import { Moon, Sun, Type } from "lucide-solid";

const Settings: Component = () => {
  return (
    <div class="min-h-screen pt-20 p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div class="max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
        
        <h2 class="text-2xl font-bold text-slate-800 dark:text-white mb-6">Configuración</h2>

        <div class="space-y-6">

          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div class="flex items-center gap-3 text-slate-700 dark:text-slate-200">
              {isDarkMode() ? <Moon size={24} class="text-indigo-400" /> : <Sun size={24} class="text-orange-400" />}
              <div>
                <p class="font-semibold">Modo Oscuro</p>
                <p class="text-sm opacity-70">Cambiar colores para poca luz</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode())}
              class={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${isDarkMode() ? 'bg-medical' : 'bg-slate-300'}`}
            >
              <div class={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isDarkMode() ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <div class="flex items-center gap-3 text-slate-700 dark:text-slate-200">
              <Type size={24} class="text-medical" />
              <div>
                <p class="font-semibold">Texto Grande</p>
                <p class="text-sm opacity-70">Facilita la lectura (Accesibilidad)</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsLargeText(!isLargeText())}
              class={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${isLargeText() ? 'bg-medical' : 'bg-slate-300'}`}
            >
              <div class={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${isLargeText() ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Settings;