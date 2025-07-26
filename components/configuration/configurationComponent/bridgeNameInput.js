import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useGetSingleBridgeQuery, useUpdateBridgeMutation } from '@/store/services/bridgeApi';

function BridgeNameInput({ params, isEmbedUser }) {
  const dispatch = useDispatch();
  const {data:bridgeData}=useGetSingleBridgeQuery(params?.id)
  const [updateBridge]=useUpdateBridgeMutation()
  const textareaRef = useRef(null);
  const [originalValue, setOriginalValue] = useState(bridgeData?.bridge?.name);
  const [displayValue, setDisplayValue] = useState("");
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [displayValue]);

  useEffect(() => {
    setOriginalValue(bridgeData?.bridge?.name);
    setDisplayValue(
      bridgeData?.bridge?.name.length > 20 ? bridgeData?.bridge?.name.slice(0, 17) + "..." : bridgeData?.bridge?.name
    );
  }, [bridgeData?.bridge?.name]);

  const handleChange = (e) => {
    const input = e.target.value.slice(0, 30);
    setOriginalValue(input);
    setDisplayValue(input);
  };

  const handleFocus = () => {
    setDisplayValue(originalValue);
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        const len = textarea.value.length;
        textarea.setSelectionRange(len, len);
      }
    }, 0);
  };

  const handleBridgeNameChange = useCallback(() => {

    const trimmed = originalValue.trim();

    if (trimmed === "") {
      toast.error("Agent name cannot be empty");
      setDisplayValue(
        bridgeData?.bridge?.name.length > 20 ? bridgeData?.bridge?.name.slice(0, 17) + "..." : bridgeData?.bridge?.name
      );
      return;
    }

    if (trimmed !== bridgeData?.bridge?.name) {
     updateBridge({bridgeId:params.id,dataToSend:{name:trimmed}})
    }

    isEmbedUser && window.parent.postMessage({type: 'gtwy',status:"agent_name_update", data:{ "agent_name": trimmed}}, '*');

    setDisplayValue(
      trimmed.length > 20 ? trimmed.slice(0, 17) + "..." : trimmed
    );
  }, [originalValue, bridgeData?.bridge?.name, dispatch, params.id]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }, [handleBridgeNameChange]);


  return (
    <div className="flex flex-row items-center">
      <div className="relative w-full">
        <textarea
          className="font-bold h-auto text-xl outline-none resize-none leading-tight"
          style={{
            width: "20ch",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            overflowWrap: "break-word",
          }}
          ref={textareaRef}
          rows={1}
          maxLength={30}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBridgeNameChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter Agent Name"
        />
      </div>
    </div>
  );
}

export default Protected(React.memo(BridgeNameInput))