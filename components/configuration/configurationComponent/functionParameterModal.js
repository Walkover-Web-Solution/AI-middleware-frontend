import { optimizeJsonApi, updateFlowDescription } from "@/config";
import { parameterTypes } from "@/jsonFiles/bridgeParameter";
import {
  updateApiAction,
  updateBridgeVersionAction,
  updateFuntionApiAction,
} from "@/store/action/bridgeAction";
import { closeModal, flattenParameters } from "@/utils/utility";
import { isEqual } from "lodash";
import { CopyIcon, InfoIcon, TrashIcon, PencilIcon, CloseIcon } from "@/components/Icons";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "@/components/UI/Modal";
import InfoTooltip from "@/components/InfoTooltip";

function FunctionParameterModal({
  name = "",
  functionId = "",
  Model_Name,
  embedToken = "",
  handleRemove = () => { },
  handleSave = () => { },
  toolData = {},
  setToolData = () => { },
  function_details = {},
  variables_path = {},
  functionName = "",
  variablesPath = {},
  setVariablesPath = () => { },
  isMasterAgent = false
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const dispatch = useDispatch();

  // Memoize properties to prevent unnecessary re-renders
  const properties = useMemo(() => function_details?.fields || {}, [function_details?.fields]);

  // Memoize isDataAvailable calculation
  const isDataAvailable = useMemo(() =>
    Object.keys(properties).length > 0,
    [properties]
  );

  const [isModified, setIsModified] = useState(false);
  const [objectFieldValue, setObjectFieldValue] = useState("");
  const [isTextareaVisible, setIsTextareaVisible] = useState(false);

  // Memoize flattenedParameters to prevent recalculation
  const flattenedParameters = useMemo(() =>
    flattenParameters(toolData?.fields || {}),
    [toolData?.fields]
  );

  const [isOldFieldViewTrue, setIsOldFieldViewTrue] = useState(false);

  // Fix: Add proper dependencies and use useCallback to prevent infinite loops
  useEffect(() => {
    // Only update if function_details actually changed
    if (!isEqual(toolData, function_details)) {
      setToolData(function_details);
    }
  }, [function_details, setToolData]); // Add setToolData to dependencies

  useEffect(() => {
    // Only update if variables_path[functionName] actually changed
    const newVariablesPath = variables_path[functionName] || {};
    if (!isEqual(variablesPath, newVariablesPath)) {
      setVariablesPath(newVariablesPath);
    }
  }, [variables_path, functionName]); // Remove variablesPath from dependencies to prevent loop

  // Fix: Separate the isModified calculations into different effects
  useEffect(() => {
    setIsModified(!isEqual(toolData, function_details));
  }, [toolData, function_details]);

  useEffect(() => {
    // Only check if variablesPath is different from the original
    const originalVariablesPath = variables_path[functionName] || {};
    if (!isEqual(variablesPath, originalVariablesPath)) {
      setIsModified(true);
    }
  }, [variablesPath, variables_path, functionName]);

  const copyToClipboard = useCallback((content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        toast.success("Content copied to clipboard");
      })
      .catch((error) => {
        console.error("Error copying content to clipboard:", error);
      });
  }, []);

  const copyToolCallFormat = useCallback(() => {
    const toolCallFormat = {
      type: "function",
      function: {
        name: function_details?.["function_name"],
        description:
          (function_details?.["endpoint_name"]
            ? "Name: " + function_details["endpoint_name"] + ", "
            : "") +
          "Description: " +
          function_details?.["description"],
        parameters: {
          type: "object",
          properties: JSON.parse(objectFieldValue) || {},
          required_params: function_details?.["required_params"] || [],
          additionalProperties: false,
        },
      },
    };
    copyToClipboard(JSON.stringify(toolCallFormat, undefined, 4));
  }, [function_details, objectFieldValue, copyToClipboard]);

  const handleRequiredChange = useCallback((key) => {
    const keyParts = key.split(".");
    if (keyParts.length === 1) {
      // Top-level field
      setToolData((prevToolData) => {
        const updatedRequiredParams = prevToolData.required_params || [];
        const newRequiredParams = updatedRequiredParams.includes(keyParts[0])
          ? updatedRequiredParams.filter((item) => item !== keyParts[0])
          : [...updatedRequiredParams, keyParts[0]];

        return {
          ...prevToolData,
          required_params: newRequiredParams,
        };
      });
    } else {
      // Nested field
      setToolData((prevToolData) => {
        const updatedFields = updateField(
          prevToolData.fields,
          keyParts.slice(0, -1),
          (field) => {
            if (!field) {
              console.warn(
                `Field not found for key: ${keyParts.slice(0, -1).join(".")}`
              );
              return {}; // Return an empty object if field is not found
            }

            const fieldKey = keyParts[keyParts.length - 1];
            const updatedRequiredParams = field.required_params || [];
            const newRequiredParams = updatedRequiredParams.includes(fieldKey)
              ? updatedRequiredParams.filter((item) => item !== fieldKey)
              : [...updatedRequiredParams, fieldKey];

            return {
              ...field,
              required_params: newRequiredParams,
            };
          }
        );

        return {
          ...prevToolData,
          fields: updatedFields,
        };
      });
    }
  }, []);

  const handleDescriptionChange = useCallback((key, newDescription) => {
    setToolData((prevToolData) => {
      const updatedFields = updateField(
        prevToolData.fields,
        key.split("."),
        (field) => ({
          ...field,
          description: newDescription,
        })
      );
      return {
        ...prevToolData,
        fields: updatedFields,
      };
    });
  }, []);

  const updateField = useCallback((fields, keyParts, updateFn) => {
    const fieldClone = JSON.parse(JSON.stringify(fields)); // Deep clone the fields

    const _updateField = (currentFields, remainingKeyParts) => {
      if (remainingKeyParts.length === 1) {
        // When we've reached the last key, apply the update function
        currentFields[remainingKeyParts[0]] = updateFn(
          currentFields[remainingKeyParts[0]]
        );
      } else {
        const [head, ...tail] = remainingKeyParts;
        if (currentFields[head]) {
          // Determine whether to use 'items' or 'parameter' based on the current type
          const isArray = currentFields[head].type === "array";
          const nestedKey = isArray ? "items" : "parameter";
          currentFields[head][nestedKey] = _updateField(
            currentFields[head][nestedKey] || {},
            tail
          );
        }
      }
      return currentFields;
    };

    return _updateField(fieldClone, keyParts);
  }, []);

  // Reset the modal data to the original function_details
  const resetModalData = useCallback(() => {
    setToolData(function_details);
    setObjectFieldValue("");
    setIsTextareaVisible(false);
    setIsDescriptionEditing(false);
  }, [function_details, setToolData]);

  const handleCloseModal = useCallback(() => {
    resetModalData();
    closeModal(Model_Name);
  }, [resetModalData, Model_Name]);

  const handleTypeChange = useCallback((key, newType) => {
    let updatedField;
    if (newType === "array") {
      updatedField = updateField(
        toolData?.fields,
        key?.split("."),
        (field) => ({
          ...field,
          type: newType,
          items: { type: "string" },
          required_params: [],
          ...(field?.parameter ? { parameter: undefined } : {}),
        })
      );
    } else {
      updatedField = updateField(toolData?.fields, key.split("."), (field) => {
        const { items, parameter, ...rest } = field;
        const isParameterOrItemsPresent = parameter;
        return {
          ...rest,
          type: newType,
          parameter:
            newType === "string" ? undefined : isParameterOrItemsPresent || {},
          ...(newType === "object" ? { enum: [], description: "" } : {}),
        };
      });
    }

    setToolData((prevToolData) => ({
      ...prevToolData,
      fields: updatedField,
    }));
  }, [toolData?.fields, updateField]);

  const handleEnumChange = useCallback((key, newEnum) => {
    try {
      if (!newEnum.trim()) {
        setToolData((prevToolData) => {
          const updatedFields = updateField(
            prevToolData.fields,
            key.split("."),
            (field) => ({
              ...field,
              enum: [],
            })
          );
          return {
            ...prevToolData,
            fields: updatedFields,
          };
        });
        return;
      }

      let parsedEnum = newEnum.trim().replace(/'/g, '"');
      if (parsedEnum.startsWith("[") && parsedEnum.endsWith("]")) {
        parsedEnum = JSON.parse(parsedEnum);
      } else {
        toast.error("Invalid format. Expected a JSON array format.");
        return;
      }

      if (!Array.isArray(parsedEnum)) {
        toast.error("Parsed value is not an array.");
        return;
      }

      setToolData((prevToolData) => {
        const updatedFields = updateField(
          prevToolData.fields,
          key.split("."),
          (field) => ({
            ...field,
            enum: parsedEnum.length === 0 ? [] : parsedEnum,
          })
        );
        return {
          ...prevToolData,
          fields: updatedFields,
        };
      });
    } catch (error) {
      toast.error("Failed to update enum: " + error.message);
    }
  }, [updateField]);

  const getNestedFieldValue = useCallback((fields, keyParts) => {
    return keyParts?.reduce((currentField, key) => {
      if (!currentField) return {};
      // Use 'items' if the current field is 'array', else 'parameter'
      if (currentField?.type === "array") {
        return currentField?.items?.[key] || {};
      }
      return currentField?.parameter?.[key] || currentField?.[key] || {}; // Ensure fallback to an empty object
    }, fields);
  }, []);

  const handleToggleChange = useCallback((e) => {
    if (e.target.checked) {
      setObjectFieldValue(JSON.stringify(toolData["fields"], undefined, 4));
      setIsTextareaVisible((prev) => !prev);
    } else if (!e.target.checked) {
      try {
        const updatedField = JSON.parse(objectFieldValue);
        if (typeof updatedField !== "object" || updatedField === null) {
          throw new Error("Invalid JSON format. Please enter a valid object.");
        }
        setToolData((prevToolData) => ({
          ...prevToolData,
          fields: updatedField,
        }));
        setIsTextareaVisible((prev) => !prev);
      } catch (error) {
        toast.error("Invalid JSON format. Please correct the data.");
        console.error("JSON Parsing Error:", error.message);
      }
    } else {
      toast.error("Must be valid json");
    }
  }, [toolData, objectFieldValue]);

  const handleTextFieldChange = useCallback(() => {
    try {
      const updatedField = JSON.parse(objectFieldValue);
      // Validate that the parsed value is an object
      if (typeof updatedField !== "object" || updatedField === null) {
        throw new Error("Invalid JSON format. Please enter a valid object.");
      }
      setToolData((prevToolData) => ({
        ...prevToolData,
        fields: updatedField,
      }));
    } catch (error) {
      toast.error("Invalid JSON format. Please correct the data.");
      console.error("JSON Parsing Error:", error.message);
    }
  }, [objectFieldValue]);

  const handleVariablePathChange = useCallback((key, value = "") => {
    name === "orchestralAgent" && setIsModified(true);
    setVariablesPath((prevVariablesPath) => {
      return {
        ...prevVariablesPath,
        [key]: value || "",
      };
    });
  }, []);

  const handleOptimizeRawJson = useCallback(async () => {
    try {
      setIsLoading(true);
      const reqJson = JSON.parse(objectFieldValue);
      const result = await optimizeJsonApi({
        data: {
          example_json: reqJson,
        },
      });
      setObjectFieldValue(JSON.stringify(result?.result, undefined, 4));
    } catch (error) {
      console.error("Optimization Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [objectFieldValue]);

  const handleSaveDescription = useCallback(async () => {
    if (!toolData?.description.trim()) {
      toast.error('Description cannot be empty');
      return;
    }
    if (name !== "Agent" && name !== "orchestralAgent") {
      try {
        const flowResponse = await updateFlowDescription(embedToken, toolData.function_name, toolData?.description);
        if (flowResponse?.metadata?.description) {
          const { _id, description, ...dataToSend } = toolData;
          await dispatch(updateFuntionApiAction({
            function_id: functionId,
            dataToSend: { ...dataToSend, description: flowResponse?.metadata?.description }
          }));
          setToolData(prev => ({ ...prev, description: flowResponse.metadata.description }));
          toast.success('Description updated successfully');
          setIsDescriptionEditing(false);
        } else {
          throw new Error('Failed to get updated description from flow API');
        }
      } catch (error) {
        console.error('Failed to update description:', error);
        toast.error('Failed to update description. Please try again.');
      }
    }
  }, [toolData, functionId]);

  const handleSaveData = useCallback(() => {
    if (toolData?.description?.trim() != function_details?.description?.trim()) {
      handleSaveDescription()
    }
    handleSave()
    resetModalData()
    closeModal(Model_Name)
  }, [toolData?.description, function_details?.description, handleSaveDescription, handleSave, resetModalData, Model_Name]);

  return (
    <Modal MODAL_ID={Model_Name}>
      <div className="modal-box w-11/12 max-w-6xl overflow-x-hidden">
        <div className="flex flex-row justify-between mb-3">
          <span className="flex flex-row items-center gap-4">
            <h3 className="font-bold text-lg">Configure fields</h3>
            <div className="flex flex-row gap-1">
              <InfoIcon size={16} />
              <span className="label-text-alt">
                Function used in {(function_details?.bridge_ids || [])?.length}{" "}
                bridges, changes may affect all bridges.
              </span>
            </div>
          </span>
          <div className="flex gap-2">
            <button onClick={() => setIsDescriptionEditing(true)} className="btn btn-sm btn-primary">
              <PencilIcon size={16} /> Update Description
            </button>
            {name !== "orchestralAgent" && <button onClick={() => handleRemove()} className="btn btn-sm btn-error text-white">
              <TrashIcon size={16} /> Remove {name}
            </button>}
          </div>
        </div>

        {/* Description Editor Section */}
        {isDescriptionEditing && (
          <div className="mb-4 p-4 border border-base-300 rounded-lg bg-base-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Update Function Description</h4>
              <button
                onClick={() => { setIsDescriptionEditing(false); setToolData({ ...toolData, description: function_details?.description }) }}
                className="btn btn-sm btn-ghost"
              >
                <CloseIcon size={16} />
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-24 resize-y"
              placeholder="Enter function description..."
              value={toolData?.description}
              onChange={(e) => setToolData({ ...toolData, description: e.target.value })}
            />
          </div>
        )}

        <div className="flex justify-between items-center">
          {isDataAvailable && (
            <div className="flex items-center text-sm gap-3 mb-4">
              <p>Raw JSON format</p>
              <input
                type="checkbox"
                className="toggle"
                checked={isTextareaVisible}
                onChange={handleToggleChange}
                title="Toggle to edit object parameter"
              />
              {isTextareaVisible && (
                <div className="flex items-center gap-2">
                  <p>Copy tool call format: </p>
                  <CopyIcon
                    size={16}
                    onClick={copyToolCallFormat}
                    className="cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
          <div>
            {toolData?.old_fields && isTextareaVisible && (
              <div className="flex items-center text-sm gap-3">
                <p>Check for old data</p>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={isOldFieldViewTrue}
                  onChange={() => {
                    setIsOldFieldViewTrue((prev) => !prev);
                  }}
                  title="Toggle to edit object parameter"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pl-1">
          <p
            colSpan="3"
            className="flex items-center gap-1 whitespace-nowrap text-xs mb-2"
          >
            <InfoIcon size={16} /> You can change the data in raw json format.
            For more info click{" "}
            <a
              href="/faq/jsonformatdoc"
              target="_blank"
              rel="noopener noreferrer"
              className=" link link-primary underline cursor-pointer"
            >
              here
            </a>
          </p>
          {(name==='Agent' || (name==='orchestralAgent' && isMasterAgent))&&
            <div className="flex items-center justify-center gap-2 text-sm">
              <InfoTooltip className="info" tooltipContent="Enable to save the conversation using the same thread_id of the agent it is connected with.">
                <label className="label info">
                  Agent’s Thread ID
                </label>
              </InfoTooltip>
              <input
                type="checkbox"
                className="toggle"
                onChange={(e) => {
                  setToolData({ ...toolData, thread_id: e.target.checked });
                  setIsModified(true);
                }}
                checked={!!toolData?.thread_id}
                title="Toggle to include thread_id while calling function"
              />
            </div>
          }
          {isTextareaVisible && (
            <p
              className="cursor-pointer label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
              onClick={handleOptimizeRawJson}
            >
              Optimize Json Format
            </p>
          )}
        </div>
        {!isDataAvailable ? (
          <p>No Parameters used in the function</p>
        ) : !isTextareaVisible ? (
          <div className="overflow-x-auto border border-base-300 rounded-md">
            <table className="table">
              <thead>
                <tr>
                  <th></th>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Enum: comma separated</th>
                  <th>Fill with AI</th>
                  {((name ==='orchestralAgent' &&  !isMasterAgent) || (name !== 'orchestralAgent')) && <th>Value Path: your_path</th>}
                </tr>
              </thead>
              <tbody>
                {flattenedParameters.map((param, index) => {
                  const currentField = getNestedFieldValue(
                    toolData.fields,
                    param.key.split(".")
                  );
                  const currentType = currentField?.type || param.type || "";
                  const currentDesc = currentField?.description || "";
                  const currentEnum = currentField?.enum || [];
                  return (
                    <tr key={param.key}>
                      <td>{index}</td>
                      <td>{param.key}</td>
                      <td>
                        <select
                          className="select select-sm select-bordered"
                          value={currentType}
                          onChange={(e) =>
                            handleTypeChange(param.key, e.target.value)
                          }
                        >
                          <option value="" disabled>
                            Select parameter type
                          </option>
                          {parameterTypes &&
                            parameterTypes.map((type, index) => (
                              <option key={index} value={type}>
                                {type}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={(() => {
                            const keyParts = param.key.split(".");
                            if (keyParts.length === 1) {
                              return (toolData.required_params || []).includes(
                                param.key
                              );
                            } else {
                              const parentKeyParts = keyParts.slice(0, -1);
                              const nestedField = getNestedFieldValue(
                                toolData.fields,
                                parentKeyParts
                              );
                              return (
                                nestedField?.required_params?.includes(
                                  keyParts[keyParts.length - 1]
                                ) || false
                              );
                            }
                          })()}
                          onChange={() => handleRequiredChange(param.key)}
                        />
                      </td>
                      {/* {currentType !== 'object' && ( */}
                      <td>
                        <input
                          type="text"
                          placeholder="Parameter description"
                          className="input input-bordered w-full input-sm"
                          value={currentDesc}
                          disabled={currentType === "object"}
                          onChange={(e) =>
                            handleDescriptionChange(param.key, e.target.value)
                          }
                        />
                      </td>
                      {/* )} */}
                      <td>
                        <input
                          key={currentEnum}
                          type="text"
                          placeholder="['a','b','c']"
                          className="input input-bordered w-full input-sm"
                          defaultValue={JSON.stringify(currentEnum)}
                          disabled={currentType === "object"}
                          onBlur={(e) =>
                            handleEnumChange(param.key, e.target.value)
                          }
                        />
                      </td>
                     <td>
                        <input
                          type="checkbox"
                          className="checkbox"
                          checked={!(param.key in variablesPath)}
                          disabled={name === "Pre Tool"}
                          onChange={() => {
                            const updatedVariablesPath = { ...variablesPath };
                            if (param.key in updatedVariablesPath) {
                              delete updatedVariablesPath[param.key];
                            } else {
                              updatedVariablesPath[param.key] = ""; // or any default value
                            }
                            setVariablesPath(updatedVariablesPath);
                          }}
                        />
                      </td>
                      {((name==='orchestralAgent' && !isMasterAgent) || !(name==='orchestralAgent')) && <td>
                        <input
                          type="text"
                          placeholder="name"
                          className={`input input-bordered w-full input-sm ${name === "Pre Tool" && !variablesPath[param.key] ? "border-red-500" : ""}`}
                          value={variablesPath[param.key] || ""}
                          onChange={(e) => {
                            handleVariablePathChange(param.key, e.target.value);
                          }}
                        />
                      </td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={isOldFieldViewTrue ? "flex items-center gap-2" : ""}>
            <textarea
              type="input"
              value={objectFieldValue}
              className="textarea textarea-bordered border border-base-300 w-full min-h-96 resize-y"
              onChange={(e) => setObjectFieldValue(e.target.value)}
              onBlur={handleTextFieldChange}
              placeholder="Enter valid JSON object here..."
            />
            {isOldFieldViewTrue && (
              <textarea
                type="text"
                value={
                  toolData?.old_fields
                    ? JSON.stringify(toolData["old_fields"], undefined, 4)
                    : ""
                }
                className="textarea textarea-bordered border border-base-300 w-full min-h-96 resize-y"
              />
            )}
          </div>
        )}
        <div className="modal-action">
          <form method="dialog" className="flex flex-row gap-2">
            <button className="btn" onClick={handleCloseModal}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveData}
              disabled={!isModified || isLoading}
            >
              {isLoading && <span className="loading loading-spinner"></span>}
              Save
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(FunctionParameterModal);