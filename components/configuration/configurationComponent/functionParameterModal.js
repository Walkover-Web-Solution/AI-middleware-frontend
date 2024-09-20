import { useCustomSelector } from '@/customHooks/customSelector';
import { parameterTypes } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { Info, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function FunctionParameterModal({ functionId, params }) {
    const dispatch = useDispatch();
    const { bridge_tools, function_details } = useCustomSelector((state) => ({
        bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
        function_details: state?.bridgeReducer?.org?.[params?.org_id]?.functionData?.[functionId] || {},
    }))

    const initialFunctionData = useMemo(() => {
        return bridge_tools.find(tool => tool?.name === functionId);
    }, [functionId]);

    const [toolData, setToolData] = useState(function_details);
    const { fields: properties, required_params: required } = toolData || {};

    // const {fields, required_params} = function_details || {};
    // console.log(fields, required_params,2323);
    const [isDataAvailable, setIsDataAvailable] = useState(Object.keys(properties || {}).length > 0);

    // Update the state when `functionId` or `bridge_tools` changes
    useEffect(() => {
        setToolData(initialFunctionData);
        setIsDataAvailable(Object.keys(initialFunctionData?.properties || {}).length > 0);
    }, [initialFunctionData]);

    // Handle checkbox change
    const handleRequiredChange = (key) => {
        setToolData(prevToolData => {
            const updatedRequired = prevToolData.required.includes(key)
                ? prevToolData.required.filter(item => item !== key)
                : [...prevToolData.required, key];

            return {
                ...prevToolData,
                required: updatedRequired
            };
        });
    };

    const handleDescriptionChange = (key, newDescription) => {
        setToolData(prevToolData => {
            const updatedProperties = {
                ...prevToolData.properties,
                [key]: {
                    ...prevToolData.properties[key],
                    description: newDescription
                }
            };

            return {
                ...prevToolData,
                properties: updatedProperties
            };
        });
    };
    const handleTypeChange = (key, newType) => {
        setToolData(prevToolData => {
            const updatedProperties = {
                ...prevToolData.properties,
                [key]: {
                    ...prevToolData.properties[key],
                    type: newType
                }
            };

            return {
                ...prevToolData,
                properties: updatedProperties
            };
        });
    };

    const handleEnumChange = (key, newEnum) => {
        try {
            // If the input is empty, remove the `enum` field
            if (!newEnum.trim()) {
                setToolData(prevToolData => {
                    const updatedProperties = JSON.parse(JSON.stringify(prevToolData.properties));
                    // Check if the key exists in properties and has an enum field
                    if (updatedProperties[key] && updatedProperties[key].enum) {
                        delete updatedProperties[key]?.enum;
                    }
                    return {
                        ...prevToolData,
                        properties: updatedProperties
                    };
                });
                return;
            }

            if (typeof newEnum === 'string') {
                newEnum = newEnum.trim();
                newEnum = newEnum.replace(/'/g, '"');
                if (newEnum.startsWith("[") && newEnum.endsWith("]")) {
                    newEnum = JSON.parse(newEnum);
                } else {
                    toast.error("Invalid format. Expected a JSON array format.");
                }
            }

            // Ensure the parsed value is an array
            if (!Array.isArray(newEnum)) {
                toast.error("Parsed value is not an array.");
            }

            // Update the state with the parsed array
            setToolData(prevToolData => {
                const updatedProperties = {
                    ...prevToolData.properties,
                    [key]: {
                        ...prevToolData.properties[key],
                        enum: newEnum
                    }
                };

                return {
                    ...prevToolData,
                    properties: updatedProperties
                };
            });

        } catch (error) {
            toast.error("Failed to update enum:", error.message);
        }
    };


    const handleSaveFunctionData = () => {
        const updatedTools = bridge_tools.map(tool =>
            tool.name === toolData.name ? toolData : tool
        );
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { tools: updatedTools } } }));
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
        }
        );
    }

    return (
        <dialog id="function-parameter-modal" className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
                <div className='flex flex-row justify-between'>
                    <span className='flex flex-row items-center gap-4'>
                        <h3 className="font-bold text-lg">Configure fields</h3>
                        <div className="flex flex-row gap-1">
                            <Info size={16} />
                            <span className='label-text-alt'>Used in {(function_details?.bridge_ids || [])?.length} bridges, changes may affect all bridges.</span>
                        </div>
                    </span>
                    <button onClick={handleRemoveFunctionFromBridge} className='btn btn-sm btn-error text-white'><Trash2 size={16} />Remove function</button>
                </div>
                {!isDataAvailable ? <p>No Parameters used in the function</p> :
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
                                    <th>Enum: comma seperated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(properties || {}).map(([key, value], index) => (
                                    <tr key={key}>
                                        <td>{index}</td>
                                        <td>{key}</td>
                                        <td>
                                            <select className="select select-sm select-bordered" value={value?.type} onChange={(e) => handleTypeChange(key, e.target.value)}>
                                                <option disabled selected>Select parameter type</option>
                                                {parameterTypes && (parameterTypes).map((type, index) => (
                                                    <option key={index} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <input type="checkbox"
                                                className="checkbox"
                                                defaultChecked={required?.includes(key)}
                                                onChange={() => handleRequiredChange(key)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="Parameter description"
                                                className="input input-bordered w-full input-sm"
                                                defaultValue={value?.description}
                                                onBlur={(e) => handleDescriptionChange(key, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                placeholder="['a','b','c']"
                                                className="input input-bordered w-full input-sm"
                                                defaultValue={JSON.stringify(value?.enum)}
                                                onBlur={(e) => handleEnumChange(key, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>}
                <div className="modal-action">
                    <form method="dialog" className='flex flex-row gap-2'>
                        {/* if there is a button, it will close the modal */}
                        {isDataAvailable && <button className="btn" onClick={handleSaveFunctionData}>Save</button>}
                        <button className="btn">Close</button>
                    </form>
                </div>
            </div>
        </dialog>
    )
}

export default FunctionParameterModal