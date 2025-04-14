import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";

const TONES = [
  {
    value: "formal",
    displayName: "Formal",
    prompt:
      "Generate a response in a professional, respectful, and clear tone suitable for official communication.",
  },
  {
    value: "casual",
    displayName: "Casual",
    prompt: "Generate a response in a relaxed, easygoing, and informal tone.",
  },
  {
    value: "friendly",
    displayName: "Friendly",
    prompt: "Generate a warm and welcoming response with a friendly tone.",
  },
  {
    value: "empathetic",
    displayName: "Empathetic",
    prompt: "Generate a response showing understanding, concern, and support.",
  },
  {
    value: "polite",
    displayName: "Polite",
    prompt: "Generate a respectful and courteous response.",
  },
  {
    value: "confident",
    displayName: "Confident",
    prompt: "Generate a direct and assertive response with a confident tone.",
  },
  {
    value: "motivational",
    displayName: "Motivational",
    prompt: "Generate an encouraging and uplifting response.",
  },
  {
    value: "humorous",
    displayName: "Humorous",
    prompt: "Generate a playful and light-hearted response with humor.",
  },
  {
    value: "concise",
    displayName: "Concise",
    prompt: "Generate a brief, straight-to-the-point response.",
  },
  {
    value: "authoritative",
    displayName: "Authoritative",
    prompt:
      "Generate a strong, commanding response with authoritative guidance.",
  },
  {
    value: "neutral",
    displayName: "Neutral",
    prompt:
      "Generate an objective and balanced response without emotional engagement.",
  },
  {
    value: "curious",
    displayName: "Curious",
    prompt: "Generate an inquisitive response showing curiosity.",
  },
];

const ToneDropdown = ({ params }) => {
  const dispatch = useDispatch();
  const [selectedTone, setSelectedTone] = useState("");

  const handleToneChange = (e) => {
    const toneValue = e.target.value;
    setSelectedTone(toneValue);

    // Find the corresponding prompt for the selected tone
    const tone = TONES.find((tone) => tone.value === toneValue);
    if (tone) {
      dispatch(
        updateBridgeVersionAction({
          versionId: params.version,
          dataToSend: { configuration: { tonePrompt: tone.prompt } },
        })
      );
    }
  };

  return (
    <label className="form-control w-full">
      <div className="label">
        <span className="label-text font-medium">Tone</span>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedTone}
          onChange={handleToneChange}
          className="select select-sm select-bordered capitalize w-full max-w-xs"
        >
          <option value="" disabled>Select a tone</option>
          {TONES.map((tone) => (
            <option key={tone.value} value={tone.value}>{tone.displayName}</option>
          ))}
        </select>
      </div>
    </label>
  );
};

export default ToneDropdown;
