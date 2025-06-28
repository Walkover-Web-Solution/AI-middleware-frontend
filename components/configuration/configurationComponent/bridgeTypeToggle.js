import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { InfoIcon } from '@/components/Icons';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Protected from '@/components/protected';

const BridgeTypeToggle = ({ params, isEmbedUser }) => {
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
                        <div className="flex items-center gap-2">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    name="bridgeType"
                                    value="batch"
                                    className="radio"
                                    checked={bridgeType?.toString()?.toLowerCase() === "batch"}
                                    onChange={(e) => handleInputChange(e, "bridgeType")}
                                    disabled={modelType === 'embedding' || service?.toLowerCase() !== 'openai' || modelType === 'image' || modelType === 'embedding'}
                                />
                                <div className="group relative inline-block">
                                    <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                                        Batch api automates and executes multiple tasks simultaneously for greater efficiency.
                                        <div className="absolute w-3 h-3 bg-gray-700 transform rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                                    </div>
                                    <span className="label-text ml-2 cursor-pointer">Batch API</span>
                                </div>
                            </label>
                        </div>
                        {!isEmbedUser && <label className="flex items-center cursor-pointer">
                            <input
                                type="radio"
                                name="bridgeType"
                                value="trigger"
                                className="radio"
                                checked={bridgeType?.toString()?.toLowerCase() === "trigger"}
                                onChange={(e) => {
                                    handleInputChange(e, "bridgeType")
                                }}
                                disabled={modelType === 'embedding'}
                            />
                            <span className="label-text ml-2">Triggers</span>
                        </label>}
                    </>

                </div>
            </div>
            <div>
                {modelType === 'embedding' && (
                    <div role="alert" className="alert p-2">
                        <InfoIcon size={16} />
                        <span className='label-text-alt'>Embedding models do not support ChatBot.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Protected(BridgeTypeToggle);