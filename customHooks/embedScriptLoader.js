import { getOrCreateNotificationAuthKey } from "@/config/index";
import { useEffect } from "react";

export const useEmbedScriptLoader = (embedToken, isEmbedUser) => {

  async function embedMaker() {
    const pAuthKey = !isEmbedUser ? await getOrCreateNotificationAuthKey('gtwy_bridge_trigger').then(res => res?.authkey) : null
    const activeElement = document.activeElement;
    const script = document.createElement("script");
    script.setAttribute("embedToken", embedToken);
    script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
    script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
    script.setAttribute('parentId', 'alert-embed-parent')
    const configurationJson = {
      "rowxvl39hxd0": {
        "key": "Alert_On_Error",
        "authValues": {
          "pauth_key": pAuthKey
        }
      },
      "rowhup02ji8l": {
        "key": "Alert_On_Fallback",
        "authValues": {
          "pauth_key": pAuthKey
        }
      },
      "row3atttp4du": {
        "key": "Alert_On_Missing_Variables",
        "authValues": {
          "pauth_key": pAuthKey
        }
      }
    }
    script.setAttribute('configurationJson', JSON.stringify(configurationJson))

    document.body.appendChild(script);
    script.onload = () => {
      setTimeout(() => {
        if (activeElement && 'focus' in activeElement) {
          activeElement.focus();
        }
      }, 2000);
    };
  }
  useEffect(() => {
    if (embedToken) {
      embedMaker()

      return () => {
        const script = document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID)
        if (script) document.body.removeChild(script);
        const embedContainer = document.getElementById("iframe-viasocket-embed-parent-container")
        if (embedContainer) document.body.removeChild(embedContainer)
      };
    }
  }, [embedToken]);
};