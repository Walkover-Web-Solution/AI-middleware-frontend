import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { Info } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const BridgeTypeToggle = ({ params }) => {
    const dispatch = useDispatch();
    const { bridgeType, modelType, service } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    }));


    const handleInputChange = (e) => {
        let newCheckedValue;
        if (e.target.type === 'checkbox') {
            newCheckedValue = e.target.checked ? 'chatbot' : 'api';
        } else {
            newCheckedValue = e.target.value;
        }

        let updatedDataToSend = {
            bridgeType: newCheckedValue
        };

        dispatch(updateBridgeAction({
            bridgeId: params.id,
            dataToSend: { ...updatedDataToSend }
        }));
    };

    useEffect(() => {
        if (service !== 'openai' && bridgeType === 'batch') {
            dispatch(updateBridgeAction({
                bridgeId: params.id,
                dataToSend: { bridgeType: 'api' }
            }));
        }
    }, [params.version]);

    return (
        <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className='flex flex-col items-start gap-1'>
                <div className="flex flex-row items-center gap-4 mb-4">
                    {service?.toLowerCase() === 'openai' && modelType !== 'image' && modelType !== 'embedding' ? (
                        <>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="bridgeType"
                                    value="api"
                                    className="radio"
                                    checked={bridgeType?.toString()?.toLowerCase() === "api"}
                                    onChange={(e) => handleInputChange(e, "bridgeType")}
                                />
                                <span className="label-text ml-2">API</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="bridgeType"
                                    value="chatbot"
                                    className="radio"
                                    checked={bridgeType?.toString()?.toLowerCase() === "chatbot"}
                                    onChange={(e) => handleInputChange(e, "bridgeType")}
                                    disabled={modelType === 'embedding'}
                                />
                                <span className="label-text ml-2">ChatBot</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="bridgeType"
                                    value="batch"
                                    className="radio"
                                    checked={bridgeType?.toString()?.toLowerCase() === "batch"}
                                    onChange={(e) => handleInputChange(e, "bridgeType")}
                                    disabled={modelType === 'embedding'}
                                />
                                <span className="label-text ml-2">Batch API</span>
                            </label>
                        </>
                    ) : (
                        <>
                            <div className='flex flex-row items-center gap-2'>
                                <div className="label">
                                    <span className="label-text">API</span>
                                </div>
                                <input
                                    type="checkbox"
                                    key={bridgeType}
                                    className="toggle"
                                    defaultChecked={bridgeType?.toString()?.toLowerCase() === "chatbot" ? true : false}
                                    onChange={(e) => handleInputChange(e, "bridgeType")}
                                    disabled={modelType === 'embedding'}
                                />
                                <div className="label">
                                    <span className="label-text">ChatBot</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <div>
                {modelType === 'embedding' && (
                    <div role="alert" className="alert p-2">
                        <Info size={16} />
                        <span className='label-text-alt'>Embedding models do not support ChatBot.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BridgeTypeToggle;