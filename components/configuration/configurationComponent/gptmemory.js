import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { PencilIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';

const   GptMemory = ({ params, searchParams }) => {
    const dispatch = useDispatch();

    const { gpt_memory_context, gpt_memory } = useCustomSelector((state) => ({
        gpt_memory_context: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.gpt_memory_context || "",
        gpt_memory: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.gpt_memory || false,
    }));
    const [memoryContext, setMemoryContext] = useState(gpt_memory_context);
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
        <div className="bg-base-100 border border-base-content/20 rounded-md mb-4">
            {/* Header Section */}
            <div className="p-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <InfoTooltip tooltipContent="If this feature is enabled we will pass the stored memory data by default in history/conversation">
                        <span className="text-base-content info text-sm ml-1">Long Term Memory</span>
                        </InfoTooltip>
                    </div>
                    
                    <input
                        type="checkbox"
                        checked={gpt_memory}
                        onChange={handleCheckboxChange}
                        className="toggle"
                    />
                </div>
                
                {/* Status and Action Row */}
                {gpt_memory && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-base-200/40 to-base-300/20 rounded-lg border border-base-300/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-base-content/80">
                                    {gpt_memory_context?.length > 0 
                                        ? "Custom context active"
                                        : "Default behavior"
                                    }
                                </span>
                            </div>
                            
                            <button
                                onClick={toggleExpansion}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-base-content bg-base-200 hover:bg-base-300 rounded-lg transition-all duration-200 border border-base-300 hover:shadow-sm"
                            >
                                <PencilIcon size={12} />
                                <span>{showInput ? 'Hide' : 'Edit'}</span>
                                {showInput ? <ChevronUpIcon size={12} /> : <ChevronDownIcon size={12} />}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expandable Context Input */}
            {showInput && gpt_memory && (
                <div className="border-t border-base-300 bg-gradient-to-b from-base-200/10 to-base-200/30">
                    <div className="p-4">
                        <div className="mb-3">
                            <label className="text-sm text-base-content mb-1 block">
                                Memory Context
                            </label>
                            <p className="text-xs text-base-content/70 leading-relaxed">
                                Define what the AI should remember about your preferences and conversation style.
                            </p>
                        </div>
                        <textarea
                            className="textarea bg-white dark:bg-black/15 textarea-bordered w-full min-h-[7rem] resize-y border-base-300 focus:border-base-content/30 focus:outline-none transition-colors text-sm leading-relaxed placeholder:text-base-content/40"
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
