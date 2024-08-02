"use client";

import { updateVariables } from "@/store/reducer/bridgeReducer";
import { useDispatch } from "react-redux";
import { useCustomSelector } from "@/customSelector/customSelector";
import { useState, useEffect } from "react";

const AddVariable = ({ id, setShowAddVariablePopup,showAddVaribablePopup }) => {
  const { variablesKeyValue } = useCustomSelector((state) => ({
    variablesKeyValue:
      state?.bridgeReducer?.allBridgesMap?.[id]?.variables || [],
  }));
  const [keyValuePairs, setKeyValuePairs] = useState([]);
  const [variableName, setVariableName] = useState("");

  useEffect(() => {
    setKeyValuePairs(variablesKeyValue);
  }, [variablesKeyValue]);

  const [isFormData, setIsFormData] = useState(false);

  const dispatch = useDispatch();

  const handleAddKeyValuePair = () => {
    const newPair = { key: "", value: "", checked: true };
    const isValid = keyValuePairs.every((pair) => pair.key && pair.value);

    if (isValid) {
      const updatedPairs = [...keyValuePairs, newPair];
      setKeyValuePairs(updatedPairs);
      dispatch(updateVariables({ data: updatedPairs, bridgeId: id }));
    }
  };

  const handleRemoveKeyValuePair = (index) => {
    const updatedPairs = keyValuePairs.filter((_, i) => i !== index);
    setKeyValuePairs(updatedPairs);
    dispatch(updateVariables({ data: updatedPairs, bridgeId: id }));
  };

  const handleKeyValueChange = (index, field, value) => {
    const updatedPairs = [...keyValuePairs];
    updatedPairs[index] = { ...updatedPairs[index], [field]: value };
    setKeyValuePairs(updatedPairs);

    if (updatedPairs[index].key && updatedPairs[index].value) {
      dispatch(updateVariables({ data: updatedPairs, bridgeId: id }));
    }
  };

  const handleCheckKeyValuePair = (index) => {
    const updatedPairs = [...keyValuePairs];
    updatedPairs[index] = {
      ...updatedPairs[index],
      checked: !updatedPairs[index].checked,
    };
    setKeyValuePairs(updatedPairs);

    if (updatedPairs[index].key && updatedPairs[index].value) {
      dispatch(updateVariables({ data: updatedPairs, bridgeId: id }));
    }
  };

  const formatPairsForTextarea = () => {
    return keyValuePairs
      .filter((pair) => pair.checked)
      .map((pair) =>
        pair.key && pair.value ? `${pair.key}:${pair.value}` : ""
      )
      .join("\n");
  };

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
      dispatch(updateVariables({ data: pairs, bridgeId: id }));
    }
  };

  const closeSide = () => {
    setShowAddVariablePopup(false);
  };

  const handleVaribaleName = (e) => {
    setVariableName(e);
  };


  return (
  
    <div className={`fixed top-0 right-0  ${showAddVaribablePopup?"h-screen w-2/5 p-8 bg-gray-100 shadow-lg  z-50 overflow-hidden":"w-0 h-0"}  transition-all ease-in duration-200`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Environment Variable</h1>
        <button
          className="border-2 border-white bg-gray-200 px-3 py-1 rounded-md btn"
          onClick={closeSide}
        >
          Done
        </button>
      </div>
      <div className="flex flex-col mt-8 gap-4">
        <input
          type="text"
          placeholder="Enter Variable Name"
          value={variableName}
          onChange={(e) => {
            handleVaribaleName(e.target.value);
          }}
          className="outline-none p-3 rounded-md w-3/5 border-2 border-gray-200"
        />
        <div className="flex items-center gap-4">
          <input
            type="radio"
            name="radio"
            className="radio"
            value="formData"
            onClick={() => setIsFormData(false)}
            defaultChecked
          />
          <label>Form Data</label>
          <input
            type="radio"
            name="radio"
            className="radio"
            value="rawData"
            onClick={() => setIsFormData(true)}
          />
          <label>Raw Data</label>
        </div>
        {isFormData ? (
          <textarea
            className="border-2 border-gray-200 rounded-md p-4 w-full"
            rows="10"
            onBlur={(e) => onBlurHandler(e.target.value)}
            defaultValue={formatPairsForTextarea()}
          />
        ) : (
          <div className="flex flex-col gap-4 max-h-56 overflow-y-auto mt-4">
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
                  className="btn btn-sm btn-red"
                  onClick={() => handleRemoveKeyValuePair(index)}
                >
                  -
                </button>
              </div>
            ))}
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
  );
};

export default AddVariable;
