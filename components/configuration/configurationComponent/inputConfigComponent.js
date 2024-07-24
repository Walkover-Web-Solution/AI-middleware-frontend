import { useCustomSelector } from "@/customSelector/customSelector";
import { updateBridgeAction } from "@/store/action/bridgeAction";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { MentionsInput, Mention } from "react-mentions";

const InputConfigComponent = ({ params }) => {
  const sytlecss = {
    control: {
      backgroundColor: "#fff",
      fontSize: 16,
      // fontWeight: 'normal',
    },

    "&multiLine": {
      control: {
        borderradius: 25,
        fontFamily: "monospace",
        minHeight: 60,
      },
      highlighter: {
        padding: 9,
        border: "1px solid transparent",
      },
      input: {
        padding: 9,
        border: "1px solid silver",
      },
    },

    "&singleLine": {
      display: "inline-block",
      width: 150,

      highlighter: {
        padding: 1,
        border: "2px inset transparent",
      },
      input: {
        padding: 1,
        border: "2px inset",
      },
    },

    suggestions: {
      list: {
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.15)",
        fontSize: 16,
      },
      item: {
        padding: "5px 15px",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        "&focused": {
          backgroundColor: "#cee4e5",
        },
      },
    },
  };
  const { bridge, variablesKeyValue } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    variablesKeyValue:
      state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [],
  }));

  let keyValuePair = variablesKeyValue
    ?.filter((pair) => pair?.key && pair?.value)
    .map((pair) => `${pair.key}:${pair.value}`);

  keyValuePair = keyValuePair.map((item, index) => ({
    id: index,
    display: item,
  }));

  const dataToSend = {
    configuration: {
      model: bridge?.configuration?.model?.default,
    },
    service: bridge?.service?.toLowerCase(),
  };

  const dispatch = useDispatch();

  const [inputConfig, setInputConfig] = useState({});
  useEffect(() => {
    setInputConfig(bridge?.inputConfig || {});
  }, [bridge]);

  const handleInputConfigChanges = (value, key) => {
    setInputConfig((prevInputConfig) => ({
      ...prevInputConfig,
      [key]: {
        default: {
          content: value,
        },
      },
    }));
  };

  const SaveData = (value, key) => {
    const promptString = { role: key, content: value };

    if (key === "input" || key === "prompt") {
      const updatedDataToSend = {
        ...dataToSend,
        configuration: {
          ...dataToSend?.configuration,
          [key]: value,
        },
      };
      UpdateBridge(updatedDataToSend);
    } else {
      const updatedDataToSend = {
        ...dataToSend,
        configuration: {
          ...dataToSend?.configuration,
          prompt: [promptString],
        },
      };
      UpdateBridge(updatedDataToSend);
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
          <div className="form-control" key={key}>
            <div className="label">
              <span className="label-text capitalize">{key}</span>
            </div>
            {/* <textarea
              className="textarea textarea-bordered w-full min-h-96 resize-y"
              defaultValue={
                value?.default?.content || value?.prompt || value?.input || ""
              }
              onBlur={(e) => {
                handleInputConfigChanges(e.target.value, key);
                SaveData(e.target.value, key);
              }}
            ></textarea> */}
            <MentionsInput
              className="textarea textarea-bordered w-full min-h-96 resize-y border-none outline-none"
              value={
                value?.default?.content || value?.prompt || value?.input || ""
              }
              onChange={(event, newValue) => {
                handleInputConfigChanges(newValue, key);
              }}
              onBlur={(e) => {
                SaveData(e.target.value, key);
              }}
              style={sytlecss}
            >
              <Mention trigger="{" data={keyValuePair || ""} />
            </MentionsInput>
          </div>
        )),
    [inputConfig]
  );

  return (
    <>
      {(bridge?.service === "google" && bridge?.type === "chat") ||
        renderInputConfig}
    </>
  );
};

export default InputConfigComponent;
