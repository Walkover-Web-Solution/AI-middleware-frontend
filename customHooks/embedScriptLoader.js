import { allAuthKey } from "@/config";
import { createNewAuthData } from "@/store/action/authkeyAction";
import { useEffect } from "react";

export const useEmbedScriptLoader = (embedToken) => {

  async function embedMaker() {
    const { data } = await allAuthKey()
    let data_authkey = data?.[0]?.authkey
    if (data?.length === 0) {
      const datatosend = {
        name: 'Trigger',
        throttle_limit: "60:800",
        temporary_throttle_limit: "60:600",
        temporary_throttle_time: "30",
      }
      const response = dispatch(createNewAuthData(datatosend));
      data_authkey = response?.data?.authkey;
    }

    const pAuthKey = data_authkey
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