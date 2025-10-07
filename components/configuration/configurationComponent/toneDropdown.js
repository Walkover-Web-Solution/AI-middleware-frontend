import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { useCustomSelector } from "@/customHooks/customSelector";
import InfoTooltip from "@/components/InfoTooltip";

const TONES = [
  {
    value: "authoritative",
    prompt:
      "Generate a strong, commanding response with authoritative guidance.",
  },
  {
    value: "casual",
    prompt: "Generate a response in a relaxed, easygoing, and informal tone.",
  },
  {
    value: "confident",
    prompt: "Generate a direct and assertive response with a confident tone.",
  },
  {
    value: "concise",
    prompt: "Generate a brief, straight-to-the-point response.",
  },
  {
    value: "curious",
    prompt: "Generate an inquisitive response showing curiosity.",
  },
  {
    value: "empathetic",
    prompt: "Generate a response showing understanding, concern, and support.",
  },
  {
    value: "friendly",
    prompt: "Generate a warm and welcoming response with a friendly tone.",
  },
  {
    value: "formal",
    prompt:
      "Generate a response in a professional, respectful, and clear tone suitable for official communication.",
  },
  {
    value: "humorous",
    prompt: "Generate a playful and light-hearted response with humor.",
  },
  {
    value: "inspiring",
    prompt:
      "Generate a response that uplifts and inspires the reader toward a higher purpose or goal.",
  },
  {
    value: "motivational",
    prompt: "Generate an encouraging and uplifting response.",
  },
  {
    value: "neutral",
    prompt:
      "Generate an objective and balanced response without emotional engagement.",
  },
  {
    value: "polite",
    prompt: "Generate a respectful and courteous response.",
  },
  {
    value: "sarcastic",
    prompt: "Generate a witty and ironic response with a touch of sarcasm.",
  },
];

const ToneDropdown = ({ params, searchParams }) => {
  const { reduxTone } = useCustomSelector((state) => ({
    reduxTone:
      state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[
        searchParams?.version
      ]?.configuration?.tone || null,
  }));
  const dispatch = useDispatch();

  const [selectedTone, setSelectedTone] = useState(reduxTone?.value || "");

  useEffect(() => {
    setSelectedTone(reduxTone?.value || "");
  }, [reduxTone]);

  const handleToneChange = (e) => {
    const toneValue = e.target.value;

    if (toneValue !== reduxTone?.value) {
      setSelectedTone(toneValue);
      
      // Handle "None" option - send empty string
      if (toneValue === "") {
        dispatch(
          updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: {
              configuration: {
                tone: "",
              },
            },
          })
        );
      } else {
        const tone = TONES.find((tone) => tone.value === toneValue) || {};
        if (tone) {
          dispatch(
            updateBridgeVersionAction({
              versionId: searchParams?.version,
              dataToSend: {
                configuration: {
                  tone: {
                    value: tone.value,
                    prompt: tone.prompt,
                  },
                },
              },
            })
          );
        }
      }
    }
  };

  return (
    <label className="form-control w-full">
      <div className="flex items-center pb-1">
        <InfoTooltip tooltipContent={"Select your response tone (optional)."}>
        <div className="label-text info">
          Tone
        </div>
        </InfoTooltip>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedTone}
          onChange={handleToneChange}
          className="select select-sm select-bordered capitalize w-full max-w-xs"
        >
          <option value="" disabled>
            Select a tone
          </option>
          <option value="">
            None
          </option>
          {TONES.map((tone) => (
            <option key={tone.value} value={tone.value}>
              {tone.value}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default ToneDropdown;
