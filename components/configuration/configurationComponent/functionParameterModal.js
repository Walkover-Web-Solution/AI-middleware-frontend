import { useCustomSelector } from '@/customHooks/customSelector';
import { parameterTypes } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import { flattenParameters } from '@/utils/utility';
import { isEqual } from 'lodash';
import { Info, InfoIcon, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function FunctionParameterModal({ functionId, params }) {
    const dispatch = useDispatch();
    const { function_details, variables_path } = useCustomSelector((state) => ({
        function_details: state?.bridgeReducer?.org?.[params?.org_id]?.functionData?.[functionId] || {},
        variables_path: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables_path || {},
    }));

    const functionName = useMemo(() => function_details['endpoint'] || function_details['function_name'], [function_details]);
    const properties = function_details.fields || {};
    const [toolData, setToolData] = useState(function_details || {});
    const [variablesPath, setVariablesPath] = useState(variables_path[functionName] || {});
    const [isDataAvailable, setIsDataAvailable] = useState(Object.keys(properties).length > 0);
    const [isModified, setIsModified] = useState(false);
    const [objectFieldValue, setObjectFieldValue] = useState('');
    const [isTextareaVisible, setIsTextareaVisible] = useState(false);
    const flattenedParameters = flattenParameters(properties);

    useEffect(() => {
        setToolData(function_details);
        setIsDataAvailable(Object.keys(properties).length > 0);
    }, [function_details, properties]);

    useEffect(() => {
        setVariablesPath(variables_path[functionName] || {});
    }, [variables_path])

    useEffect(() => {
        setIsModified(!isEqual(toolData, function_details)); // Compare toolData and function_details
    }, [toolData, function_details]);

    useEffect(() => {
        setIsModified(!isEqual(variablesPath, variables_path[functionName]));
    }, [variablesPath])

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
    // Reset the modal data to the original function_details
    const resetModalData = () => {
        setToolData(function_details);
        setObjectFieldValue('');
        setIsTextareaVisible(false);
    };

    const handleCloseModal = () => {
        resetModalData();
        document.getElementById('function-parameter-modal').close();
    };

    const handleTypeChange = (key, newType) => {
        const updatedFields = updateField(toolData.fields, key.split('.'), (field) => ({
            ...field,
            type: newType,
            ...(newType === 'object' ? { enum: "", description: '' } : {}),
        }));


        setToolData(prevToolData => ({
            ...prevToolData,
            fields: updatedFields,
        }));


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
        if (!isEqual(toolData, function_details)) {
            const { _id, ...dataToSend } = toolData;
            dispatch(updateFuntionApiAction({
                function_id: functionId,
                dataToSend: dataToSend,
            }));
            setToolData("");
        }
        if (!isEqual(variablesPath, variables_path[functionName])) {
            dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { variables_path: { [functionName]: variablesPath } } }));
        }
        resetModalData();
    };

    const handleRemoveFunctionFromBridge = () => {
        dispatch(updateBridgeAction({
            bridgeId: params.id,
            dataToSend: {
                functionData: {
                    function_id: functionId,
                    function_name: functionName,
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

    const handleToggleChange = (e) => {
        if (e.target.checked) {
            setObjectFieldValue(JSON.stringify(toolData['fields'], undefined, 4));
            setIsTextareaVisible(prev => !prev);
        }
        else if (!e.target.checked) {
            try {
                const updatedField = JSON.parse(objectFieldValue);
                if (typeof updatedField !== 'object' || updatedField === null) {
                    throw new Error('Invalid JSON format. Please enter a valid object.');
                }
                setToolData(prevToolData => ({
                    ...prevToolData,
                    fields: updatedField
                }));
                setIsTextareaVisible(prev => !prev);
            } catch (error) {
                toast.error("Invalid JSON format. Please correct the data.");
                console.error("JSON Parsing Error:", error.message);
            }
        }
        else {
            toast.error("Must be valid json");
        }



    };

    const handleTextFieldChange = () => {
        try {
            const updatedField = JSON.parse(objectFieldValue);
            // Validate that the parsed value is an object
            if (typeof updatedField !== 'object' || updatedField === null) {
                throw new Error('Invalid JSON format. Please enter a valid object.');
            }
            setToolData(prevToolData => ({
                ...prevToolData,
                fields: updatedField
            }));
        } catch (error) {
            toast.error("Invalid JSON format. Please correct the data.");
            console.error("JSON Parsing Error:", error.message);
        }
    };

    const handleVariablePathChange = (key, value = "") => {
        setVariablesPath(prevVariablesPath => {
            return {
                ...prevVariablesPath,
                [key]: value || ""
            };
        });
    }

    return (
        <dialog id="function-parameter-modal" className="modal">
            <div className="modal-box w-11/12 max-w-6xl">
                <div className='flex flex-row justify-between mb-3'>
                    <span className='flex flex-row items-center gap-4'>
                        <h3 className="font-bold text-lg">Configure fields</h3>
                        <div className="flex flex-row gap-1">
                            <Info size={16} />
                            <span className='label-text-alt'>Function used in {(function_details?.bridge_ids || [])?.length} bridges, changes may affect all bridges.</span>
                        </div>
                    </span>
                    <button onClick={handleRemoveFunctionFromBridge} className='btn btn-sm btn-error text-white'>
                        <Trash2 size={16} /> Remove function
                    </button>
                </div>
                {isDataAvailable && <div className='flex items-center text-sm gap-3 mb-4'>
                    <p>Raw JSON format</p>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={isTextareaVisible}
                        onChange={handleToggleChange}
                        title="Toggle to edit object parameter"
                    />
                </div>}

                <p colSpan="3" className='flex items-center gap-1 whitespace-nowrap text-xs mb-2'><InfoIcon size={16} /> You can change the data in raw json format </p>
                {!isDataAvailable ? (
                    <p>No Parameters used in the function</p>
                ) : (
                    !isTextareaVisible ? (
                        <div className="overflow-x-auto border rounded-md">
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
                                        <th>Value Path: variables.your_path</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {flattenedParameters.map((param, index) => {
                                        const currentType = getNestedFieldValue(toolData.fields, param.key.split('.'))?.type || param.type || "";
                                        const currentDesc = getNestedFieldValue(toolData.fields, param.key.split('.'))?.description || "";
                                        const currentEnum = getNestedFieldValue(toolData.fields, param.key.split('.'))?.enum || [];

                                        return (
                                            <tr key={param.key}>
                                                <td>{index}</td>
                                                <td>{param.key}</td>
                                                <td>
                                                    <select
                                                        className="select select-sm select-bordered"
                                                        value={currentType}
                                                        onChange={(e) => handleTypeChange(param.key, e.target.value)}
                                                    >
                                                        <option value="" disabled>Select parameter type</option>
                                                        {parameterTypes && parameterTypes.map((type, index) => (
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
                                                            const keyParts = param.key.split('.');
                                                            if (keyParts.length === 1) {
                                                                return (toolData.required_params || []).includes(param.key);
                                                            } else {
                                                                const parentKeyParts = keyParts.slice(0, -1);
                                                                const nestedField = getNestedFieldValue(toolData.fields, parentKeyParts);
                                                                return nestedField?.required_params?.includes(keyParts[keyParts.length - 1]) || false;
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
                                                        disabled={currentType === 'object'}
                                                        onChange={(e) => handleDescriptionChange(param.key, e.target.value)}
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
                                                        disabled={currentType === 'object'}
                                                        onBlur={(e) => handleEnumChange(param.key, e.target.value)}
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        className="checkbox"
                                                        checked={!(param.key in variablesPath)}
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
                                                <td>
                                                    <input
                                                        type="text"
                                                        placeholder="name"
                                                        className="input input-bordered w-full input-sm"
                                                        value={variablesPath[param.key] || ''}
                                                        onChange={(e) => {
                                                            handleVariablePathChange(param.key, e.target.value);
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="mt-4">
                            <textarea
                                type="input"
                                value={objectFieldValue}
                                className='textarea textarea-bordered border w-full min-h-96 resize-y z-[1]'
                                onChange={(e) => setObjectFieldValue(e.target.value)}
                                onBlur={handleTextFieldChange}
                                placeholder="Enter valid JSON object here..."
                            />
                        </div>
                    )
                )}
                <div className="modal-action">
                    <form method="dialog" className='flex flex-row gap-2'>
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
