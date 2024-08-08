import { useEffect } from "react";

export const useEmbedScriptLoader = (embedToken) => {
  useEffect(() => {
    if (embedToken) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", embedToken);
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
      };
    }
  }, [embedToken]);
};

export const useCloseSliderOnEsc = (setIsSliderOpen) => {
  useEffect(() => {
    const closeSliderOnEsc = (event) => {
      if (event.key === "Escape") {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("keydown", closeSliderOnEsc);

    return () => {
      document.removeEventListener("keydown", closeSliderOnEsc);
    };
  }, [setIsSliderOpen]);
};

export const useHandleClickOutside = (sidebarRef, setIsSliderOpen) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSliderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef, setIsSliderOpen]);
};
