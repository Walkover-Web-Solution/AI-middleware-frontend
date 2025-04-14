import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction"; 

const RESPONSE_STYLES = [
  {
    value: "crisp",
    displayName: "Crisp",
    prompt: "Generate a concise and to-the-point response without extra details.",
  },
  {
    value: "short",
    displayName: "Short",
    prompt: "Generate a brief response that avoids unnecessary elaboration.",
  },
  {
    value: "detailed",
    displayName: "Detailed",
    prompt: "Generate a comprehensive response with thorough explanations.",
  },
  {
    value: "actionOriented",
    displayName: "Action-Oriented",
    prompt: "Generate a response that emphasizes actionable steps or advice.",
  },
];

const ResponseStyleDropdown = ({ params }) => {
  const dispatch = useDispatch();
  const [selectedStyle, setSelectedStyle] = useState("");

  const handleStyleChange = (e) => {
    const styleValue = e.target.value;
    setSelectedStyle(styleValue);

    const style = RESPONSE_STYLES.find((style) => style.value === styleValue);
    if (style) {
      dispatch(
        updateBridgeVersionAction({
          versionId: params.version,
          dataToSend: { configuration: { responseStylePrompt: style.prompt } },
        })
      );
    }
  };

  return (
    <label className="form-control w-full">
    <div className="label">
      <span className="label-text font-medium">Response Style</span>
    </div>
    <div className="flex items-center gap-2">
      <select
        value={selectedStyle}
        onChange={handleStyleChange}
        className="select select-sm select-bordered capitalize w-full max-w-xs"
      >
        <option value="" disabled>Select a Response Style</option>
        {RESPONSE_STYLES.map((style) => (
          <option key={style.value} value={style.value}>{style.displayName}</option>
        ))}
      </select>
    </div>
  </label>
  );
};

export default ResponseStyleDropdown;
