import { optimizeJsonApi, updateFlow, updateFlowDescription } from "@/config";
import { parameterTypes } from "@/jsonFiles/bridgeParameter";
import {
  updateBridgeAction,
  updateFuntionApiAction,
} from "@/store/action/bridgeAction";
import { closeModal, flattenParameters } from "@/utils/utility";
import { isEqual } from "lodash";
import { CopyIcon, InfoIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/Icons";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "@/components/UI/Modal";
import InfoTooltip from "@/components/InfoTooltip";
import { useCustomSelector } from "@/customHooks/customSelector";
import { ChevronsUpDown, PlusCircleIcon } from "lucide-react";

// Parameter Card Component
const ParameterCard = ({
  paramKey,
  param,
  depth = 0,
  path = [],
  onDelete,
  onAddChild,
  onRequiredChange,
  onDescriptionChange,
  onTypeChange,
  onEnumChange,
  onParameterNameChange,
  variablesPath,
  onVariablePathChange,
  name,
  isMasterAgent,
  background_color,
  toolData
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingName, setEditingName] = useState(paramKey);
  const [editingEnum, setEditingEnum] = useState(JSON.stringify(param.enum || []));
  
  // Update editingName when paramKey changes (after successful rename)
  useEffect(() => {
    setEditingName(paramKey);
  }, [paramKey]);
  
  // Update editingEnum when param.enum changes
  useEffect(() => {
    setEditingEnum(JSON.stringify(param.enum || []));
  }, [param.enum]);
  
  const currentPath = [...path, paramKey].join(".");
  const hasChildren = param.type === "object" && param.parameter;
  const childCount = hasChildren ? Object.keys(param.parameter).length : 0;
  const bgColor = depth % 2 === 0 ? "bg-base-100" : "bg-base-200"
  
  return (
    <div className={`${bgColor} border border-base-300 rounded-lg p-2`}>
      {/* Parameter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 justify-between w-full">
          <input
            type="text"
            value={editingName}
            className="w-1/2 text-xs font-medium bg-transparent p-0 focus:outline-none"
            readOnly={false}
            onChange={(e) => {
              setEditingName(e.target.value);
            }}
            onBlur={(e) => {
              if (onParameterNameChange && e.target.value.trim() !== paramKey && e.target.value.trim() !== '') {
                onParameterNameChange(currentPath, e.target.value.trim(), paramKey);
              } else if (e.target.value.trim() === '') {
                setEditingName(paramKey); // Reset to original if empty
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.target.blur(); // Trigger onBlur to save
              }
            }}
            placeholder="Parameter name"
          />
          <div className="flex items-center mr-4 gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={(() => {
                  const keyParts = currentPath.split(".");
                  if (keyParts.length === 1) {
                    // For top-level parameters, check in toolData.required_params
                    return (toolData?.required_params || []).includes(paramKey);
                  } else {
                    // For nested parameters, navigate to the direct parent field
                    const parentKeyParts = keyParts.slice(0, -1);
                    let currentField = toolData?.fields;
                    
                    // Navigate to the parent field that contains this parameter
                    for (let i = 0; i < parentKeyParts.length; i++) {
                      const key = parentKeyParts[i];
                      if (currentField?.[key]?.type === "array") {
                        currentField = currentField[key]?.items;
                      } else {
                        if (i === parentKeyParts.length - 1) {
                          // This is the direct parent - check its required_params
                          currentField = currentField?.[key];
                        } else {
                          // Navigate deeper into nested structure
                          currentField = currentField?.[key]?.parameter;
                        }
                      }
                    }
                    
                    return (currentField?.required_params || []).includes(paramKey);
                  }
                })()}
                disabled={(() => {
                  const keyParts = currentPath.split(".");
                  if (keyParts.length === 1) {
                    // Top-level parameters are always enabled
                    return false;
                  } else {
                    // For nested parameters, check if all parent parameters are required
                    let isParentRequired = true;
                    let currentField = toolData?.fields;
                    
                    // Check each level of parent to ensure they are all required
                    for (let i = 0; i < keyParts.length - 1; i++) {
                      const key = keyParts[i];
                      
                      if (i === 0) {
                        // Check if top-level parent is required
                        isParentRequired = (toolData?.required_params || []).includes(key);
                      } else {
                        // Check if nested parent is required
                        const parentPath = keyParts.slice(0, i);
                        let parentField = toolData?.fields;
                        
                        // Navigate to the field that should contain the required_params
                        for (let j = 0; j < parentPath.length; j++) {
                          const parentKey = parentPath[j];
                          if (parentField?.[parentKey]?.type === "array") {
                            parentField = parentField[parentKey]?.items;
                          } else {
                            if (j === parentPath.length - 1) {
                              parentField = parentField?.[parentKey];
                            } else {
                              parentField = parentField?.[parentKey]?.parameter;
                            }
                          }
                        }
                        
                        isParentRequired = isParentRequired && (parentField?.required_params || []).includes(key);
                      }
                      
                      if (!isParentRequired) break;
                    }
                    
                    return !isParentRequired;
                  }
                })()}
                onChange={() => onRequiredChange(currentPath)}
              />
              <span className={`text-base-content ${(() => {
                const keyParts = currentPath.split(".");
                if (keyParts.length > 1) {
                  // Check if parent is required to determine text opacity
                  let isParentRequired = true;
                  for (let i = 0; i < keyParts.length - 1; i++) {
                    const key = keyParts[i];
                    if (i === 0) {
                      isParentRequired = (toolData?.required_params || []).includes(key);
                    } else {
                      const parentPath = keyParts.slice(0, i);
                      let parentField = toolData?.fields;
                      for (let j = 0; j < parentPath.length; j++) {
                        const parentKey = parentPath[j];
                        if (parentField?.[parentKey]?.type === "array") {
                          parentField = parentField[parentKey]?.items;
                        } else {
                          if (j === parentPath.length - 1) {
                            parentField = parentField?.[parentKey];
                          } else {
                            parentField = parentField?.[parentKey]?.parameter;
                          }
                        }
                      }
                      isParentRequired = isParentRequired && (parentField?.required_params || []).includes(key);
                    }
                    if (!isParentRequired) break;
                  }
                  return !isParentRequired ? 'opacity-50' : '';
                }
                return '';
              })()}`}>
                Required {(() => {
                  const keyParts = currentPath.split(".");
                  if (keyParts.length > 1) {
                    // Check if parent is required
                    let isParentRequired = true;
                    for (let i = 0; i < keyParts.length - 1; i++) {
                      const key = keyParts[i];
                      if (i === 0) {
                        isParentRequired = (toolData?.required_params || []).includes(key);
                      } else {
                        const parentPath = keyParts.slice(0, i);
                        let parentField = toolData?.fields;
                        for (let j = 0; j < parentPath.length; j++) {
                          const parentKey = parentPath[j];
                          if (parentField?.[parentKey]?.type === "array") {
                            parentField = parentField[parentKey]?.items;
                          } else {
                            if (j === parentPath.length - 1) {
                              parentField = parentField?.[parentKey];
                            } else {
                              parentField = parentField?.[parentKey]?.parameter;
                            }
                          }
                        }
                        isParentRequired = isParentRequired && (parentField?.required_params || []).includes(key);
                      }
                      if (!isParentRequired) break;
                    }
                    return !isParentRequired ? '(parent must be required first)' : '';
                  }
                  return '';
                })()}
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={!(currentPath in variablesPath)}
                disabled={name === "Pre Tool"}
                onChange={() => {
                  const updatedVariablesPath = { ...variablesPath };
                  if (currentPath in updatedVariablesPath) {
                    delete updatedVariablesPath[currentPath];
                  } else {
                    updatedVariablesPath[currentPath] = "";
                  }
                  onVariablePathChange(updatedVariablesPath);
                }}
              />
              <span className="text-xs">Fill with AI</span>
            </label>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs">
          <select
            className="select select-xs select-bordered text-xs"
            value={param.type || "string"}
            onChange={(e) => onTypeChange(currentPath, e.target.value)}
          >
            <option value="string">String</option>
            <option value="object">Object</option>
            <option value="array">Array</option>
            <option value="number">Number</option>
            <option value="boolean">Boolean</option>
          </select>
          <button
            onClick={() => onDelete(currentPath)}
            className="btn btn-sm btn-ghost text-error text-xs"
            title="Delete parameter"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Fill with AI and Value Path Options - Moved to Top */}
      

      {/* Description */}
      <div className="text-xs">
        <textarea
          placeholder="Description of parameter..."
          className="col-[1] row-[1] m-0 w-full overflow-y-hidden whitespace-pre-wrap break-words outline-none bg-transparent p-0 caret-black placeholder:text-quaternary dark:caret-slate-200 text-xs resize-none"
          value={param.description || ""}
          onChange={(e) => onDescriptionChange(currentPath, e.target.value)}
        />
      </div>

      {/* Additional Options */}
        <div className={`flex flex-row ${param.type !== "object" ? 'justify-between' : 'justify-end'}`}>
      {param.type !== "object" && (
          <div className="flex items-center gap-1 text-xs mb-1">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={param.hasOwnProperty('enum')}
              onChange={(e) => {
                if (e.target.checked) {
                  onEnumChange(currentPath, "[]");
                } else {
                  onEnumChange(currentPath, null);
                }
              }}
            />
            <span className="text-xs">Set allowed values</span>
          
          {param.hasOwnProperty('enum') && (
            <input
              type="text"
              placeholder="['a','b','c']"
              className="input input-xs input-bordered text-xs"
              value={editingEnum}
              onChange={(e) => {
                setEditingEnum(e.target.value);
              }}
              onBlur={(e) => {
                onEnumChange(currentPath, e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onEnumChange(currentPath, e.target.value);
                }
              }}
            />
          )}
          </div>
           )}
          {((name === 'orchestralAgent' && !isMasterAgent) || (name !== 'orchestralAgent')) && (
            <div className="mb-1 flex flex-row ml-1 items-center justify-end">
              <label className="block text-xs mb-0 mr-1">Value Path:</label>
              <input
                type="text"
                placeholder="your_path"
                className={`input input-xs input-bordered text-xs ${
                  name === "Pre Tool" && !variablesPath[currentPath] ? "border-red-500" : ""
                }`}
                value={variablesPath[currentPath] || ""}
                onChange={(e) => {
                  const updatedVariablesPath = { ...variablesPath };
                  updatedVariablesPath[currentPath] = e.target.value;
                  onVariablePathChange(updatedVariablesPath);
                }}
              />
            </div>
          )}
        </div>
     

      {/* Properties Section for Objects */}
      {param.type === "object" && (
        <div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs font-medium"
            >
              {isExpanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
              <span className="text-xs">Properties</span>
            </button>
            <button
              onClick={() => onAddChild(currentPath)}
              className="btn btn-sm btn-ghost text-primary gap-1"
              title="Add property"
            >
              <PlusCircleIcon size={10} />
              <span className="text-xs">Add property</span>
            </button>
          </div>

          {/* Child Properties */}
          {isExpanded && hasChildren && (
            <div className="space-y-1">
              {Object.entries(param.parameter).map(([childKey, childParam], index) => (
                <ParameterCard
                  key={childKey}
                  paramKey={childKey}
                  param={childParam}
                  depth={depth + 1}
                  path={[...path, paramKey]}
                  onDelete={onDelete}
                  onAddChild={onAddChild}
                  onRequiredChange={onRequiredChange}
                  onDescriptionChange={onDescriptionChange}
                  onTypeChange={onTypeChange}
                  onEnumChange={onEnumChange}
                  onParameterNameChange={onParameterNameChange}
                  variablesPath={variablesPath}
                  onVariablePathChange={onVariablePathChange}
                  name={name}
                  isMasterAgent={isMasterAgent}
                  background_color={index % 2 === 1 ? "bg-black" : "bg-base-200"}
                  toolData={toolData}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function FunctionParameterModal({
  name = "",
  functionId = "",
  Model_Name,
  embedToken = "",
  handleSave = () => {},
  toolData = {},
  setToolData = () => {},
  function_details = {},
  variables_path = {},
  functionName = "",
  variablesPath = {},
  setVariablesPath = () => {},
  isMasterAgent = false,
  params = {},
  tool_name = "",
}) {
  const [toolName, setToolName] = useState(
    (name === "Agent" || name === "orchestralAgent") ? tool_name : toolData?.title || toolData?.endpoint_name
  );
  const [isToolNameManuallyChanged, setIsToolNameManuallyChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const dispatch = useDispatch();
  const { versions } = useCustomSelector(state => ({
    versions: state?.bridgeReducer.org[params?.org_id]?.orgs?.find((item) => item._id === functionId)?.versions || [],
  }));

  useEffect(() => {
    // Only reset toolName if user hasn't manually changed it
    if (!isToolNameManuallyChanged) {
      setToolName(name === "Agent" ? tool_name : toolData?.title || toolData?.endpoint_name);
    }
  }, [toolData, tool_name, isToolNameManuallyChanged]);

  const properties = useMemo(() => function_details?.fields || {}, [function_details?.fields]);
  const isDataAvailable = useMemo(() => Object.keys(properties).length > 0, [properties]);

  const [isModified, setIsModified] = useState(false);
  const [objectFieldValue, setObjectFieldValue] = useState("");
  const [isTextareaVisible, setIsTextareaVisible] = useState(false);
  const [isOldFieldViewTrue, setIsOldFieldViewTrue] = useState(false);
  const [showNameDescription, setShowNameDescription] = useState(false);

  useEffect(() => {
    if (!isEqual(toolData, function_details)) {
      const thread_id = function_details?.thread_id ? function_details?.thread_id : toolData?.thread_id;
      const version_id = function_details?.version_id ? function_details?.version_id : toolData?.version_id;
      setToolData({ ...function_details, thread_id, version_id });
    }
  }, [function_details]);

  useEffect(() => {
    // Only reset toolName if user hasn't manually changed it
    if (!isToolNameManuallyChanged) {
      setToolName(name === "Agent" ? tool_name : toolData?.title || toolData?.endpoint_name);
    }
  }, [tool_name, isToolNameManuallyChanged]);

  useEffect(() => {
    const newVariablesPath = variables_path[functionName] || {};
    if (!isEqual(variablesPath, newVariablesPath)) {
      setVariablesPath(newVariablesPath);
    }
  }, [variables_path, functionName]);

  useEffect(() => {
    if (!toolData) {
      setIsModified(false);
      return;
    }
    setIsModified(!isEqual(toolData, function_details));
  }, [toolData, function_details]);

  useEffect(() => {
    const originalVariablesPath = variables_path[functionName] || {};
    if (!isEqual(variablesPath, originalVariablesPath)) {
      setIsModified(true);
    }
  }, [variablesPath, variables_path, functionName]);

  useEffect(() => {
    if (toolData) {
      const jsonData = {
        name: toolName,
        description: toolData.description || "",
        fields: toolData.fields || {}
      };
      setObjectFieldValue(JSON.stringify(jsonData, null, 2));
    }
  }, [toolData, toolName]);

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
    try {
      const parsedData = JSON.parse(objectFieldValue) || {};
      
      // Check if the JSON has the new structure (name, description, fields) or old structure (just fields)
      let properties, toolDescription, toolName;
      
      if (parsedData.hasOwnProperty('fields') || parsedData.hasOwnProperty('name') || parsedData.hasOwnProperty('description')) {
        // New structure
        properties = parsedData.fields || {};
        toolDescription = parsedData.description || function_details?.["description"] || "";
        toolName = parsedData.name || function_details?.["endpoint_name"] || function_details?.["function_name"];
      } else {
        // Old structure - treat as fields only
        properties = parsedData;
        toolDescription = function_details?.["description"] || "";
        toolName = function_details?.["endpoint_name"] || function_details?.["function_name"];
      }
      
      const toolCallFormat = {
        type: "function",
        function: {
          name: function_details?.["function_name"],
          description: toolName ? `Name: ${toolName}, Description: ${toolDescription}` : `Description: ${toolDescription}`,
          parameters: {
            type: "object",
            properties: properties,
            required_params: function_details?.["required_params"] || [],
            additionalProperties: false,
          },
        },
      };
      copyToClipboard(JSON.stringify(toolCallFormat, undefined, 4));
    } catch (error) {
      toast.error("Invalid JSON format. Cannot copy tool call format.");
      console.error("JSON Parsing Error:", error.message);
    }
  }, [function_details, objectFieldValue, copyToClipboard]);

  const updateField = useCallback((fields, keyParts, updateFn) => {
    const fieldClone = JSON.parse(JSON.stringify(fields));

    const _updateField = (currentFields, remainingKeyParts) => {
      if (remainingKeyParts.length === 1) {
        currentFields[remainingKeyParts[0]] = updateFn(
          currentFields[remainingKeyParts[0]]
        );
      } else {
        const [head, ...tail] = remainingKeyParts;
        if (currentFields[head]) {
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

  const handleAddParameter = useCallback(() => {
    setToolData((prevToolData) => {
      const fields = prevToolData.fields || {};
      let counter = 0;
      let newKey = `new${counter}`;
      while (fields[newKey]) {
        counter++;
        newKey = `new${counter}`;
      }

      return {
        ...prevToolData,
        fields: {
          ...fields,
          [newKey]: {
            type: "string",
            description: "",
          },
        },
      };
    });
    setIsModified(true);
  }, []);

  const handleAddChildParameter = useCallback((parentPath) => {
    setToolData((prevToolData) => {
      const updatedFields = updateField(
        prevToolData.fields,
        parentPath.split("."),
        (field) => {
          if (!field.parameter) {
            field.parameter = {};
          }

          let counter = 0;
          let newKey = `new${counter}`;
          while (field.parameter[newKey]) {
            counter++;
            newKey = `new${counter}`;
          }

          field.parameter[newKey] = {
            type: "string",
            description: "",
          };

          return field;
        }
      );

      return {
        ...prevToolData,
        fields: updatedFields,
      };
    });
    setIsModified(true);
  }, [updateField]);

  const handleDeleteParameter = useCallback((path) => {
    setToolData((prevToolData) => {
      const keyParts = path.split(".");
      const newFields = JSON.parse(JSON.stringify(prevToolData.fields));

      if (keyParts.length === 1) {
        delete newFields[keyParts[0]];
      } else {
        let current = newFields;
        for (let i = 0; i < keyParts.length - 1; i++) {
          const key = keyParts[i];
          if (current[key].type === "array") {
            current = current[key].items;
          } else {
            current = current[key].parameter;
          }
        }
        delete current[keyParts[keyParts.length - 1]];
      }

      return {
        ...prevToolData,
        fields: newFields,
      };
    });
    setIsModified(true);
  }, []);

  const handleRequiredChange = useCallback((key) => {
    const keyParts = key.split(".");
    if (keyParts.length === 1) {
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
      setToolData((prevToolData) => {
        const updatedFields = updateField(
          prevToolData.fields,
          keyParts.slice(0, -1),
          (field) => {
            if (!field) {
              console.warn(`Field not found for key: ${keyParts.slice(0, -1).join(".")}`);
              return {};
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
    setIsModified(true);
  }, [updateField]);

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
    setIsModified(true);
  }, [updateField]);

  const handleParameterNameChange = useCallback((currentPath, newName, oldName) => {
    if (!newName.trim() || newName === oldName) return;
    
    const keyParts = currentPath.split(".");
    const parentPath = keyParts.slice(0, -1);
    
    setToolData((prevToolData) => {
      // Handle top-level parameters (direct children of toolData.fields)
      if (parentPath.length === 0) {
        const newFields = { ...prevToolData.fields };
        const paramData = newFields[oldName];
        
        // Remove old key and add new key
        delete newFields[oldName];
        newFields[newName] = paramData;
        
        // Update required_params if the old name was required
        let newRequiredParams = prevToolData.required_params || [];
        if (newRequiredParams.includes(oldName)) {
          newRequiredParams = newRequiredParams.filter(name => name !== oldName);
          newRequiredParams.push(newName);
        }
        
        return {
          ...prevToolData,
          fields: newFields,
          required_params: newRequiredParams
        };
      }
      
      // Handle nested parameters
      const updatedFields = updateField(
        prevToolData.fields,
        parentPath,
        (parentField) => {
          if (!parentField.parameter) return parentField;
          
          // Create new parameter object with renamed key
          const newParameter = { ...parentField.parameter };
          const paramData = newParameter[oldName];
          
          // Remove old key and add new key
          delete newParameter[oldName];
          newParameter[newName] = paramData;
          
          // Update required_params if the old name was required
          let newRequiredParams = parentField.required_params || [];
          if (newRequiredParams.includes(oldName)) {
            newRequiredParams = newRequiredParams.filter(name => name !== oldName);
            newRequiredParams.push(newName);
          }
          
          return {
            ...parentField,
            parameter: newParameter,
            required_params: newRequiredParams
          };
        }
      );
      
      return {
        ...prevToolData,
        fields: updatedFields,
      };
    });
    
    setIsModified(true);
  }, [updateField]);

  const handleToolNameChange = useCallback(() => {
    if (toolName.trim() === "") {
      toast.error("Agent name cannot be empty");
      return;
    } else if (toolName.trim() !== tool_name.trim()) {
      dispatch(updateBridgeAction({
        bridgeId: functionId,
        dataToSend: { name: toolName.trim() },
      }));
    }
  }, [toolName, tool_name, dispatch, functionId]);

  const handleSaveData = useCallback(() => {
    if (toolData?.description?.trim() != function_details?.description?.trim() || (((name === "Tool") || (name === "Pre Tool")) && toolData?.title?.trim() !== toolName?.trim())) {
      handleUpdateFlow();
    }

    if ((name === "Agent" && tool_name.trim() !== toolName.trim())) {
      handleToolNameChange();
    }
    handleSave();
    resetModalData();
    closeModal(Model_Name);
  }, [toolData?.description, function_details?.description, toolName, tool_name, Model_Name, toolData, variablesPath]);

  const resetModalData = useCallback(() => {
    setToolData(function_details);
    setObjectFieldValue("");
    setIsTextareaVisible(false);
    setIsDescriptionEditing(false);
    setIsModified(false);
    setIsToolNameManuallyChanged(false);
  }, [function_details]);

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
          parameter: newType === "string" ? undefined : newType === "object" ? (isParameterOrItemsPresent || {}) : undefined,
          ...(newType === "object" ? { enum: [], description: "" } : {}),
        };
      });
    }

    setToolData((prevToolData) => ({
      ...prevToolData,
      fields: updatedField,
    }));
    setIsModified(true);
  }, [toolData?.fields, updateField]);

  const handleEnumChange = useCallback((key, newEnum) => {
    try {
      // Handle null case (when unchecking the checkbox)
      if (newEnum === null) {
        setToolData((prevToolData) => {
          const updatedFields = updateField(
            prevToolData.fields,
            key.split("."),
            (field) => {
              const { enum: removedEnum, ...fieldWithoutEnum } = field;
              return fieldWithoutEnum;
            }
          );
          return {
            ...prevToolData,
            fields: updatedFields,
          };
        });
        setIsModified(true);
        return;
      }

      if (!newEnum || !newEnum.trim()) {
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
    setIsModified(true);
  }, [updateField]);

  const handleToggleChange = useCallback((e) => {
    if (e.target.checked) {
      // Include name, description, and fields in the JSON
      const toolDataForJson = {
        name: toolName,
        description: toolData?.description || "",
        fields: toolData["fields"] || {}
      };
      setObjectFieldValue(JSON.stringify(toolDataForJson, undefined, 4));
      setIsTextareaVisible((prev) => !prev);
    } else if (!e.target.checked) {
      try {
        const updatedData = JSON.parse(objectFieldValue);
        if (typeof updatedData !== "object" || updatedData === null) {
          throw new Error("Invalid JSON format. Please enter a valid object.");
        }
        
        // Extract name, description, and fields from the JSON
        const { name, description, fields, ...rest } = updatedData;
        
        // Update toolData with fields and description
        setToolData((prevToolData) => ({
          ...prevToolData,
          ...(fields && { fields }),
          ...(description !== undefined && { description }),
          ...rest // Include any other properties from JSON
        }));
        
        // Update toolName if provided in JSON
        if (name && name !== toolName) {
          setToolName(name);
          setIsToolNameManuallyChanged(true);
          setIsModified(true);
        }
        
        setIsTextareaVisible((prev) => !prev);
      } catch (error) {
        toast.error("Invalid JSON format. Please correct the data.");
        console.error("JSON Parsing Error:", error.message);
      }
    } else {
      toast.error("Must be valid json");
    }
  }, [toolData, objectFieldValue, toolName]);

  const handleTextFieldChange = useCallback(() => {
    try {
      const updatedData = JSON.parse(objectFieldValue);
      if (typeof updatedData !== "object" || updatedData === null) {
        throw new Error("Invalid JSON format. Please enter a valid object.");
      }
      
      // Check if the JSON has the new structure (name, description, fields) or old structure (just fields)
      if (updatedData.hasOwnProperty('fields') || updatedData.hasOwnProperty('name') || updatedData.hasOwnProperty('description')) {
        // New structure with name, description, and fields
        const { name, description, fields, ...rest } = updatedData;
        
        setToolData((prevToolData) => ({
          ...prevToolData,
          ...(fields && { fields }),
          ...(description !== undefined && { description }),
          ...rest
        }));
        
        // Update toolName if provided in JSON
        if (name && name !== toolName) {
          setToolName(name);
          setIsToolNameManuallyChanged(true);
          setIsModified(true);
        }
      } else {
        // Old structure - treat the entire JSON as fields
        setToolData((prevToolData) => ({
          ...prevToolData,
          fields: updatedData,
        }));
      }
    } catch (error) {
      toast.error("Invalid JSON format. Please correct the data.");
      console.error("JSON Parsing Error:", error.message);
    }
  }, [objectFieldValue, toolName]);

  const handleVariablePathChange = useCallback((updatedPath) => {
    name === "orchestralAgent" && setIsModified(true);
    setVariablesPath(updatedPath);
  }, [name]);

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

  const handleUpdateFlow = useCallback(async () => {
    if (isDescriptionEditing && !toolData?.description?.trim()) {
      toast.error('Description cannot be empty');
      return;
    }
    if (toolName.trim() === "") {
      toast.error("Agent name cannot be empty");
      return;
    }
    if (name !== "Agent" && name !== "orchestralAgent") {
      try {
        const flowResponse = await updateFlow(embedToken, toolData.function_name, toolData?.description || "", toolName);
        if (flowResponse?.metadata?.description) {
          const { _id, description, ...dataToSend } = toolData;
          await dispatch(updateFuntionApiAction({
            function_id: functionId,
            dataToSend: { ...dataToSend, description: flowResponse?.metadata?.description, title: flowResponse?.title, endpoint_name: flowResponse?.title }
          }));
          setToolData(prev => ({ ...prev, description: flowResponse.metadata.description, title: flowResponse.title, endpoint_name: flowResponse.title }));
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
  }, [toolData, functionId, isDescriptionEditing, toolName]);

  return (
    <Modal MODAL_ID={Model_Name}>
      <div className="modal-box max-w-4xl overflow-hidden text-xs max-h-[90%] my-20 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start flex-col mb-3 pb-2 border-b gap-1 border-base-300">
          <div className="flex justify-between w-full items-center">
          <h2 className="text-lg font-semibold">Config {name}</h2>
          <div className="flex justify-end gap-2 mt-1">
            <select 
              className="select select-xs select-bordered text-xs min-w-20"
              value={isTextareaVisible ? 'advanced' : 'simple'}
              onChange={(e) => {
                const isAdvanced = e.target.value === 'advanced';
                handleToggleChange({ target: { checked: isAdvanced } });
              }}
            >
              <option value="simple">Simple</option>
              <option value="advanced">Advanced</option>
            </select>
            {isTextareaVisible && (
              <div className="flex items-center text-xs gap-2">
                <CopyIcon
                  size={14}
                  onClick={copyToolCallFormat}
                  className="cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
          <div className="flex flex-row items-center gap-2">
            {(name === 'Tool' || name === 'Pre Tool') && (
              <div className="flex flex-row gap-1">
                <InfoIcon size={14} />
                <div className="label-text-alt">
                  Function used in {(function_details?.bridge_ids || [])?.length} bridges, changes may affect all bridges.
                </div>
              </div>
            )}
          </div>
          <p className="flex items-center gap-1 whitespace-nowrap text-xs mb-1">
            <InfoIcon size={14} /> You can change the data in raw json format. For more info click{" "}
            <a
              href="/faq/jsonformatdoc"
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary underline cursor-pointer"
            >
              here
            </a>
          </p>
        </div>
        <div className="flex flex-row mb-1">
          
          <div className="flex gap-2">
            {(name === 'Agent' || (name === 'orchestralAgent' && isMasterAgent)) && (
              <div className="flex items-center justify-between gap-1 mr-12 text-xs">
                <div className="flex items-center gap-2">
                  <InfoTooltip className="info" tooltipContent="Enable to save the conversation using the same thread_id of the agent it is connected with.">
                    <label className="label p-0 info flex items-center">
                      <span className="mr-2">Agent's Thread ID</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        onChange={(e) => {
                          setToolData({ ...toolData, thread_id: e.target.checked });
                          setIsModified(true);
                        }}
                        checked={!!toolData?.thread_id}
                        title="Toggle to include thread_id while calling function"
                      />
                    </label>
                  </InfoTooltip>
                </div>

                {Array.isArray(versions) && versions.length > 0 && (
                  <div className="flex flex-row ml-2">
                    <div className="form-control flex flex-row w-full max-w-xs items-center">
                      <label className="label">
                        <InfoTooltip tooltipContent="Select the version of the agent you want to use.">
                          <span className="label-text info">Agent's Version</span>
                        </InfoTooltip>
                      </label>
                      <select
                        className="select select-xs select-bordered ml-2"
                        value={toolData?.version_id || ''}
                        onChange={(e) => {
                          setToolData({ ...toolData, version_id: e.target.value });
                          setIsModified(true);
                        }}
                      >
                        {versions.map((v, idx) => (
                          <option key={v} value={v}>
                            Version {idx + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        <div className="flex justify-between items-center mb-1">
         
                 
          <div>
            {toolData?.old_fields && isTextareaVisible && (
              <div className="flex items-center text-sm gap-3">
                <p>Check for old data</p>
                <input
                  type="checkbox"
                  className="toggle toggle-sm"
                  checked={isOldFieldViewTrue}
                  onChange={() => {
                    setIsOldFieldViewTrue((prev) => !prev);
                  }}
                  title="Toggle to edit object parameter"
                />
              </div>
            )}
          </div>
        <div className="flex justify-between">
          

          {isTextareaVisible && (
            <p
              className="cursor-pointer label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
              onClick={handleOptimizeRawJson}
            >
              Optimize Json Format
            </p>
          )}
        </div>
        </div>


        {/* Main Content Area - Scrollable center section */}
        <div className={`flex-1 ${isTextareaVisible ? 'overflow-hidden' : ' overflow-x-hidden overflow-y-auto'}`}>
          {!isTextareaVisible ? (
              <> 
            {/* Name and Description Toggle */}
            <div className="mb-3">
              <button
                onClick={() => setShowNameDescription(!showNameDescription)}
                className="flex items-center gap-2 text-xs  font-semibold text-base-content transition-colors"
              >
               <h1 className="text-xs">Name & Description</h1>
                {showNameDescription ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
              </button>
              
              {showNameDescription && (
                <div className="space-y-1 mt-1 pl-2 border-l-2 border-base-300">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Name
                    </label>
                    {name === "Orchestral Agent" ? (
                      <input
                        type="text"
                        className="input input-sm text-xs input-bordered w-full"
                        value={tool_name}
                        disabled
                      />
                    ) : (
                        <input className="input input-sm text-xs input-bordered w-full" value={toolName}
                          onChange={(e) => {
                            setToolName(e.target.value);
                            setIsToolNameManuallyChanged(true);
                            setIsModified(true);
                          }}
                          maxLength={50}
                          placeholder="Enter tool name"></input>
                    )}
                  </div>

                  {/* Description Field */}
                  <div>
                    <label className="block text-xs mb-1">
                      Description
                    </label>
                    <textarea
                      className="textarea bg-white dark:bg-black/15 textarea-sm textarea-bordered w-full resize-y"
                      rows={2}
                      value={toolData?.description || ""}
                      onChange={(e) => {
                        setToolData({ ...toolData, description: e.target.value });
                        setIsModified(true);
                      }}
                      placeholder="Enter tool description"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-xs text-base-content">Parameters</h3>
              <button
                onClick={handleAddParameter}
                className="btn btn-sm btn-primary gap-1"
              >
                <PlusCircleIcon size={16} />
                Parameter
              </button>
            </div>
            <div className="space-y-3 flex-1">
              {Object.entries(toolData?.fields || {}).length > 0 ? (
                Object.entries(toolData?.fields || {}).map(([key, param]) => (
                  <ParameterCard
                    key={key}
                    paramKey={key}
                    param={param}
                    depth={0}
                    path={[]}
                    onDelete={handleDeleteParameter}
                    onAddChild={handleAddChildParameter}
                    onRequiredChange={handleRequiredChange}
                    onDescriptionChange={handleDescriptionChange}
                    onTypeChange={handleTypeChange}
                    onEnumChange={handleEnumChange}
                    onParameterNameChange={handleParameterNameChange}
                    variablesPath={variablesPath}
                    onVariablePathChange={handleVariablePathChange}
                    name={name}
                    isMasterAgent={isMasterAgent}
                    toolData={toolData}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center h-full min-h-[100px]">
                  <div className="text-xs opacity-60 text-gray-500 text-center">
                    No parameters defined yet. Click the "+ Parameter" button above to add your first parameter.
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={isOldFieldViewTrue ? "flex items-center gap-2" : ""}>
            <textarea
              type="input"
              value={objectFieldValue}
              className="textarea bg-white dark:bg-black/15 textarea-bordered border border-base-300 w-full min-h-96 resize-y"
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
                className="textarea bg-white dark:bg-black/15 textarea-bordered border border-base-300 w-full min-h-96 resize-y"
              />
            )}
          </div>
        )}
        </div>
        
        {/* Modal Actions - Always visible at bottom */}
        <div className="modal-action mt-2">
          <form method="dialog" className="flex flex-row gap-2">
            <button className="btn btn-sm" onClick={handleCloseModal}>
              Close
            </button>
            <button
              className="btn btn-sm btn-primary"
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