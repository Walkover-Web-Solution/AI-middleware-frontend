import { MoonIcon, SunIcon } from "lucide-react";
import { useState } from "react";
import LoadingSpinner from "../loadingSpinner";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );
  const [loading, setLoading] = useState(false);

  const toggleTheme = () => {
    setLoading(true);
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <>
      {loading && <LoadingSpinner height={"100vh"} width={"100vw"}/>}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-3 p-2 rounded hover:bg-base-300 transition-colors text-sm"
        title={theme === "light" ? "Enable Dark Theme" : "Disable Dark Theme"}
      >
        {theme === "light" ? (
          <>
            <MoonIcon size={16} />
            <span className="hidden sm:block text-xs">Enable Dark Theme</span>
          </>
        ) : (
          <>
            <SunIcon size={16} />
            <span className="hidden sm:block text-xs">Disable Dark Theme</span>
          </>
        )}
      </button>
    </>
  );
}
