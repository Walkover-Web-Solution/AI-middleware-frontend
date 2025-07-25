"use client";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { updateVariables } from "@/store/reducer/bridgeReducer";
import { updateOnBoardingDetails } from "@/utils/utility";
import { ChevronUpIcon, ChevronDownIcon, InfoIcon, TrashIcon } from "@/components/Icons";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import OnBoarding from "./OnBoarding";
import { ONBOARDING_VIDEOS } from "@/utils/enums";
import TutorialSuggestionToast from "./tutorialSuggestoinToast";
import InfoTooltip from "./InfoTooltip";

const AddVariable = ({ params }) => {
  const versionId = params.version;
  const { variablesKeyValue, prompt, isFirstVariable,  } = useCustomSelector((state) => ({
    variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables || [],
    prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.prompt || "",
    isFirstVariable: state.userDetailsReducer.userDetails?.meta?.onboarding?.Addvariables || "",
  }));
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [isFormData, setIsFormData] = useState(true);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Accordion state
  const [height, setHeight] = useState(0); // Dynamic height state
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  const accordionContentRef = useRef(null); // Ref for the accordion content
  const isOpeningRef = useRef(false); // To track if the accordion is opening
  const handleTutorial = () => {
     setTutorialState(prev => ({
        ...prev,
        showSuggestion: isFirstVariable
      }));
  };


  const updateVersionVariable = (updatedPairs) => {
    const filteredPairs = updatedPairs ? updatedPairs?.filter(pair =>
      prompt?.includes(`{{${pair?.key}}}`)
    )?.map(pair => ({
      [pair?.key]: pair?.required ? 'required' : 'optional'
    })) : variablesKeyValue?.filter(pair =>
      prompt?.includes(`{{${pair?.key}}}`)
    )?.map(pair => ({
      [pair?.key]: pair?.required ? 'required' : 'optional'
    }));
    dispatch(updateBridgeVersionAction({
      versionId: params?.version,
      dataToSend: {
        'variables_state': Object.assign({}, ...filteredPairs)
      }
    }));
  }

  const extractVariablesFromPrompt = () => {
    const regex = /{{(.*?)}}/g;
    const matches = [...prompt.matchAll(regex)];
    const variables = [...new Set(matches.map(match => match[1].trim()))];

    const existingPairsMap = new Map(variablesKeyValue.map(pair => [pair.key, pair]));

    const newVariables = variables.filter(v => !existingPairsMap.has(v));

    if (newVariables.length === 0) return;

    const updatedPairs = [
      ...variablesKeyValue,
      ...newVariables.map(variable => ({
        key: variable,
        value: '',
        required: true
      }))
    ];

    setKeyValuePairs(updatedPairs);
    dispatch(updateVariables({
      data: updatedPairs,
      bridgeId: params.id,
      versionId
    }));
    updateVersionVariable(updatedPairs);
  };

  useEffect(() => {
    if (prompt) {
      extractVariablesFromPrompt();
    }
  }, [prompt]);

  // Initialize keyValuePairs from Redux store
  useEffect(() => {
    setKeyValuePairs(variablesKeyValue);
  }, [variablesKeyValue]);

  // Helper function to check if all pairs are valid
  const areAllPairsValid = (pairs) => {
    return pairs.every((pair) => pair.key.trim() !== "" && pair.value.trim() !== "");
  };

  // Function to handle adding a new key-value pair
  const handleAddKeyValuePair = () => {
    const newPair = { key: "", value: "", required: true };
    const isValid = areAllPairsValid(keyValuePairs);
    if (isValid) {
      setError(false);
      const updatedPairs = [...keyValuePairs, newPair];
      setKeyValuePairs(updatedPairs);
      dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id, versionId }));
    } else {
      setError(true);
    }
  };

  // Function to handle removing a key-value pair
  const handleRemoveKeyValuePair = (index) => {
    const updatedPairs = keyValuePairs.filter((_, i) => i !== index);
    setKeyValuePairs(updatedPairs);
    dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id, versionId }));

    // Reset error if after removal all remaining pairs are valid
    if (areAllPairsValid(updatedPairs)) {
      setError(false);
    }
  };

  // Function to handle changes in key or value inputs
  const handleKeyValueChange = (index, field, value) => {
    const updatedPairs = [...keyValuePairs];
    updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    setKeyValuePairs(updatedPairs);

    // Dispatch update if the current pair is valid
    if (updatedPairs[index].key.trim() && updatedPairs[index].value.trim()) {
      dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id, versionId }));
    }

    setError(false);
  };

  // Function to handle checkbox toggle
  const handleCheckKeyValuePair = (index) => {
    setError(false); // Reset error when a checkbox is toggled
    const updatedPairs = [...keyValuePairs];
    updatedPairs[index] = {
      ...updatedPairs[index],
      required: !updatedPairs[index].required,
    };
    setKeyValuePairs(updatedPairs);
    dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id, versionId }));
    updateVersionVariable(updatedPairs)
  };

  // Function to format key-value pairs for the textarea
  const formatPairsForTextarea = () => {
    return keyValuePairs
      .filter((pair) => pair.required)
      .map((pair) =>
        `${pair.key}:${pair.value ? pair.value : ''}`
      )
      .join("\n");
  };

  // Function to handle textarea blur event
  const onBlurHandler = (text) => {
    let data = text;
    try {
      const parsedData = JSON.parse(text);
      const keyValueArray = Object.entries(parsedData)?.map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        } else {
          return `${key}: ${value}`;
        }
      });
      data = keyValueArray?.join("\n");
    } catch (error) { }
    const pairs = data
      .trim()
      .split("\n")
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) {
          return null;
        }
        const key = line?.substring(0, separatorIndex).trim();
        const value = line?.substring(separatorIndex + 1).trim();

        // Ensure both key and value are present
        return key && value ? { key, value, required: true } : null;
      })
      .filter(Boolean);

    if (pairs.length > 0) {
      setKeyValuePairs(pairs);
      dispatch(updateVariables({ data: pairs, bridgeId: params.id, versionId }));
      updateVersionVariable();
      if (areAllPairsValid(pairs)) {
        setError(false);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  };

  // Function to toggle accordion open/close state
  const toggleAccordion = () => {
    isOpeningRef.current = !isAccordionOpen;
    setIsAccordionOpen((prev) => !prev);
  };

  // Optimized handle for radio input change
  const handleRadioChange = (value) => {
    setIsFormData(value === "formData");
  };

  // Handle dynamic height changes
  useEffect(() => {
    if (isAccordionOpen) {
      if (accordionContentRef.current) {
        const scrollHeight = accordionContentRef.current.scrollHeight;
        setHeight(scrollHeight);
      }
    } else {
      setHeight(0); // Close accordion with transition
    }
  }, [isAccordionOpen, keyValuePairs, isFormData]);

  return (
    <div className="text-base-content" tabIndex={0}>
      <div
        className={`info p-2 ${isAccordionOpen ? 'border border-base-300 rounded-x-lg rounded-t-lg' : 'border border-base-300 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`}
        onClick={() => {
          handleTutorial();
          toggleAccordion();
        }}
      >
        <InfoTooltip
          tooltipContent="Variables let you dynamically insert data into a prompt using this format: {{variable_name}}."
        >
          <span className="cursor-pointer label-text inline-block ml-1">Add Variables</span>
        </InfoTooltip>
        <span className="cursor-pointer">{isAccordionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
      </div>
      {tutorialState?.showSuggestion && (<TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"Addvariables"} TutorialDetails={"Variable Management"}/>)}
      {tutorialState?.showTutorial && (
        <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.Addvariables} flagKey={"Addvariables"} />
      )}

      {/* Accordion Content */}
      <div
        id="accordion-content"
        ref={accordionContentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccordionOpen ? 'border-x border-b border-base-300 rounded-x-lg rounded-b-lg' : ''}`}
        style={{
          height: `${height}px`,
        }}
      >
        <div className="min-h-[300px] w-full p-4">
          <div className="w-full flex flex-col gap-2">
            {/* Radio Buttons for Form Data and Raw Data */}
            <div className="flex flex-row gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="formData"
                  name="dataType"
                  className="radio"
                  value="formData"
                  checked={isFormData}
                  onChange={() => handleRadioChange('formData')}
                />
                <label htmlFor="formData" className="ml-2 cursor-pointer">
                  Form Data
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="rawData"
                  name="dataType"
                  className="radio"
                  value="rawData"
                  checked={!isFormData}
                  onChange={() => handleRadioChange('rawData')}
                />
                <label htmlFor="rawData" className="ml-2 cursor-pointer">
                  Raw Data
                </label>
              </div>
            </div>

            {/* Conditional Rendering based on isFormData */}
            {!isFormData ? (
              <textarea
                className="border-2 border-gray-200 rounded-md p-4 w-full max-h-[400px] focus:outline-none resize-none"
                placeholder={`key: value\nkey: value\nkey: value`}
                rows="8"
                onBlur={(e) => onBlurHandler(e.target.value)}
                defaultValue={formatPairsForTextarea()}
              />
            ) : (
              <div className="flex flex-col gap-4 max-h-56 overflow-y-auto mt-4 w-full items-start">
                {keyValuePairs.length > 0 && <div className="flex items-center gap-2 w-full">
                  <InfoTooltip
                    tooltipContent="Mark checkbox if it is required"
                    className="cursor-pointer"
                  >
                    <button className="btn btn-sm p-1 bg-base-200 border border-base-300 rounded-full hover:bg-base-300">
                      <InfoIcon className="w-4 h-4 text-base-content/70" />
                    </button>
                  </InfoTooltip>
                  <div className="grid grid-cols-2 gap-4 w-full px-4 bg-base-200/30 py-2 rounded-lg">
                    <span className="text-sm font-medium text-base-content/80">Key</span>
                    <span className="text-sm font-medium text-base-content/80">Value</span>
                  </div>
                </div>}
                {keyValuePairs?.map((pair, index) => (
                  <div key={index} className="flex items-center gap-4 w-full">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm w-20"
                      checked={pair.required}
                      onChange={() => handleCheckKeyValuePair(index)}
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="Enter key"
                      value={pair?.key || ""}
                      onChange={(e) =>
                        handleKeyValueChange(index, "key", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      placeholder="Enter value"
                      value={pair?.value || ""}
                      onChange={(e) =>
                        handleKeyValueChange(index, "value", e.target.value)
                      }
                      onBlur={() => updateVersionVariable()}
                    />
                    <button
                      className="text-red-500 hover:text-red-700 ml-2"
                      onClick={() => handleRemoveKeyValuePair(index)}
                      aria-label="Remove Variable"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {error === true && (
                  <p className="text-red-400 text-sm">
                    Please fill out all existing key-value pairs before adding a new one.
                  </p>
                )}
                {variablesKeyValue.length === 0 && (
                  <p className="text-center text-lg font-semibold w-full">No Variables Found</p>
                )}
                <button
                  className="btn btn-sm mt-4 self-center border border-base-300 bg-base-100 hover:bg-base-200"
                  onClick={handleAddKeyValuePair}
                >
                  Add Variable
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariable;
