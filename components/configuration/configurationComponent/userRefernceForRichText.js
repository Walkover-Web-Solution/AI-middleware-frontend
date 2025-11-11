import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { AlertIcon, PencilIcon, ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';

const UserReferenceForRichText = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const { is_rich_text = true, user_reference } = useCustomSelector((state) => ({
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.is_rich_text,
        user_reference: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.user_reference || "",
    }));
    const isRichText = is_rich_text === "" ? true : is_rich_text;
    const [userReference, setUserReference] = useState(user_reference);
    const [showInput, setShowInput] = useState(user_reference?.length > 0);

    const handleCheckboxChange = (e) => {
        const newValue = e.target.checked;
        let updatedDataToSend = {
            configuration: {
                is_rich_text: newValue
            }
        };
        dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: { ...updatedDataToSend } }));
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
        <div className="bg-base-100 border border-base-content/20 rounded-md mt-4">
            {/* Header Section */}
            <div className="p-2">
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {isRichText && (
                                <InfoTooltip tooltipContent="When Rich Text is enabled, responses will be returned in Markdown format, overriding the current response format.">
                                <AlertIcon size={12} className="text-warning flex-shrink-0 " />
                                </InfoTooltip>
                        )}
                        <InfoTooltip tooltipContent="Rich text supports buttons, tables, cards, and markdown for displaying structured and interactive content. Or else, responses will appear in plain text.">
                           
                        <span className="text-base-content info text-sm ml-0">Rich Text Supported</span>
                        </InfoTooltip>
                       
                    </div>

                    <input
                        type="checkbox"
                        checked={isRichText}
                        onChange={handleCheckboxChange}
                        className="toggle toggle-xs"
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