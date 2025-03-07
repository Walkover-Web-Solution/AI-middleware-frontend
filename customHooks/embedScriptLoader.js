import { useEffect } from "react";

export const useEmbedScriptLoader = (embedToken) => {
  useEffect(() => {
    if (embedToken) {
      const activeElement = document.activeElement;
      const script = document.createElement("script");
      script.setAttribute("embedToken", embedToken);
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
      script.setAttribute('parentId', 'alert-embed-parent')
      document.body.appendChild(script);
      script.onload = () => {
        setTimeout(() => {
          if (activeElement && 'focus' in activeElement) {
            activeElement.focus();
          }
        }, 2000);
      };

      return () => {
        const script = document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID)
        if (script) document.body.removeChild(script);
        const embedContainer = document.getElementById("iframe-viasocket-embed-parent-container")
        if (embedContainer) document.body.removeChild(embedContainer)
      };
    }
  }, [embedToken]);
};