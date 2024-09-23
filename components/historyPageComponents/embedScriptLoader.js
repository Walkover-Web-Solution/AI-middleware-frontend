// import { useEffect } from "react";

// const EmbedScriptLoader = ({ embedToken }) => {
//   useEffect(() => {
//     if (embedToken) {
//       const script = document.createElement("script");
//       script.setAttribute("embedToken", embedToken);
//       script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
//       script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC;
//       document.body.appendChild(script);

//       return () => {
//         document.body.removeChild(document.getElementById(process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID));
//       };
//     }
//   }, [embedToken]);

//   return null;
// };

// export default EmbedScriptLoader;
