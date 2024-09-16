"use client";

import { updateVariables } from "@/store/reducer/bridgeReducer";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customSelector/customSelector";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const AddVariable = ({ params }) => {
  const { variablesKeyValue } = useCustomSelector((state) => ({
    variablesKeyValue:
      state?.bridgeReducer?.allBridgesMap?.[params.id]?.variables || [],
  }));

  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [isFormData, setIsFormData] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false); // Accordion state
  const [height, setHeight] = useState(0); // Dynamic height state
  const [error, setError] = useState(false);

  const dispatch = useDispatch();
  const accordionContentRef = useRef(null); // Ref for the accordion content
  const isOpeningRef = useRef(false); // To track if the accordion is opening

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
    const newPair = { key: "", value: "", checked: true };
    const isValid = areAllPairsValid(keyValuePairs);
    if (isValid) {
      setError(false);
      const updatedPairs = [...keyValuePairs, newPair];
      setKeyValuePairs(updatedPairs);
      dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }));
    } else {
      setError(true);
    }
  };

  // Function to handle removing a key-value pair
  const handleRemoveKeyValuePair = (index) => {
    const updatedPairs = keyValuePairs.filter((_, i) => i !== index);
    setKeyValuePairs(updatedPairs);
    dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }));

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
      dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }));
    }

    setError(false);
  };

  // Function to handle checkbox toggle
  const handleCheckKeyValuePair = (index) => {
    setError(false); // Reset error when a checkbox is toggled
    const updatedPairs = [...keyValuePairs];
    updatedPairs[index] = {
      ...updatedPairs[index],
      checked: !updatedPairs[index].checked,
    };
    setKeyValuePairs(updatedPairs);

    if (updatedPairs[index].key.trim() && updatedPairs[index].value.trim()) {
      dispatch(updateVariables({ data: updatedPairs, bridgeId: params.id }));
    }
  };

  // Function to format key-value pairs for the textarea
  const formatPairsForTextarea = () => {
    return keyValuePairs
      .filter((pair) => pair.checked)
      .map((pair) =>
        pair.key && pair.value ? `${pair.key}:${pair.value}` : ""
      )
      .join("\n");
  };

  // Function to handle textarea blur event
  const onBlurHandler = (text) => {
    const pairs = text
      .trim()
      .split("\n")
      .map((line) => {
        const [key, value] = line.split(":").map((part) => part.trim());
        return key && value ? { key, value, checked: true } : null;
      })
      .filter(Boolean);

    if (pairs.length > 0) {
      setKeyValuePairs(pairs);
      dispatch(updateVariables({ data: pairs, bridgeId: params.id }));

      // Reset error if all pairs are valid
      if (areAllPairsValid(pairs)) {
        setError(false);
      } else {
        setError(true);
      }
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
    <div className="mb-3">
      {/* Accordion Toggle Button */}
      <button
        className="flex items-center justify-start font-medium cursor-pointer focus:outline-none"
        onClick={toggleAccordion}
        aria-expanded={isAccordionOpen}
        aria-controls="accordion-content"
      >
        <span className="mr-2">
          Add Variables
        </span>
        {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
      </button>

      {/* Accordion Content */}
      <div
        id="accordion-content"
        ref={accordionContentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          height: `${height}px`,
        }}
      >
        <div className="min-h-[300px] w-full border border-x-gray-300 rounded-md p-4">
          <div className="w-full flex flex-col items-center gap-2">
            {/* Radio Buttons for Form Data and Raw Data */}
            <div className="flex items-center gap-4">
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
                className="border-2 border-gray-200 rounded-md p-4 w-full max-h-[400px] focus:outline-none"
                placeholder={`key:value\nkey:value\nkey:value`}
                rows="8"
                onBlur={(e) => onBlurHandler(e.target.value)}
                defaultValue={formatPairsForTextarea()}
              />
            ) : (
              <div className="flex flex-col gap-4 max-h-56 overflow-y-auto mt-4 w-full">
                {keyValuePairs?.map((pair, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={pair.checked}
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
                    />
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveKeyValuePair(index)}
                      aria-label="Remove Variable"
                    >
                      <Trash2 />
                    </button>
                  </div>
                ))}
                {error === true && (
                  <p className="text-red-400 text-sm">
                    Please fill out all existing key-value pairs before adding a new one.
                  </p>
                )}
                {
                  variablesKeyValue.length===0 ? <p className="text-center text-lg font-semibold">No Variables Found</p>:""
                }
                <button
                  className="btn btn-blue mt-4 self-center border-2 bg-gray-200 border-white"
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
