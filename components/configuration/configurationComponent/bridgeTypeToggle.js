// import { useCustomSelector } from '@/customHooks/customSelector';
// import { updateBridgeAction } from '@/store/action/bridgeAction';
// import { InfoIcon } from '@/components/Icons';
// import React, { useEffect } from 'react';
// import { useDispatch } from 'react-redux';
// import Protected from '@/components/protected';
// import InfoTooltip from '@/components/InfoTooltip';

// const BridgeTypeToggle = ({ params, isEmbedUser }) => {
//     const dispatch = useDispatch();
//     const { bridgeType, modelType, service } = useCustomSelector((state) => ({
//         bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
//         modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
//         service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
//     }));

//     const handleInputChange = (value) => {
//         let updatedDataToSend = {
//             bridgeType: value
//         };

//         dispatch(updateBridgeAction({
//             bridgeId: params.id,
//             dataToSend: { ...updatedDataToSend }
//         }));
//     };
    
//     useEffect(() => {
//         if (!service || !bridgeType) return; 
//         if (service !== 'openai' && bridgeType === 'batch') {
//             dispatch(updateBridgeAction({
//                 bridgeId: params.id,
//                 dataToSend: { bridgeType: 'api' }
//             }));
//         }
//     }, [params.version, service, bridgeType]);

//     const bridgeOptions = [
//         {
//             value: 'api',
//             label: 'API',
//             tooltip: 'The API allows users to connect with AI models to perform tasks like generating responses or processing information.',
//             disabled: false
//         },
//         {
//             value: 'chatbot',
//             label: 'ChatBot',
//             tooltip: 'ChatBot enables you to create conversational AI agents that can interact with users in natural language.',
//             disabled: modelType === 'embedding'
//         },
//         {
//             value: 'batch',
//             label: 'Batch API',
//             tooltip: 'Batch api automates and executes multiple tasks simultaneously for greater efficiency.',
//             disabled: modelType === 'embedding' || service?.toLowerCase() !== 'openai' || modelType === 'image'
//         },
//         {
//             value: 'trigger',
//             label: 'Triggers',
//             tooltip: 'Triggers allows you to create automated workflows that respond to specific events or conditions.',
//             disabled: modelType === 'embedding'
//         }
//     ].filter(option => !isEmbedUser || option.value !== 'trigger');

//     return (
//         <div className='flex flex-col gap-4 bg-base-100 text-base-content'>
//             {/* Segmented Control */}
//             <div className="bg-gray-100 p-1 rounded-lg inline-flex w-fit">
//                 {bridgeOptions.map((option) => (
//                     <InfoTooltip key={option.value} tooltipContent={option.tooltip}>
//                         <button
//                             onClick={() => !option.disabled && handleInputChange(option.value)}
//                             disabled={option.disabled}
//                             className={`
//                                 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
//                                 flex items-center gap-2 min-w-fit
//                                 ${bridgeType?.toString()?.toLowerCase() === option.value 
//                                     ? 'bg-white text-primary shadow-sm' 
//                                     : option.disabled 
//                                         ? 'text-gray-400 cursor-not-allowed' 
//                                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
//                                 }
//                             `}
//                         >
//                             {option.label}
//                         </button>
//                     </InfoTooltip>
//                 ))}
//             </div>

//             {/* Embedding Model Warning */}
//             {modelType === 'embedding' && (
//                 <div role="alert" className="alert p-2 w-fit">
//                     <InfoIcon size={16} />
//                     <span className='label-text-alt'>Embedding models do not support ChatBot.</span>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Protected(BridgeTypeToggle);
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

    const handleInputChange = (value) => {
        let updatedDataToSend = {
            bridgeType: value
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

    const bridgeOptions = [
        {
            value: 'api',
            label: 'API',
            tooltip: 'The API allows users to connect with AI models to perform tasks like generating responses or processing information.',
            disabled: false
        },
        {
            value: 'chatbot',
            label: 'ChatBot',
            tooltip: 'ChatBot enables you to create conversational AI agents that can interact with users in natural language.',
            disabled: modelType === 'embedding'
        },
        {
            value: 'batch',
            label: 'Batch API',
            tooltip: 'Batch api automates and executes multiple tasks simultaneously for greater efficiency.',
            disabled: modelType === 'embedding' || service?.toLowerCase() !== 'openai' || modelType === 'image'
        },
        {
            value: 'trigger',
            label: 'Triggers',
            tooltip: 'Triggers allows you to create automated workflows that respond to specific events or conditions.',
            disabled: modelType === 'embedding'
        }
    ].filter(option => !isEmbedUser || option.value !== 'trigger');

    return (
        <div className='flex flex-col gap-4 bg-base-100 text-base-content'>
            {/* Pill Buttons */}
            <div className="flex flex-wrap gap-2 w-fit">
                {bridgeOptions.map((option) => (
                    <InfoTooltip key={option.value} tooltipContent={option.tooltip}>
                        <button
                            onClick={() => !option.disabled && handleInputChange(option.value)}
                            disabled={option.disabled}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                flex items-center gap-2 border
                                ${bridgeType?.toString()?.toLowerCase() === option.value 
                                    ? 'bg-primary text-white border-blue-500 shadow-md' 
                                    : option.disabled 
                                        ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' 
                                        : 'text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                                }
                            `}
                        >
                            {option.label}
                        </button>
                    </InfoTooltip>
                ))}
            </div>

            {/* Embedding Model Warning */}
            {modelType === 'embedding' && (
                <div role="alert" className="alert p-2 w-fit">
                    <InfoIcon size={16} />
                    <span className='label-text-alt'>Embedding models do not support ChatBot.</span>
                </div>
            )}
        </div>
    );
};

export default Protected(BridgeTypeToggle);