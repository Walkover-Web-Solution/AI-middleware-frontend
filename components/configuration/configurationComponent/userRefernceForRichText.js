import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { AlertIcon, PencilIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';

const UserReferenceForRichText = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const { is_rich_text = true, user_reference } = useCustomSelector((state) => ({
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.is_rich_text,
        user_reference: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.user_reference || "",
    }));
    const isRichText = is_rich_text === "" ? true : is_rich_text;
    const [showInput, setShowInput] = useState(user_reference?.trim()?.length > 0);

    const handleInputChange = (e) => {
        let newCheckedValue = e.target.checked
        let updatedDataToSend = {
            configuration: {
                is_rich_text: newCheckedValue
            }
        };
        dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: { ...updatedDataToSend } }));
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        if (newValue !== user_reference) {
            dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: searchParams?.version, dataToSend: { user_reference: newValue } }));
        }
    };

    useEffect(() => {
        setShowInput(user_reference?.trim()?.length > 0);
    }, [user_reference]);

    return (
        <div>
            <div className='flex flex-col gap-1 w-fit bg-base-100 text-base-content'>
                {isRichText && (
                    <div className="max-w-[30rem] bg-base-200 border border-warning rounded-md px-2 py-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                <AlertIcon size={12} className="text-warning flex-shrink-0" />
                                <span className="text-xs text-base-content/80 leading-tight">
                                When Rich Text is enabled, responses will be returned in Markdown format, overriding the current response format
                                </span>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className='flex flex-row justify-between items-center w-full'>
                    <div className='flex flex-row items-center justify-center gap-1'>
                        <div className="label">
                            <InfoTooltip tooltipContent={"Rich text supports buttons, tables, cards, and markdown for displaying structured and interactive content."}>
                                <span className="font-medium text-nowrap info">Rich Text Supported</span>
                            </InfoTooltip>
                        </div>
                        <input
                            type="checkbox"
                            checked={isRichText}
                            onChange={handleInputChange}
                            className="toggle"
                        />
                    </div>
                    
                    <div className='tooltip tooltip-top flex justify-end' data-tip={"Customize rich text to enhance responses with UI elements like buttons, tables, and cards. Or else, responses will appear in plain text."}>
                        {(isRichText && user_reference?.trim()?.length === 0) && (
                            <button
                                onClick={() => setShowInput(!showInput)}
                                className="btn btn-sm gap-1"
                            >
                                <PencilIcon size={12} />
                                customize
                            </button>
                        )}
                    </div>
                </div>
            </div>
            
            {showInput && isRichText && (
                <div className="mt-3">
                    <textarea
                        placeholder="Please provide a user reference for the rich text"
                        className="textarea textarea-bordered border border-base-300 w-full min-h-[10rem] resize-y"
                        defaultValue={user_reference}
                        key={user_reference}
                        onBlur={handleUserReferenceChange}
                    />
                </div>
            )}
        </div>
    );
};

export default UserReferenceForRichText;