import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { useCustomSelector } from "@/customHooks/customSelector";
import InfoTooltip from "@/components/InfoTooltip";

const RESPONSE_STYLES = [
  {
    value: "action-Oriented",
    prompt: "Generate a response that emphasizes actionable steps or advice.",
  },
  {
    value: "analytical",
    prompt:
      "Generate a logical, data-driven response that breaks down the topic with reasoning.",
  },
  {
    value: "crisp",
    prompt:
      "Generate a concise and to-the-point response without extra details.",
  },
  {
    value: "detailed",
    prompt: "Generate a comprehensive response with thorough explanations.",
  },
  {
    value: "short",
    prompt: "Generate a brief response that avoids unnecessary elaboration.",
  },
  {
    value: "storytelling",
    prompt:
      "Generate a response in the form of a short story or narrative to convey the message in an engaging way.",
  },
];

const ResponseStyleDropdown = ({ params }) => {
  const { reduxResponseStyle } = useCustomSelector((state) => ({
    reduxResponseStyle:
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
        params?.version
      ]?.configuration?.responseStyle || null,
  }));
  const dispatch = useDispatch();

  const [selectedStyle, setSelectedStyle] = useState(
    reduxResponseStyle?.value || ""
  );

  const handleStyleChange = (e) => {
    const styleValue = e.target.value;

    if (styleValue !== reduxResponseStyle?.value) {
      setSelectedStyle(styleValue);
      const style =
        RESPONSE_STYLES.find((style) => style.value === styleValue) || {};
      if (style) {
        dispatch(
          updateBridgeVersionAction({
            versionId: params.version,
            dataToSend: {
              configuration: {
                responseStyle: {
                  value: style.value,
                  prompt: style.prompt,
                },
              },
            },
          })
        );
      }
    }
  };

  return (
    <label className="form-control w-full">
      <div className="flex items-center pb-1">
   <InfoTooltip tooltipContent={"Select the depth of response (optional)."} className='z-low-medium w-64 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto
            ' >
    <div
      className="label-text info"
    >
      Response Style
    </div>
  </InfoTooltip>
</div>


      <div className="flex items-center gap-2">
        <select
          value={selectedStyle}
          onChange={handleStyleChange}
          className="select select-sm select-bordered capitalize w-full max-w-xs"
        >
          <option value="" disabled>
            Select a Response Style
          </option>
          {RESPONSE_STYLES.map((style) => (
            <option key={style.value} value={style.value}>
              {style.value}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default ResponseStyleDropdown;
