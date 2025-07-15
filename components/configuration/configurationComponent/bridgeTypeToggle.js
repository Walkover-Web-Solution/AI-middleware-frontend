import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { InfoIcon } from '@/components/Icons';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Protected from '@/components/protected';
import InfoTooltip from '@/components/InfoTooltip';

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
    if (!service || !bridgeType) return; 
    if (service !== 'openai' && bridgeType === 'batch') {
        dispatch(updateBridgeAction({
            bridgeId: params.id,
            dataToSend: { bridgeType: 'api' }
        }));
    }
}, [params.version, service, bridgeType]);

    return (
        <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className='flex flex-col items-start gap-1'>
                <div className="flex flex-row items-center gap-4 mb-4">
                    <>
                        <div className="flex items-center gap-2">
                            <InfoTooltip tooltipContent="The API allows users to connect with AI models to perform tasks like generating responses or processing information.">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        name="bridgeType"
                                        value="api"
                                        className="radio"
                                        checked={bridgeType?.toString()?.toLowerCase() === "api"}
                                        onChange={(e) => handleInputChange(e, "bridgeType")}
                                    />
                                    <div className="group relative inline-block">
                                        <span className="label-text ml-2 cursor-pointer">API</span>
                                    </div>
                                </label>
                            </InfoTooltip>
                        </div>
                        <div className="flex items-center gap-2">
                            <InfoTooltip tooltipContent="ChatBot enables you to create conversational AI agents that can interact with users in natural language.">
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
                                    <div className="group relative inline-block">
                                        <span className="label-text ml-2 cursor-pointer">ChatBot</span>
                                    </div>
                                </label>
                            </InfoTooltip>
                        </div>
                        <div className="flex items-center gap-2">
                            <InfoTooltip tooltipContent="Batch api automates and executes multiple tasks simultaneously for greater efficiency.">
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
                                        <span className="label-text ml-2 cursor-pointer">Batch API</span>
                                    </div>
                                </label>
                            </InfoTooltip>
                        </div>
                        {!isEmbedUser && (
                            <div className="flex items-center gap-2">
                                <InfoTooltip tooltipContent="Triggers allows you to create automated workflows that respond to specific events or conditions. Ideal for creating event-driven applications.">
                                    <label className="flex items-center cursor-pointer">
                                        <input
                                            type="radio"
                                            name="bridgeType"
                                            value="trigger"
                                            className="radio"
                                            checked={bridgeType?.toString()?.toLowerCase() === "trigger"}
                                            onChange={(e) => handleInputChange(e, "bridgeType")}
                                            disabled={modelType === 'embedding'}
                                        />
                                        <div className="group relative inline-block">
                                            <span className="label-text ml-2 cursor-pointer">Triggers</span>
                                        </div>
                                    </label>
                                </InfoTooltip>
                            </div>
                        )}
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