import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function BridgeNameInput({ params }) {
  const dispatch = useDispatch();
  const { bridgeName } = useCustomSelector((state) => ({
      bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
    }));
   const textareaRef = useRef(null);
   const [originalValue, setOriginalValue] = useState(bridgeName);
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
    setOriginalValue(bridgeName);
    setDisplayValue(
      bridgeName.length > 20 ? bridgeName.slice(0, 17) + "..." : bridgeName
    );
  }, [bridgeName]);

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
        bridgeName.length > 20 ? bridgeName.slice(0, 17) + "..." : bridgeName
      );
      return;
    }

    if (trimmed !== bridgeName) {
      dispatch(updateBridgeAction({
        bridgeId: params.id,
        dataToSend: { name: trimmed },
      }));
    }

    setDisplayValue(
      trimmed.length > 20 ? trimmed.slice(0, 17) + "..." : trimmed
    );
  }, [originalValue, bridgeName, dispatch, params.id]);

 
  const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      e.target.blur(); 
    }
  };

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

export default React.memo(BridgeNameInput)