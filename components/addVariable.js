"use client";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { updateVariables } from "@/store/reducer/variableReducer";
import { sendDataToParent, } from "@/utils/utility";
import { ChevronUpIcon, ChevronDownIcon, InfoIcon, TrashIcon } from "@/components/Icons";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import OnBoarding from "./OnBoarding";
import { ONBOARDING_VIDEOS } from "@/utils/enums";
import TutorialSuggestionToast from "./tutorialSuggestoinToast";
import InfoTooltip from "./InfoTooltip";
import Protected from "./protected";

const AddVariable = ({ params, isEmbedUser, searchParams }) => {
  const versionId = searchParams?.version;
  const { variablesKeyValue, prompt, isFirstVariable, bridgeName } = useCustomSelector((state) => ({
    variablesKeyValue: state?.variableReducer?.VariableMapping?.[params?.id]?.[versionId]?.variables || [],
    prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[versionId]?.configuration?.prompt || "",
    isFirstVariable: state.userDetailsReducer.userDetails?.meta?.onboarding?.Addvariables || "",
    bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
  }));
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [isFormData, setIsFormData] = useState(true);
  const [editMode, setEditMode] = useState('key-value'); // 'key-value' or 'bulk'
  const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Accordion state
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
      versionId: versionId,
      dataToSend: {
        'variables_state': Object.assign({}, ...filteredPairs)
      }
    }));
   isEmbedUser && sendDataToParent("updated", { name: bridgeName, agent_id: params?.id, agent_version_id: versionId, variables: variablesKeyValue }, "Agent Version Updated")
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

  // Helper function to check if previous pairs are complete
  const canEditField = (index, field) => {
    // Always allow editing existing pairs
    if (index < keyValuePairs.length) {
      return true;
    }
    
    // For new pairs (empty row), check if all previous pairs are complete
    if (index === keyValuePairs.length) {
      // If no existing pairs, allow editing the first pair
      if (keyValuePairs.length === 0) {
        return true;
      }
      
      // Check if all existing pairs have both key and value filled
      return areAllPairsValid(keyValuePairs);
    }
    
    return false;
  };

  // Function to handle changes in key or value inputs
  const handleKeyValueChange = (index, field, value) => {
    // Check if user can edit this field
    if (!canEditField(index, field)) {
      setError(true);
      return;
    }

    const updatedPairs = [...keyValuePairs];
    
    // If this is the empty row (index equals keyValuePairs.length), add a new pair
    if (index === keyValuePairs.length) {
      const newPair = { key: "", value: "", required: true };
      newPair[field] = value;
      updatedPairs.push(newPair);
    } else {
      // Update existing pair
      updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    }
    
    setKeyValuePairs(updatedPairs);

    // Dispatch update if the current pair is valid
    if (updatedPairs[index] && updatedPairs[index].key.trim() && updatedPairs[index].value.trim()) {
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
      sendDataToParent("updated", { name: bridgeName, agent_id: params?.id, agent_version_id: versionId, variables: updatedPairs}, "Agent Version Updated")
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
      sendDataToParent("updated", { name: bridgeName, agent_id: params?.id, agent_version_id: params?.version, variables: pairs}, "Agent Version Updated")
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
  

  return (
    <div className="text-base-content " tabIndex={0}>
      <div
        className={`info mt-4 p-2 ${isAccordionOpen ? 'border border-base-content/20 rounded-x-lg rounded-t-lg' : 'border border-base-content/20 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`}
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

      {/* Variables Section */}
      {isAccordionOpen && (
        <div className="border-x border-b border-base-content/20 rounded-x-lg rounded-b-lg transition-all duration-300 ease-in-out">
          <div className="h-full w-full bg-base-100 border border-base-300 rounded-lg shadow-sm">
            <div className="p-4">

            <div className="space-y-3">
              {/* Header - only show for key-value mode */}
              {editMode === 'key-value' && (
                <div className="flex items-center justify-between pb-2 border-b border-base-300">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-8 text-xs font-medium text-base-content/60 uppercase tracking-wide text-center">✓</div>
                    <div className="flex-1 text-xs font-medium text-base-content/60 uppercase tracking-wide">Key</div>
                    <div className="flex-1 text-xs font-medium text-base-content/60 uppercase tracking-wide">Value</div>
                    <div className="w-8"></div>
                  </div>
                  <button
                    onClick={() => setEditMode('bulk')}
                    className="btn btn-xs btn-outline text-xs font-medium"
                  >
                    Bulk Edit
                  </button>
                </div>
              )}
              
              {/* Bulk Edit Header */}
              {editMode === 'bulk' && (
                <div className="flex items-center justify-between pb-2 border-b border-base-300">
                  <div className="text-sm text-base-content/70">
                    Enter variables in key:value format (one per line)
                  </div>
                  <button
                    onClick={() => setEditMode('key-value')}
                    className="btn btn-xs btn-outline text-xs font-medium"
                  >
                    Key-Value Edit
                  </button>
                </div>
              )}
              
              {/* Content based on edit mode */}
              {editMode === 'key-value' ? (
                /* Key-Value Pairs */
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {[...keyValuePairs, { key: "", value: "", required: true }]?.map((pair, index) => (
                    <div key={index} className="flex items-center space-x-4 group hover:bg-base-200/50 p-2 rounded">
                      <div className="w-8 flex justify-center">
                        {(pair?.key && pair?.key.trim() !== "") && (
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-primary"
                            checked={index < keyValuePairs.length ? keyValuePairs[index].required : true}
                            onChange={() => handleCheckKeyValuePair(index)}
                            title="Required"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          className={`input input-bordered input-sm w-full text-sm focus:border-primary ${
                            !canEditField(index, "key") ? "input-disabled bg-base-200 cursor-not-allowed" : ""
                          }`}
                          placeholder="Key"
                          value={pair?.key || ""}
                          disabled={!canEditField(index, "key")}
                          onChange={(e) =>
                            handleKeyValueChange(index, "key", e.target.value)
                          }
                          title={!canEditField(index, "key") ? "Complete previous fields before adding new ones" : ""}
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          className={`input input-bordered input-sm w-full text-sm focus:border-primary ${
                            !canEditField(index, "value") ? "input-disabled bg-base-200 cursor-not-allowed" : ""
                          }`}
                          placeholder="Value"
                          value={pair?.value || ""}
                          disabled={!canEditField(index, "value")}
                          onChange={(e) =>
                            handleKeyValueChange(index, "value", e.target.value)
                          }
                          onBlur={() => updateVersionVariable()}
                          title={!canEditField(index, "value") ? "Complete previous fields before adding new ones" : ""}
                        />
                      </div>
                      <div className="w-8 flex justify-center">
                        {index < keyValuePairs.length && (
                          <button
                            className="text-base-content/40 hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                            onClick={() => handleRemoveKeyValuePair(index)}
                            aria-label="Remove Variable"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Bulk Edit */
                <div>
                  <textarea
                    className="textarea textarea-bordered w-full h-64 font-mono text-sm resize-none focus:border-primary"
                    placeholder={`key1: value1\nkey2: value2\nkey3: value3`}
                    onBlur={(e) => onBlurHandler(e.target.value)}
                    defaultValue={formatPairsForTextarea()}
                  />
                </div>
              )}
                
                {/* Error Message */}
                {error === true && (
                  <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Please complete all existing key-value pairs (both key and value) before adding new ones.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Protected(AddVariable);
