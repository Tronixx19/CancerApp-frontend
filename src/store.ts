import { createSignal } from "solid-js";

// Solo guardamos los estados aquí
export const [isDarkMode, setIsDarkMode] = createSignal(false);
export const [isLargeText, setIsLargeText] = createSignal(false);