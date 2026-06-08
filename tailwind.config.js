/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colores personalizados estilo médico/salud
        medical: {
          light: '#e0f2fe', // Azul muy clarito para fondos
          DEFAULT: '#0284c7', // Azul principal para botones
          dark: '#0369a1', // Azul oscuro para textos
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // 👈 Agregamos esto para controlar el tema manualmente
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medical: {
          light: '#e0f2fe',
          DEFAULT: '#0284c7',
          dark: '#0369a1',
        }
      }
    },
  },
  plugins: [],
}