import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { PencilIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import InfoTooltip from '@/components/infoTooltip';
import { CircleQuestionMark } from 'lucide-react';

const   GptMemory = ({ params, searchParams, isPublished }) => {
    const dispatch = useDispatch();

    const { gpt_memory_context, gpt_memory } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
        
        return {
            gpt_memory_context: isPublished ? (bridgeDataFromState?.gpt_memory_context || "") : (versionData?.gpt_memory_context || ""),
            gpt_memory: isPublished ? (bridgeDataFromState?.gpt_memory || false) : (versionData?.gpt_memory || false),
        };
    });
    const [showInput, setShowInput] = useState(gpt_memory_context?.length > 0);

    const handleCheckboxChange = (e) => {
        const newValue = e.target.checked;
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: searchParams?.version, dataToSend: { gpt_memory: newValue } }));
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        if (newValue !== gpt_memory_context) {
            dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: searchParams?.version, dataToSend: { gpt_memory_context: newValue } }));
        }
    };
    const toggleExpansion = () => {
        setShowInput(!showInput);
    };
    useEffect(() => {
        setShowInput(gpt_memory_context?.length > 0);
    }, [gpt_memory_context]);

    return (
        <div className="bg-base-100">
            {/* Header Section */}
            <div className="p-1">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-base-content text-sm ml-1">Long Term Memory</span>
                        <InfoTooltip tooltipContent="If this feature is enabled we will pass the stored memory data by default in history/conversation">
                        <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                        </InfoTooltip>
                    </div>
                    
                    <input
                        type="checkbox"
                        checked={gpt_memory}
                        onChange={handleCheckboxChange}
                        className="toggle toggle-xs"
                        disabled={isPublished}
                    />
                </div>
                
                {/* Status and Action Row */}
                {gpt_memory && (
                    <div className="mt-2 p-2 bg-gradient-to-r from-base-200/40 to-base-300/20 rounded border border-base-300/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-base-content/80">
                                    {gpt_memory_context?.length > 0 
                                        ? "Custom context active"
                                        : "Default behavior"
                                    }
                                </span>
                            </div>
                            
                            <button
                                onClick={toggleExpansion}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-base-content bg-base-200 hover:bg-base-300 rounded transition-all duration-200 border border-base-300"
                            >
                                <PencilIcon size={10} />
                                <span>{showInput ? 'Hide' : 'Edit'}</span>
                                {showInput ? <ChevronUpIcon size={10} /> : <ChevronDownIcon size={10} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expandable Context Input */}
            {showInput && gpt_memory && (
                <div className="border-t border-base-300 bg-gradient-to-b from-base-200/10 to-base-200/30">
                    <div className="p-2">
                        <div className="mb-2">
                            <label className="text-xs text-base-content mb-1 block">
                                Memory Context
                            </label>
                            <p className="text-xs text-base-content/70 leading-relaxed">
                                Define what the AI should remember about your preferences and conversation style.
                            </p>
                        </div>
                        <textarea
                        disabled={isPublished}
                            className="textarea bg-white dark:bg-black/15 textarea-bordered w-full min-h-[3.5rem] resize-y border-base-300 focus:border-base-content/30 focus:outline-none transition-colors text-xs leading-relaxed placeholder:text-base-content/40"
                           defaultValue={gpt_memory_context}
                           onBlur={handleUserReferenceChange}
                           key={gpt_memory_context}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default GptMemory;
