import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Mention, MentionsInput } from 'react-mentions';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';

const mergeDeep = (target, source) => {
  let output = { ...target };
  if (typeof target === 'object' && typeof source === 'object' && !Array.isArray(target)) {
    Object.keys(source).forEach(key => {
      if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!(key in target)) output[key] = source[key];
        else output[key] = mergeDeep(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
};

const style = mergeDeep(
  {
    control: {
      backgroundColor: '#fff',
      fontSize: 14,
      fontWeight: 'normal',
      resizeBy:"vertical"
    },
    '&multiLine': {
      // control: { minHeight: 63 },
      highlighter: { padding: 9, border: '1px solid transparent' },
      input: { padding: 9, border: '1px solid silver' },
    },
    '&singleLine': {
      display: 'inline-block',
      highlighter: { padding: 1, border: '2px inset transparent' },
      input: { padding: 1, border: '2px inset' },
    },
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 14,
        borderRadius: "4px",
        //zIndex: "100",
      },
      item: {
        padding: '5px 5px',
        borderRadius: "4px",
        borderBottom: '1px solid rgba(0,0,0,0.15)',
        '&focused': { backgroundColor: '#cee4e5' },
     
      },
    },
  },
  {
    input: {
      width: "100%",
       overflow: 'auto',
      height: "auto",
      borderRadius: "10px",
      outlineColor: "gray",
    },
    highlighter: {
      boxSizing: 'border-box',
         overflow: 'auto',
        height: "24rem",
    },
  }
);

const InputConfigComponent = ({ params }) => {
  const { prompt, service, serviceType, variables } = useCustomSelector((state) => ({
    prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt || "",
    serviceType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type || "",
    service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service || "",
    variables: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || [{}],
  }));

  const [input, setInput] = useState(prompt || "");
  const dispatch = useDispatch();

  const handleInputChange = (e, newValue) => setInput(newValue);

  const handlePromptChange = () => {
    const newValue = input || "";
    dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { prompt: newValue } } }));
  };

  const formatVariable = variables.map((item, index) => ({
    id: index,
    display: item.key,
  })) || [];

  if (service === "google" && serviceType === "chat") {
    return null;
  }

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text capitalize">Prompt</span>
      </div>
      <MentionsInput
        className="w-full min-h-96 resize-y  overflow-auto
        "
        value={input}
        onChange={handleInputChange}
        onBlur={handlePromptChange}
        style={style}
        allowResize
      >
        <Mention
        
          trigger="{"
          data={formatVariable}
          markup='{{__display__}} '
          displayTransform={(id, display) => (`{{${display}}}`)}
          style={{
            backgroundColor: "#ebedf0",
            fontWeight: "100",
            paddingRight: "2px",
            paddingLeft: "1px",
            borderRadius: "4px"
          }}
          renderSuggestion={(suggestion, search, highlightedDisplay, focused) => (
            <div
              style={{
                padding: '4px 4px',
                borderRadius: "4px",
                zIndex: "100"
              }}
            >
              {highlightedDisplay}
            </div>
          )}
        />
      </MentionsInput>
    </div>
  );
};

export default InputConfigComponent;
