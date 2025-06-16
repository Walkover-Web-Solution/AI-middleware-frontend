import { optimizeJsonApi } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { parameterTypes } from "@/jsonFiles/bridgeParameter";
import { updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { closeModal, flattenParameters } from "@/utils/utility";
import { isEqual } from "lodash";
import { Copy, Info, InfoIcon, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { prefetchDNS } from "react-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

function AgentVariableModal({ params, item }) {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const { agentData, variablesPath } = useCustomSelector((state) => ({
        agentData: state?.bridgeReducer?.allBridgesMap?.[params?.id] || {},
        variablesPath: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.variables_path || {}
    }));

    const agentName = useMemo(
        () => agentData?.name || agentData?.agent_name,
        [agentData]
    );
    const properties = agentData?.fields || {};
    const [toolData, setToolData] = useState(agentData || {});
    const [variablesPath, setVariablesPath] = useState(variablesPath);
    const [isDataAvailable, setIsDataAvailable] = useState(Object.keys(properties).length > 0);
    const [isModified, setIsModified] = useState(false);
    const [objectFieldValue, setObjectFieldValue] = useState("");
    const [isTextareaVisible, setIsTextareaVisible] = useState(false);
    const flattenedParameters = flattenParameters(toolData?.fields);
    const [isOldFieldViewTrue, setIsOldFieldViewTrue] = useState(false);

    useEffect(() => {
        setToolData(agentData);
        setIsDataAvailable(Object.keys(properties).length > 0);
    }, [agentData, properties]);

    useEffect(() => {
        setVariablesPath(variablesPath);
    }, [variablesPath]);

    useEffect(() => {
        setIsModified(!isEqual(toolData, agentData));
    }, [toolData, agentData, isEqual]);

    useEffect(() => {
        setIsModified(!isEqual(variablesPath, variablesPath));
    }, [variablesPath]);

    const copyToClipboard = (content) => {
        navigator.clipboard
            .writeText(content)
            .then(() => {
                toast.success("Content copied to clipboard");
            })
            .catch((error) => {
                console.error("Error copying content to clipboard:", error);
            });
    };

    const copyToolCallFormat = () => {
        const toolCallFormat = {
            type: "agent",
            agent: {
                name: agentName,
                description: agentData?.description || "",
                parameters: {
                    type: "object",
                    properties: JSON.parse(objectFieldValue) || {},
                    required_params: agentData?.required_params || [],
                    additionalProperties: false,
                },
            },
        };
        copyToClipboard(JSON.stringify(toolCallFormat, undefined, 4));
    };
    
    const handleTextFieldChange = () => {
        try {
            const parsed = JSON.parse(objectFieldValue);
            setagentData(prev => ({
                ...prev,
                variables_state: parsed,
            }));
            setIsModified(true);
        } catch (err) {
            console.error('Invalid JSON');
        }
    };

    const handleRequiredChange = (key) => {
        const requiredParams = agentData.required_params || [];
        const updated = requiredParams.includes(key)
            ? requiredParams.filter(k => k !== key)
            : [...requiredParams, key];
        setagentData({ ...agentData, required_params: updated });
        setIsModified(true);
    };

    const handleDescriptionChange = (key, desc) => {
        const keys = key.split('.');
        const updatedFields = { ...agentData.variables_state };
        const lastKey = keys.pop();
        let obj = updatedFields;

        keys.forEach(k => {
            obj[k] = obj[k] || {};
            obj = obj[k];
        });

        obj[lastKey] = { ...(obj[lastKey] || {}), description: desc };
        setagentData({ ...agentData, variables_state: updatedFields });
        setIsModified(true);
    };

    const handleEnumChange = (key, val) => {
        let parsedEnum;
        try {
            parsedEnum = JSON.parse(val);
            if (!Array.isArray(parsedEnum)) return;
        } catch (e) {
            return;
        }

        const keys = key.split('.');
        const lastKey = keys.pop();
        let obj = agentData.variables_state;

        keys.forEach(k => {
            obj[k] = obj[k] || {};
            obj = obj[k];
        });

        obj[lastKey] = { ...(obj[lastKey] || {}), enum: parsedEnum };
        setagentData({ ...agentData });
        setIsModified(true);
    };

    const handleSave = () => {
        if (!isModified) {
            toast.warning('No changes to save');
            return;
        }

        try {
            const parsedData = JSON.parse(objectFieldValue);
            if (!parsedData || typeof parsedData !== 'object') {
                throw new Error('Invalid data format');
            }

            const updatedData = {
                ...toolData,
                fields: parsedData
            };

            dispatch(updateBridgeVersionAction({
                versionId: params?.version,
                dataToSend: {
                    variables_state: updatedData
                }
            }));

            setToolData(updatedData);
            setIsModified(false);
            closeModal(MODAL_TYPE.AGENT_VARIABLE_MODAL);
            toast.success('Agent variables saved successfully');
        } catch (error) {
            toast.error('Error saving agent variables: ' + error.message);
        }
    };

    const handleToggleChange = (e) => {
        setIsTextareaVisible(e.target.checked);
        if (e.target.checked) {
            setObjectFieldValue(JSON.stringify(toolData?.fields || {}, undefined, 4));
        }
    };

    const handleVariablePathChange = (key, value) => {
        setVariablesPath(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleRequiredChange = (key) => {
        const updatedRequired = agentData.required_params?.includes(key)
            ? agentData.required_params.filter(param => param !== key)
            : [...(agentData.required_params || []), key];
        setToolData(prev => ({
            ...prev,
            required_params: updatedRequired
        }));
    };

    const handleDescriptionChange = (key, prompt) => {
        const updatedDescription = prompt || '';
        setToolData(prev => ({
            ...prev,
            fields: {
                ...prev.fields,
                [key]: {
                    ...prev.fields[key],
                    description: updatedDescription
                }
            }
        }));
    };

    const handleRemoveAgent = (key) => {
        if (window.confirm('Are you sure you want to remove this agent?')) {
            const updatedFields = { ...toolData.fields };
            delete updatedFields[key];
            setToolData(prev => ({
                ...prev,
                fields: updatedFields
            }));
            setIsModified(true);
        }
    };

    const handleTextFieldChange = (e) => {
        try {
            const parsedData = JSON.parse(e.target.value);
            if (!parsedData || typeof parsedData !== 'object') {
                throw new Error('Invalid JSON format');
            }
            setToolData(prev => ({
                ...prev,
                fields: parsedData
            }));
            setIsModified(true);
        } catch (error) {
            toast.error('Invalid JSON format: ' + error.message);
        }
    };

    return (
        <dialog id={MODAL_TYPE.AGENT_VARIABLE_MODAL} className="modal">
            <div className="modal-box max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Agent Variables</h3>
                    <button className="btn btn-sm btn-ghost" onClick={() => closeModal(MODAL_TYPE.AGENT_VARIABLE_MODAL)}>
                        Close
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Toggle and Info */}
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center text-sm gap-3">
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
                                    <p>Copy JSON</p>
                                    <Copy size={16} onClick={() => copyToClipboard(objectFieldValue)} className="cursor-pointer" />
                                </div>
                            )}
                        </div>
                        {agentData.old_fields && isTextareaVisible && (
                            <div className="flex items-center gap-3 text-sm">
                                <p>Check for old data</p>
                                <input
                                    type="checkbox"
                                    checked={isOldFieldViewTrue}
                                    onChange={(e) => setIsOldFieldViewTrue(e.target.checked)}
                                />
                            </div>
                        )}
                    </div>

                    {isTextareaVisible ? (
                        <div className={isOldFieldViewTrue ? "flex items-center gap-2" : ""}>
                            <textarea
                                type="input"
                                value={objectFieldValue}
                                className="textarea textarea-bordered border w-full min-h-96 resize-y z-[1]"
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
                                    className="textarea textarea-bordered border w-full min-h-96 resize-y z-[1]"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Key</th>
                                        <th>Value</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedParameters.map((param, index) => (
                                        <tr key={index}>
                                            <td>{param.key}</td>
                                            <td>{param.value}</td>
                                            <td>{param.type}</td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={agentData.required_params?.includes(param.key)}
                                                    onChange={() => handleRequiredChange(param.key)}
                                                />
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleDescriptionChange(param.key, prompt)}>
                                                        <Info size={16} className="cursor-pointer" />
                                                    </button>
                                                    <button onClick={() => handleRemoveAgent(param.key)}>
                                                        <Trash2 size={16} className="cursor-pointer text-error" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                            </tbody>
                        </table>
                    </div>
                ) : (
                     <div className={isOldFieldViewTrue ? "flex items-center gap-2" : ""}>
            <textarea
              type="input"
              value={objectFieldValue}
              className="textarea textarea-bordered border w-full min-h-96 resize-y z-[1]"
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
                className="textarea textarea-bordered border w-full min-h-96 resize-y z-[1]"
              />
            )}
          </div>
        )}
        <div className="modal-action">
          <form method="dialog" className="flex flex-row gap-2">
            <button className="btn" onClick={()=>closeModal(MODAL_TYPE.AGENT_VARIABLE_MODAL)}>
              Close
            </button>

            {isDataAvailable && (
              <button
                className="btn btn-primary"
                onClick={handleSaveFunctionData}
                disabled={!isModified || isLoading}
              >
                {isLoading && <span className="loading loading-spinner"></span>}
                Save
              </button>
            )}
          </form>
        </div>
            </div>
        </dialog>
    );
};

export default AgentVariableModal;
