import { optimizeJsonApi, updateFlowDescription } from "@/config";
import { parameterTypes } from "@/jsonFiles/bridgeParameter";
import {
  updateFuntionApiAction,
} from "@/store/action/bridgeAction";
import { closeModal, flattenParameters } from "@/utils/utility";
import { isEqual } from "lodash";
import { CopyIcon, InfoIcon, TrashIcon, PencilIcon, CloseIcon, ChevronDownIcon, ChevronUpIcon } from "@/components/Icons";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Modal from "@/components/UI/Modal";
import { PlusIcon } from "lucide-react";
import InfoTooltip from "@/components/InfoTooltip";
import { useCustomSelector } from "@/customHooks/customSelector";

function FunctionParameterModal({
  name = "",
  functionId = "",
  Model_Name,
  embedToken = "",
  handleSave = () => { },
  toolData = {},
  setToolData = () => { },
  function_details = {},
  variables_path = {},
  functionName = "",
  variablesPath = {},
  setVariablesPath = () => { },
  isMasterAgent = false,
  params = {},
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const dispatch = useDispatch();
  const { versions } = useCustomSelector(state => ({
    versions: state?.bridgeReducer.org[params?.org_id]?.orgs.find((item) => item._id === functionId)?.versions || [],
  }));

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
  // Track collapsed parents by key
  const [collapsed, setCollapsed] = useState(() => new Set());

  const toggleCollapse = useCallback((key) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const leftPadding = (key) => Math.max(0, key.split(".").length - 1) * 12;
  
  // Get only parent-level parameters (no nested ones)
  const getParentParameters = useMemo(() => {
    if (!toolData || !toolData.fields) {
      return [];
    }
    return Object.keys(toolData.fields).map((key, index) => ({
      key,
      index,
      type: toolData.fields[key]?.type || 'string'
    }));
  }, [toolData?.fields]);

  const [isOldFieldViewTrue, setIsOldFieldViewTrue] = useState(false);

  // Fix: Add proper dependencies and use useCallback to prevent infinite loops
  useEffect(() => {
    // Only update if function_details actually changed and is not null
    if (function_details && !isEqual(toolData, function_details)) {
      const thread_id = function_details?.thread_id ? function_details?.thread_id : toolData?.thread_id;
      const version_id = function_details?.version_id ? function_details?.version_id : toolData?.version_id;
      setToolData({ ...function_details, thread_id, version_id });
    }
  }, [function_details]);

  useEffect(() => {
    // Only update if variables_path[functionName] actually changed
    if (variables_path && functionName) {
      const newVariablesPath = variables_path[functionName] || {};
      if (!isEqual(variablesPath, newVariablesPath)) {
        setVariablesPath(newVariablesPath);
      }
    }
  }, [variables_path, functionName]);

  // Fix: Separate the isModified calculations into different effects
  useEffect(() => {
    if (toolData && function_details) {
      setIsModified(!isEqual(toolData, function_details));
    }
  }, [toolData, function_details]);

  useEffect(() => {
    // Only check if variablesPath is different from the original
    if (variables_path && functionName) {
      const originalVariablesPath = variables_path[functionName] || {};
      if (!isEqual(variablesPath, originalVariablesPath)) {
        setIsModified(true);
      }
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
    setToolData(null);
    setObjectFieldValue("");
    setIsTextareaVisible(false);
    setIsDescriptionEditing(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    resetModalData();
    closeModal(Model_Name);
  }, [resetModalData, Model_Name]);

  const handleTypeChange = useCallback((key, newType) => {
    if (!toolData || !toolData.fields) {
      toast.error('Tool data is not available');
      return;
    }

    let updatedField;
    if (newType === "array") {
      updatedField = updateField(
        toolData.fields,
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
      if (toolData && toolData.fields) {
        setObjectFieldValue(JSON.stringify(toolData["fields"], undefined, 4));
      } else {
        setObjectFieldValue('{}');
      }
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
  }, [toolData, functionId, embedToken, name]);

  const handleSaveData = useCallback(() => {
    if (toolData?.description?.trim() != function_details?.description?.trim()) {
      handleSaveDescription()
    }
    handleSave()
    resetModalData()
    closeModal(Model_Name)
  }, [toolData?.description, function_details?.description, handleSaveDescription, handleSave, resetModalData, Model_Name]);

  // Adds a child parameter under an object parent: new1, new2, ...
  const handleAddChildField = useCallback((parentKey) => {
    if (!toolData || !toolData.fields) {
      toast.error('Tool data is not available');
      return;
    }

    // Ensure parent is an object param
    const parentField = getNestedFieldValue(toolData.fields, parentKey.split('.'));
    if (!parentField || parentField.type !== 'object') {
      toast.error('Parent must be of type object');
      return;
    }

    // Determine next child name in this scope: new1, new2, ...
    const scope = parentField.parameter || {};
    const existing = Object.keys(scope).filter(k => /^new\d+$/.test(k));
    let i = 0; // children start at 1
    while (existing.includes(`new${i}`)) i += 1;
    const childName = `new${i}`;

    // Insert child into parent.parameter using updateField
    setToolData(prev => {
      const updated = updateField(prev.fields, parentKey.split('.'), (field) => ({
        ...field,
        parameter: {
          ...(field.parameter || {}),
          [childName]: { type: 'string', description: '', enum: [] }
        }
      }));
      return { ...prev, fields: updated };
    });

    setIsModified(true);
    toast.success(`Child '${childName}' added under ${parentKey}`);
  }, [toolData, updateField, getNestedFieldValue, setToolData, setIsModified]);

  // Validate a param name (letters, numbers, underscores, dots allowed; but we only rename leaf so validate leaf)
  const isValidName = (name) => /^[A-Za-z0-9_]+$/.test(name);

  // Check for name collision in the same scope
  const hasCollisionInScope = (fields, parentPathParts, candidate) => {
    // Get scope obj
    const getScope = (root, parts) => {
      if (parts.length === 0) return root;
      const [head, ...tail] = parts;
      const node = root?.[head] || {};
      const isArray = node?.type === "array";
      const nestedKey = isArray ? "items" : "parameter";
      return getScope(node?.[nestedKey] || {}, tail);
    };
    const scope = getScope(fields || {}, parentPathParts || []);
    return Object.prototype.hasOwnProperty.call(scope || {}, candidate);
  };

  // Rename key at a given path in fields; also move required_params in parent
  const renameFieldAtPath = (fields, fullKeyParts, newLeaf) => {
    const clone = JSON.parse(JSON.stringify(fields || {}));
    if (fullKeyParts.length === 1) {
      const oldLeaf = fullKeyParts[0];
      if (oldLeaf === newLeaf) return clone;
      if (!clone[oldLeaf]) return clone;
      // move field
      clone[newLeaf] = clone[oldLeaf];
      delete clone[oldLeaf];
      return clone;
    }

    // Walk to parent
    const parentParts = fullKeyParts.slice(0, -1);
    const oldLeaf = fullKeyParts[fullKeyParts.length - 1];
    let cursor = clone;
    for (let i = 0; i < parentParts.length; i++) {
      const k = parentParts[i];
      const node = cursor[k];
      const isArray = node?.type === "array";
      const nestedKey = isArray ? "items" : "parameter";
      if (i === parentParts.length - 1) {
        // Move property under parent
        const parentNode = cursor[k];
        const nested = parentNode?.[nestedKey] || {};
        if (!nested[oldLeaf]) break;
        nested[newLeaf] = nested[oldLeaf];
        delete nested[oldLeaf];
        parentNode[nestedKey] = nested;
        // Update required_params list in parent
        const rp = Array.isArray(parentNode.required_params) ? [...parentNode.required_params] : [];
        const idx = rp.indexOf(oldLeaf);
        if (idx >= 0) {
          rp[idx] = newLeaf;
          parentNode.required_params = rp;
        }
      } else {
        cursor = node?.[isArray ? "items" : "parameter"] || {};
      }
    }
    return clone;
  };

  // Update variablesPath keys when a parameter is renamed
  const renameVariablesPathKeys = (variablesPath, oldFullKey, newFullKey) => {
    const updated = {};
    const prefix = oldFullKey + ".";
    for (const [k, v] of Object.entries(variablesPath || {})) {
      if (k === oldFullKey) {
        updated[newFullKey] = v;
      } else if (k.startsWith(prefix)) {
        updated[newFullKey + k.slice(prefix.length - 1)] = v; // careful with dot; keep original suffix including dot
      } else {
        updated[k] = v;
      }
    }
    return updated;
  };

  // Handle rename for a full dotted key; newName is the leaf name only
  const handleRenameKey = useCallback((fullKey, newName) => {
    const parts = fullKey.split(".");
    const oldLeaf = parts[parts.length - 1];
    const parentParts = parts.slice(0, -1);

    const trimmed = (newName || "").trim();
    if (!trimmed) {
      toast.error("Name cannot be empty");
      return;
    }
    if (!isValidName(trimmed)) {
      toast.error("Only letters, numbers and underscore are allowed in names");
      return;
    }
    if (trimmed === oldLeaf) return;

    // Check for collision in parent scope
    if (hasCollisionInScope(toolData?.fields || {}, parentParts, trimmed)) {
      toast.error(`A field named '${trimmed}' already exists in this scope`);
      return;
    }

    const newFullKey = [...parentParts, trimmed].join(".");

    // Perform rename
    setToolData(prev => {
      const newFields = renameFieldAtPath(prev.fields, parts, trimmed);
      // Update variablesPath keys that reference the old path
      const newVarPath = renameVariablesPathKeys(variablesPath, fullKey, newFullKey);
      return { ...prev, fields: newFields };
    });
    // Update variables path in store state
    setVariablesPath(prev => renameVariablesPathKeys(prev, fullKey, newFullKey));

    setIsModified(true);
    toast.success(`Renamed '${fullKey}' to '${newFullKey}'`);
  }, [toolData?.fields, variablesPath, setToolData, setVariablesPath, setIsModified]);

  // Render children properties in a nested container
  const renderChildProperties = (parentKey, depth = 0) => {
    const parentField = getNestedFieldValue(toolData?.fields || {}, parentKey.split("."));
    const childEntries = Object.entries(parentField?.parameter || {});
    childEntries.sort((a, b) => a[0].localeCompare(b[0]));

    if (childEntries.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 p-2 bg-base-50 rounded-lg border border-base-200">
          <div className="text-xs text-base-content/70">No child properties</div>
          <button
            onClick={() => handleAddChildField(parentKey)}
            className="btn btn-xs"
            title="Add nested field"
          >
            <PlusIcon size={12} /> Add Child Property
          </button>
        </div>
      );
    }

    return (
      <div className="bg-base-50 rounded-lg border border-base-200 p-2">
        <div className="flex items-center mb-2">
          <button
            onClick={() => handleAddChildField(parentKey)}
            className="btn btn-xs"
            title="Add nested field"
          >
            <PlusIcon size={12} /> Add Child
          </button>
        </div>
        
        <div className="space-y-2">
          {childEntries.map(([childKey, childField], idx) => {
            const fullKey = `${parentKey}.${childKey}`;
            const cType = childField?.type || "string";
            const cDesc = childField?.description || "";
            const cEnum = childField?.enum || [];
            const isRequired = (() => {
              const parentOfChild = getNestedFieldValue(toolData?.fields || {}, parentKey.split("."));
              return parentOfChild?.required_params?.includes(childKey) || false;
            })();

            return (
              <div key={fullKey} className="bg-base-100 rounded border border-base-300 p-3">
                <div className="flex flex-row row-span-1 gap-16 items-center text-xs">
                  {/* Index */}
                  <div className="col-span-1 text-center font-mono text-base-content/60">
                    {idx}
                  </div>
                  
                  {/* Parameter Name */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input input-bordered input-xs w-full"
                      defaultValue={childKey}
                      onBlur={(e) => {
                        const newName = e.target.value;
                        if (newName !== childKey) handleRenameKey(fullKey, newName);
                      }}
                    />
                    {cType === "object" && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => toggleCollapse(fullKey)}
                      >
                        {collapsed.has(fullKey) ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
                      </button>
                    )}
                    </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <select
                      className="select select-xs select-bordered w-fit"
                      value={cType}
                      onChange={(e) => handleTypeChange(fullKey, e.target.value)}
                    >
                      <option value="" disabled>Type</option>
                      {parameterTypes && parameterTypes.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Required */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={isRequired}
                      onChange={() => handleRequiredChange(fullKey)}
                      title="Required"
                    />
                  </div>

                  {/* Description */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Description"
                      className="input input-bordered input-xs w-full"
                      value={cDesc}
                      disabled={cType === "object"}
                      onChange={(e) => handleDescriptionChange(fullKey, e.target.value)}
                    />
                  </div>

                  {/* Enum */}
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="['a','b']"
                      className="input input-bordered input-xs w-full"
                      defaultValue={JSON.stringify(cEnum)}
                      disabled={cType === "object"}
                      onBlur={(e) => handleEnumChange(fullKey, e.target.value)}
                    />
                  </div>

                  {/* Fill with AI */}
                  <div className="col-span-1 flex justify-between gap-3">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs"
                      checked={!(fullKey in variablesPath)}
                      disabled={name === "Pre Tool"}
                      onChange={() => {
                        const updatedVariablesPath = { ...variablesPath };
                        if (fullKey in updatedVariablesPath) {
                          delete updatedVariablesPath[fullKey];
                        } else {
                          updatedVariablesPath[fullKey] = "";
                        }
                        setVariablesPath(updatedVariablesPath);
                      }}
                    />
                  </div>
                  <div className="">
                    <input
                      type="text"
                      placeholder="variable_path"
                      className={`input input-bordered input-xs w-full ${name === "Pre Tool" && !variablesPath[fullKey] ? "border-red-500" : ""}`}
                      value={variablesPath[fullKey] || ""}
                      onChange={(e) => handleVariablePathChange(fullKey, e.target.value)}
                    />
                
                  </div>
                  

                  {/* Actions */}
                 
                    <button
                      onClick={() => handleDeleteField(fullKey)}
                      className="btn btn-ghost btn-xs text-error"
                      title="Delete child"
                    >
                      <TrashIcon size={12} />
                    </button>
                </div>

                {/* Nested children for object types */}
                {cType === "object" && (
                  <div className="mt-3 ml-4">
                    <div className="flex justify-center mb-2">
                    
                    </div>
                    {!collapsed.has(fullKey) && renderChildProperties(fullKey, depth + 1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Value Path column for child properties */}
       
      </div>
    );
  };

  const handleAddField = useCallback(() => {
    if (!toolData || !toolData.fields) {
      toast.error('Tool data is not available');
      return;
    }

    // Find next available newN at root: new0, new1, ...
    const existing = Object.keys(toolData.fields || {});
    const onlyNewKeys = existing.filter(k => /^new\d+$/.test(k));
    let i = 0;
    while (onlyNewKeys.includes(`new${i}`)) i += 1;
    const name = `new${i}`;

    const newField = { type: 'string', description: '', enum: [] };

    setToolData(prev => ({
      ...prev,
      fields: { ...(prev.fields || {}), [name]: newField }
    }));
    setIsModified(true);
    toast.success(`Field '${name}' added`);
  }, [toolData, setToolData]);

  const handleDeleteField = useCallback((fieldKey) => {
    const keyParts = fieldKey.split('.');

    setToolData(prevData => {
      if (keyParts.length === 1) {
        // Top-level field
        const { [keyParts[0]]: deletedField, ...remainingFields } = prevData.fields;
        const updatedRequiredParams = (prevData.required_params || []).filter(
          param => param !== keyParts[0]
        );

        return {
          ...prevData,
          fields: remainingFields,
          required_params: updatedRequiredParams
        };
      } else {
        // Nested field
        const parentPath = keyParts.slice(0, -1);
        const fieldName = keyParts[keyParts.length - 1];

        const updatedFields = updateField(
          prevData.fields,
          parentPath,
          (parentField) => {
            const nestedKey = parentField.type === 'array' ? 'items' : 'parameter';
            const { [fieldName]: deletedField, ...remainingNested } = parentField[nestedKey] || {};

            const updatedRequiredParams = (parentField.required_params || []).filter(
              param => param !== fieldName
            );

            return {
              ...parentField,
              [nestedKey]: remainingNested,
              required_params: updatedRequiredParams
            };
          }
        );

        return {
          ...prevData,
          fields: updatedFields
        };
      }
    });

    // Also remove from variablesPath if exists
    setVariablesPath(prevPath => {
      const { [fieldKey]: deletedPath, ...remainingPaths } = prevPath;
      return remainingPaths;
    });

    toast.success('Field deleted successfully');
  }, [updateField, setVariablesPath]);

  // Early return if essential data is not available
  if (!toolData) {
    return (
      <Modal MODAL_ID={Model_Name}>
        <div className="modal-box w-11/12 max-w-6xl overflow-x-hidden text-sm">
          <div className="flex justify-center items-center h-32">
            <span className="loading loading-spinner loading-lg"></span>
            <span className="ml-2">Loading function data...</span>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal MODAL_ID={Model_Name}>
      <div className="modal-box w-[95%] max-w-[95vw]">
        <div className="flex flex-row justify-between mb-3">
          <span className="flex flex-row items-center gap-4">
            <h3 className="font-bold text-base">Configure fields</h3>
            <div className="flex flex-row gap-1">
              <InfoIcon size={14} />
              <span className="label-text-alt">
                Function used in {(function_details?.bridge_ids || [])?.length}{" "}
                bridges, changes may affect all bridges.
              </span>
            </div>
          </span>
          <div className="flex gap-2">
            {(name === 'Agent' || (name === 'orchestralAgent' && isMasterAgent)) &&
              <div className="flex items-center justify-between gap-1 mr-24 text-xs">
                <div className="flex items-center ml-5 gap-2">
                  <InfoTooltip className="info" tooltipContent="Enable to save the conversation using the same thread_id of the agent it is connected with.">
                    <label className="label info">
                      Agent's Thread ID
                    </label>
                  </InfoTooltip>

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
                </div>

                {/* Versions Dropdown (show only if available) */}
                {Array.isArray(versions) && versions.length > 0 && (
                  <div className=" flex flex-row ml-2">
                    <div className="form-control flex gap-1 flex-row w-full max-w-xs">
                      <label className="label">
                        <InfoTooltip tooltipContent="Select the version of the agent you want to use.">
                          <span className="label-text info ">Agent's Version</span>
                        </InfoTooltip>
                      </label>
                      <select
                        className="select select-xs mt-1 select-bordered "
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
            }
            <button onClick={() => setIsDescriptionEditing(true)} className="btn btn-xs btn-primary mt-1">
              <PencilIcon size={14} /> Description
            </button>
          </div>
        </div>

        {/* Description Editor Section */}
        {isDescriptionEditing && (
          <div className="mb-4 p-4 border border-base-300 rounded-lg bg-base-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Update Function Description</h4>
              <button
                onClick={() => { setIsDescriptionEditing(false); setToolData({ ...toolData, description: function_details?.description }) }}
                className="btn btn-xs btn-ghost"
              >
                <CloseIcon size={14} />
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
                className="toggle toggle-sm"
                checked={isTextareaVisible}
                onChange={handleToggleChange}
                title="Toggle to edit object parameter"
              />
              {isTextareaVisible && (
                <div className="flex items-center gap-2">
                  <p>Copy tool call format: </p>
                  <CopyIcon
                    size={14}
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
        </div>

        <div className="flex justify-between pl-1">
          <p
            colSpan="3"
            className="flex items-center gap-1 whitespace-nowrap text-xs mb-2"
          >
            <InfoIcon size={14} /> You can change the data in raw json format.
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
            <div className="flex justify-between items-center p-2 border-b">
              <h4 className="font-semibold">Parameters</h4>
              <button
                onClick={() => handleAddField()}
                className="btn btn-xs  "
              >
                <PlusIcon size={14} />
                Add Fields
              </button>
            </div>
            
            <table className="table table-sm">
              <thead>
                <tr>
                  <th></th>
                  <th>Parameter</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Description</th>
                  <th>Enum</th>
                  <th>Fill with AI</th>
                  {((name === 'orchestralAgent' && !isMasterAgent) || (name !== 'orchestralAgent')) && <th>Value Path</th>}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getParentParameters.map((param) => {
                  const currentField = toolData.fields[param.key];
                  const currentType = currentField?.type || "";
                  const currentDesc = currentField?.description || "";
                  const currentEnum = currentField?.enum || [];
                  const isRequired = (toolData.required_params || []).includes(param.key);

                  return (
                    <React.Fragment key={param.key}>
                      <tr>
                        <td>{param.index}</td>
                        <td>
                          <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className="input input-bordered input-sm w-48"
                            defaultValue={param.key}
                            onBlur={(e) => {
                              const newName = e.target.value;
                              if (newName !== param.key) handleRenameKey(param.key, newName);
                            }}
                          />
                          {currentType === "object" && (
                            <button
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => toggleCollapse(param.key)}
                                  title={collapsed.has(param.key) ? "Show properties" : "Hide properties"}
                                >
                                  {collapsed.has(param.key) ? <ChevronDownIcon size={14} /> : <ChevronUpIcon size={14} />}
                                </button>
                          )}
                          </div>
                        </td>
                        <td>
                          <select
                            className="select select-sm select-bordered"
                            value={currentType}
                            onChange={(e) => handleTypeChange(param.key, e.target.value)}
                          >
                            <option value="" disabled>Select type</option>
                            {parameterTypes && parameterTypes.map((type, index) => (
                              <option key={index} value={type}>{type}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={isRequired}
                            onChange={() => handleRequiredChange(param.key)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            placeholder="Parameter description"
                            className="input input-bordered w-full input-sm"
                            value={currentDesc}
                            disabled={currentType === "object"}
                            onChange={(e) => handleDescriptionChange(param.key, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            key={currentEnum}
                            type="text"
                            placeholder="['a','b','c']"
                            className="input input-bordered w-full input-sm"
                            defaultValue={JSON.stringify(currentEnum)}
                            disabled={currentType === "object"}
                            onBlur={(e) => handleEnumChange(param.key, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={!(param.key in variablesPath)}
                            disabled={name === "Pre Tool"}
                            onChange={() => {
                              const updatedVariablesPath = { ...variablesPath };
                              if (param.key in updatedVariablesPath) {
                                delete updatedVariablesPath[param.key];
                              } else {
                                updatedVariablesPath[param.key] = "";
                              }
                              setVariablesPath(updatedVariablesPath);
                            }}
                          />
                        </td>
                        {((name === 'orchestralAgent' && !isMasterAgent) || (name !== 'orchestralAgent')) && (
                          <td>
                            <input
                              type="text"
                              placeholder="variable_path"
                              className={`input input-bordered w-full input-sm ${name === "Pre Tool" && !variablesPath[param.key] ? "border-red-500" : ""}`}
                              value={variablesPath[param.key] || ""}
                              onChange={(e) => handleVariablePathChange(param.key, e.target.value)}
                            />
                          </td>
                        )}
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteField(param.key)}
                              className="btn btn-xs btn-error text-white"
                              title="Delete field"
                            >
                              <TrashIcon size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Child Properties Container - Only show for object types */}
                      {currentType === "object" && (
                        <tr>
                          <td colSpan={((name === 'orchestralAgent' && !isMasterAgent) || (name !== 'orchestralAgent')) ? 9 : 8}>
                            <div className="">
                              
                              {!collapsed.has(param.key) && renderChildProperties(param.key)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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