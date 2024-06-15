import { useCustomSelector } from "@/customSelector/customSelector";
import { updateBridgeAction } from "@/store/action/bridgeAction";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { History } from "lucide-react"; // Adjust imports if needed
import PromptHistorySidebar from "@/components/PromptHistorySidebar"; // Adjust the import path accordingly

const InputConfigComponent = ({ params }) => {
  const { bridge } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
  }));

  const dataToSend = {
    configuration: {
      model: bridge?.configuration?.model?.default,
    },
    service: bridge?.service?.toLowerCase(),
  };

  const dispatch = useDispatch();

  const [inputConfig, setInputConfig] = useState(bridge?.inputConfig || {});
  const [isMessageHistoryOpen, setIsMessageHistoryOpen] = useState(false);
  const [currentKey, setCurrentKey] = useState(null);

  useEffect(() => {
    setInputConfig(bridge?.inputConfig);
  }, [bridge]);

  const handleMessageSelect = (selectedMessage, key) => {
    setInputConfig((prevInputConfig) => {
      const updatedConfig = { ...prevInputConfig };
      if (updatedConfig && updatedConfig[key] && updatedConfig[key].default) {
        updatedConfig[key] = {
          ...updatedConfig[key],
          default: {
            ...updatedConfig[key].default,
            content: selectedMessage,
          },
        };
      }
      SaveData(selectedMessage, key);
      return updatedConfig;
    });
  };

  const handleInputConfigChanges = (value, key) => {
    setInputConfig((prevInputConfig) => ({
      ...prevInputConfig,
      [key]: {
        ...prevInputConfig[key],
        default: {
          ...prevInputConfig[key].default,
          content: value,
        },
      },
    }));
  };

  const SaveData = (value, key) => {
    const promptString = { "role": key, "content": value };

    if (key === "input" || key === "prompt") { // If the key is input or prompt, update the configuration.input or configuration.prompt field
        const updatedDataToSend = {
            ...dataToSend,
            configuration: {
                ...dataToSend?.configuration,
                [key]: value // Update the field with the new value
            }
        };
        UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
    }
    else {

        let updatedDataToSend = {
            ...dataToSend,
            configuration: {
                ...dataToSend?.configuration,
                prompt: [promptString]
            }
        };
        UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
    }
};

  const UpdateBridge = (currentDataToSend) => {
    dispatch(
      updateBridgeAction({
        bridgeId: params.id,
        dataToSend: { ...currentDataToSend },
      })
    );
  };

  const renderInputConfig = useMemo(
    () =>
      inputConfig &&
      Object.entries(inputConfig)
        .filter(([key]) => key !== "rawData")
        .map(([key, value]) => (
          <div className="form-control w-full" key={key + value}>
            <div className="label flex justify-between items-center">
              <span className="label-text capitalize">{key}</span>
              <button
                className="btn"
                onClick={() => {
                  setIsMessageHistoryOpen(true);
                  setCurrentKey(key);
                }}
              >
                <History size={20} />
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-96 resize-y"
              value={value?.default?.content || value?.prompt || value?.input || ""}
              onChange={(e) => {
                handleInputConfigChanges(e.target.value, key);
              }}
              onBlur={(e) => {
                SaveData(e.target.value, key);
              }}
            ></textarea>
          </div>
        )),
    [inputConfig]
  );

  return (
    <>
      {(bridge?.service === "google" && bridge?.type === "chat") ? null : renderInputConfig}
      <PromptHistorySidebar
        isOpen={isMessageHistoryOpen}
        onClose={() => setIsMessageHistoryOpen(false)}
        bridgeId={params.id}
        handleMessageSelect={handleMessageSelect}
        currentKey={currentKey}
      />
    </>
  );
};

export default InputConfigComponent;



