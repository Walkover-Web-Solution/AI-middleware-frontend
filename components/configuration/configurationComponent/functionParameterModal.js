import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux';

function FunctionParameterModal({ functionId, params }) {
    const dispatch = useDispatch();
    const { bridge_tools } = useCustomSelector((state) => ({
        bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
    }))

    const initialFunctionData = useMemo(() => {
        return bridge_tools.find(tool => tool?.name === functionId);
    }, [functionId]);

    const [toolData, setToolData] = useState(initialFunctionData);
    const { properties, required } = toolData || {};
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
    const handleSaveFunctionData = () => {
        const updatedTools = bridge_tools.map(tool =>
            tool.name === toolData.name ? toolData : tool
        );
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { tools: updatedTools } } }));
    };

    return (
        <dialog id="function-parameter-modal" className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg mb-2">Configure fields</h3>
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
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(properties || {}).map(([key, value], index) => (
                                    <tr key={key}>
                                        <td>{index}</td>
                                        <td>{key}</td>
                                        <td>{value?.type}</td>
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
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>}
                <div className="modal-action">
                    <form method="dialog" className='flex flex-row gap-4'>
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