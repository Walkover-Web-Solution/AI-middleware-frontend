    import { useCustomSelector } from '@/customSelector/customSelector';
    import { parameterTypes } from '@/jsonFiles/bridgeParameter';
    import { updateBridgeAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
    import { updateFunctionReducer } from '@/store/reducer/bridgeReducer';
    import { Info, Trash2 } from 'lucide-react';
    import React, { useEffect, useState } from 'react';
    import { useDispatch } from 'react-redux';
    import { toast } from 'react-toastify';
    import { isEqual } from 'lodash'

    function flattenParameters(parameters, prefix = '') {
        let flat = [];
        Object.entries(parameters).forEach(([key, value]) => {
            const currentKey = prefix ? `${prefix}.${key}` : key;
            flat.push({
                key: currentKey,
                type: value.type,
                description: value.description,
                enum: value.enum,
                required_params: value.required_params,
                parameter: value.parameter
            });
            if (value.type === 'object' && value.parameter) {
                flat = flat.concat(flattenParameters(value.parameter, currentKey));
            }
        });
        return flat;
    }

    function FunctionParameterModal({ functionId, params }) {
        const dispatch = useDispatch();
        const { bridge_tools, function_details } = useCustomSelector((state) => ({
            bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
            function_details: state?.bridgeReducer?.org?.[params?.org_id]?.functionData?.[functionId] || {},
        }));

        const properties = function_details.fields || {};
        const [toolData, setToolData] = useState(function_details);
        const [isDataAvailable, setIsDataAvailable] = useState(Object.keys(properties).length > 0);
        const [isModified, setIsModified] = useState(false); // Track changes
        // const [temporaryType, setTemporaryType] = useState(''); // Temporary state for optimistic update

        const flattenedParameters = flattenParameters(properties);
    

        useEffect(() => {
            setToolData(function_details);
            setIsDataAvailable(Object.keys(properties).length > 0);
        }, [function_details, properties]);

        const handleRequiredChange = (key) => {
            const keyParts = key.split('.');
            if (keyParts.length === 1) {
                // Top-level field
                setToolData(prevToolData => {
                    const updatedRequiredParams = prevToolData.required_params || [];
                    const newRequiredParams = updatedRequiredParams.includes(keyParts[0])
                        ? updatedRequiredParams.filter(item => item !== keyParts[0])
                        : [...updatedRequiredParams, keyParts[0]];

                    return {
                        ...prevToolData,
                        required_params: newRequiredParams
                    };
                });
            } else {
                // Nested field
                setToolData(prevToolData => {
                    const updatedFields = updateField(prevToolData.fields, keyParts.slice(0, -1), (field) => {
                        if (!field) {
                            console.warn(`Field not found for key: ${keyParts.slice(0, -1).join('.')}`);
                            return {}; // Return an empty object if field is not found
                        }

                        const fieldKey = keyParts[keyParts.length - 1];
                        const updatedRequiredParams = field.required_params || [];
                        const newRequiredParams = updatedRequiredParams.includes(fieldKey)
                            ? updatedRequiredParams.filter(item => item !== fieldKey)
                            : [...updatedRequiredParams, fieldKey];

                        return {
                            ...field,
                            required_params: newRequiredParams
                        };
                    });

                    return {
                        ...prevToolData,
                        fields: updatedFields
                    };
                });
            }
        };
            const handleDescriptionChange = (key, newDescription) => {
            setToolData(prevToolData => {
                const updatedFields = updateField(prevToolData.fields, key.split('.'), (field) => ({
                    ...field,
                    description: newDescription
                }));
                return {
                    ...prevToolData,
                    fields: updatedFields
                };
            });
        };

        const updateField = (fields, keyParts, updateFn) => {
            const fieldClone = JSON.parse(JSON.stringify(fields)); // Deep clone the fields

            const _updateField = (fields, keyParts) => {
                if (keyParts.length === 1) {
                    // When we've reached the last key, apply the update function
                    fields[keyParts[0]] = updateFn(fields[keyParts[0]]);
                } else {
                    const [head, ...tail] = keyParts;
                    if (fields[head] && fields[head].parameter) {
                        // Continue to recursively traverse nested fields
                        fields[head].parameter = _updateField(fields[head].parameter, tail);
                    }
                }
                return fields;
            };

            return _updateField(fieldClone, keyParts);
        };
        useEffect(() => {
            setIsModified(!isEqual(toolData, function_details)); // Compare toolData and function_details
        }, [toolData, function_details]);
        // Reset the modal data to the original function_details
        const resetModalData = () => {
            setToolData(function_details);
        };

        // Event handler to reset the modal when closed
        const handleCloseModal = () => {
            resetModalData();
            document.getElementById('function-parameter-modal').close();
        };

        const handleTypeChange = (key, newType) => {
            setToolData(prevToolData => {
                const updatedFields = updateField(prevToolData.fields, key.split('.'), (field) => ({
                    ...field,
                    type: newType // Update the type of the specific field
                }));
                return {
                    ...prevToolData,
                    fields: updatedFields
                };
            });
        };

        const handleEnumChange = (key, newEnum) => {
            try {
                if (!newEnum.trim()) {
                    setToolData(prevToolData => {
                        const updatedFields = updateField(prevToolData.fields, key.split('.'), (field) => {
                            const { enum: _, ...rest } = field;
                            return rest;
                        });
                        return {
                            ...prevToolData,
                            fields: updatedFields
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

                setToolData(prevToolData => {
                    const updatedFields = updateField(prevToolData.fields, key.split('.'), (field) => ({
                        ...field,
                        enum: parsedEnum
                    }));
                    return {
                        ...prevToolData,
                        fields: updatedFields
                    };
                });

            } catch (error) {
                toast.error("Failed to update enum: " + error.message);
            }
        };

        const handleSaveFunctionData = () => {
            dispatch(updateFuntionApiAction({function_id:toolData._id,dataToSend:toolData}))
            setToolData("");
        };

        const handleRemoveFunctionFromBridge = () => {
            dispatch(updateBridgeAction({
                bridgeId: params.id,
                dataToSend: {
                    functionData: {
                        function_id: functionId,
                    }
                }
            })).then(() => {
                document.getElementById('function-parameter-modal').close();
            });
        };
        const getNestedFieldValue = (fields, keyParts) => {
            return keyParts.reduce((currentField, key) => {
                return currentField?.parameter?.[key] || currentField?.[key] || {}; // Ensure fallback to an empty object
            }, fields);
        };
    

        return (
            <dialog id="function-parameter-modal" className="modal">
                <div className="modal-box w-11/12 max-w-5xl">
                    <div className='flex flex-row justify-between mb-2'>
                        <span className='flex flex-row items-center gap-4'>
                            <h3 className="font-bold text-lg">Configure fields</h3>
                            <div className="flex flex-row gap-1">
                                <Info size={16} />
                                <span className='label-text-alt'>Used in {(function_details?.bridge_ids || [])?.length} bridges, changes may affect all bridges.</span>
                            </div>
                        </span>
                        <button onClick={handleRemoveFunctionFromBridge} className='btn btn-sm btn-error text-white'>
                            <Trash2 size={16} /> Remove function
                        </button>
                    </div>
                    {!isDataAvailable ? (
                        <p>No Parameters used in the function</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                {/* head */}
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Parameter</th>
                                        <th>Type</th>
                                        <th>Required</th>
                                        <th>Description</th>
                                        <th>Enum: comma separated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedParameters.map((param, index) => (
                                        <tr key={param.key}>
                                            <td>{index}</td>
                                            <td>{param.key}</td>
                                            <td>
                                                <select
                                                    className="select select-sm select-bordered"
                                                    value={
                                                        getNestedFieldValue(toolData.fields, param.key.split('.'))?.type || param.type || ""
                                                    } // Get the correct nested value
                                                    disabled={param.type === 'object'}
                                                    onChange={(e) => handleTypeChange(param.key, e.target.value)}
                                                >
                                                    <option value="" disabled>Select parameter type</option>
                                                    {parameterTypes && parameterTypes.map((type, index) => (
                                                        <option key={index} value={type} disabled={type==='object'}>
                                                            {type}

                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    className="checkbox"
                                                    checked={
                                                        (() => {
                                                            const keyParts = param.key.split('.');

                                                            if (keyParts.length === 1) {
                                                                // Top-level field
                                                                return (toolData.required_params || []).includes(param.key);
                                                            } else {
                                                                // Nested field
                                                                const parentKeyParts = keyParts.slice(0, -1);
                                                                const nestedField = getNestedFieldValue(toolData.fields, parentKeyParts);
                                                                return nestedField?.required_params?.includes(keyParts[keyParts.length - 1]) || false;
                                                            }
                                                        })()
                                                    }
                                                    onChange={() => handleRequiredChange(param.key)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                        type="text"
                                                        placeholder="Parameter description"
                                                        className="input input-bordered w-full input-sm"
                                                        defaultValue={param.description || ''}
                                                        onBlur={(e) => handleDescriptionChange(param.key, e.target.value)}
                                                />
                                            
                                            </td>
                                            <td>
                                                {param.type!=='object'?(<input
                                                    type="text"
                                                    placeholder="['a','b','c']"
                                                    className="input input-bordered w-full input-sm"
                                                    defaultValue={param.enum ? JSON.stringify(param.enum) : ""}
                                                    onBlur={(e) => handleEnumChange(param.key, e.target.value)}
                                                />):""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="modal-action">
                    <form method="dialog" className='flex flex-row gap-2'>
                        {/* Disable Save button if no changes are detected */}
                        {isDataAvailable && (
                            <button className="btn" onClick={handleSaveFunctionData} disabled={!isModified}>
                                Save
                            </button>
                        )}
                        <button className="btn" onClick={handleCloseModal}>Close</button>
                    </form>
                </div>
                </div>
            </dialog>
        );
    }

    export default FunctionParameterModal;
