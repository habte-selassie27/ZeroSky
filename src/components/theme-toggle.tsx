import { useState } from "react";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "zerosky.theme";

function readStoredTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(readStoredTheme);

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button
      className="zs-icon-btn"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? <Moon size={15} aria-hidden /> : <Sun size={15} aria-hidden />}
    </button>
  );
}
