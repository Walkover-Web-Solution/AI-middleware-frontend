import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { PencilIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import { CircleQuestionMark, Crown } from 'lucide-react';

const UserReferenceForRichText = ({ params, searchParams, isPublished }) => {
    const dispatch = useDispatch();
    const { user_reference } = useCustomSelector((state) => ({
        user_reference: isPublished ? state?.bridgeReducer?.allBridgesMap?.[params?.id]?.user_reference : state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.user_reference || "",
    }));
    
    // Disable rich text functionality - force to false for premium feature
    const isRichText = false; // Disabled for premium feature
    const [userReference, setUserReference] = useState(user_reference);
    const [showInput, setShowInput] = useState(false); // Always false since feature is disabled

    const handleCheckboxChange = (e) => {
        // Prevent any changes - show premium upgrade message
        e.preventDefault();
        return false;
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        setUserReference(newValue);
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: searchParams?.version, dataToSend: { user_reference: newValue } }));
    };

    const toggleExpansion = () => {
        setShowInput(!showInput);
    };

    useEffect(() => {
        setShowInput(user_reference?.length > 0);
    }, [user_reference]);
    
    return (
        <div className="bg-base-100 mt-4">
            {/* Header Section */}
            <div className="p-2">
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <InfoTooltip tooltipContent="Rich Text support is available in the Premium version. Upgrade to unlock advanced formatting with buttons, tables, cards, and markdown.">
                            <Crown size={16} className="text-amber-500 flex-shrink-0 cursor-help" />
                        </InfoTooltip>
                        <span className="text-base-content text-sm ml-0">Rich Text Supported</span>
                        <InfoTooltip tooltipContent="Rich text supports buttons, tables, cards, and markdown for displaying structured and interactive content. This is a premium feature available in the Pro version.">
                            <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                        </InfoTooltip>
                    </div>

                    <input
                        type="checkbox"
                        checked={isRichText}
                        onChange={handleCheckboxChange}
                        disabled={true}
                        className="toggle toggle-xs opacity-50 cursor-not-allowed"
                    />
                </div>

                {/* Status and Action Row */}
                {isRichText && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-base-200/40 to-base-300/20 rounded-lg border border-base-300/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs font-medium text-base-content/80">
                                    {userReference?.length > 0
                                        ? "Custom user reference active"
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
            {showInput && isRichText && (
                <div className="border-t border-base-300 bg-gradient-to-b from-base-200/10 to-base-200/30">
                    <div className="p-4">
                        <div className="mb-3">
                            <label className="text-sm text-base-content mb-1 block">
                                User Reference
                            </label>
                            <p className="text-xs text-base-content/70 leading-relaxed">
                                Customize rich text to enhance responses with UI elements like buttons, tables, and cards. Or else, responses will appear in plain text.
                            </p>
                        </div>
                        <textarea
                            className="textarea bg-white dark:bg-black/15 textarea-bordered w-full min-h-[7rem] resize-y border-base-300 focus:border-base-content/30 focus:outline-none transition-colors text-sm leading-relaxed placeholder:text-base-content/40"
                            defaultValue={userReference}
                            onBlur={handleUserReferenceChange}
                            key={userReference}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserReferenceForRichText;
