import { useCustomSelector } from '@/customSelector/customSelector';
import { parameterTypes } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { Info, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function FunctionParameterModal({ functionId, params }) {
    const dispatch = useDispatch();
    const { function_details } = useCustomSelector((state) => ({
        function_details: state?.bridgeReducer?.org?.[params?.org_id]?.functionData?.[functionId] || {},
    }));

    const [toolData, setToolData] = useState({ properties: function_details.fields || [], required: function_details.required_params || [] });
    const { properties, required } = toolData || {};

    const [isDataAvailable, setIsDataAvailable] = useState(Object.keys(properties || {}).length > 0);

    useEffect(() => {
        setToolData({ properties: function_details.fields, required: function_details.required_params });
        setIsDataAvailable((function_details.fields || []).length > 0);
    }, [function_details]);

    // Handle checkbox change
    const handleRequiredChange = (key) => {
        setToolData(prevToolData => {
            const updatedRequired = prevToolData?.required?.includes(key)
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
            const updatedProperties = prevToolData.properties.map(property =>
                property.variable_name === key ? { ...property, description: newDescription } : property
            );

            return {
                ...prevToolData,
                properties: updatedProperties
            };
        });
    };
    const handleTypeChange = (key, newType) => {
        setToolData(prevToolData => {
            const updatedProperties = prevToolData.properties.map(property =>
                property.variable_name === key ? { ...property, type: newType } : property
            );

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
                    const updatedProperties = prevToolData.properties.map(property => {
                        if (property.variable_name === key && property.enum) {
                            const { enum: _, ...rest } = property;
                            return rest;
                        }
                        return property;
                    });
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
                const updatedProperties = prevToolData.properties.map(property =>
                    property.variable_name === key ? { ...property, enum: newEnum } : property
                );

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
        // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { tools: updatedTools } } }));
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
                        <div className="flex flex-row gap-1 items-center">
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
                                {(properties || []).map((obj, index) => {
                                    const key = obj?.variable_name;
                                    return (
                                        <tr key={key}>
                                            <td>{index}</td>
                                            <td>{key}</td>
                                            <td>
                                                <select className="select select-sm select-bordered" value={obj?.type || 'string'} onChange={(e) => handleTypeChange(key, e.target.value)}>
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
                                                    defaultValue={obj?.description}
                                                    onBlur={(e) => handleDescriptionChange(key, e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    placeholder="['a','b','c']"
                                                    className="input input-bordered w-full input-sm"
                                                    defaultValue={JSON.stringify(obj?.enum)}
                                                    onBlur={(e) => handleEnumChange(key, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
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