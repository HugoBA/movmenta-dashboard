import { THEME_STORAGE_KEY } from "./constants";

// Runs before first paint so a light-theme user never sees a dark flash.
// Dark stays the default when nothing is stored.
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light")document.documentElement.classList.remove("dark")}catch(e){}`;
