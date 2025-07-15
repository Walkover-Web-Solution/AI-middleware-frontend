import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { PencilIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';

const UserReferenceForRichText = ({ params }) => {
    const dispatch = useDispatch();
    const { is_rich_text = true, user_reference } = useCustomSelector((state) => ({
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.is_rich_text,
        user_reference: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.user_reference || "",
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
        dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params.version, dataToSend: { ...updatedDataToSend } }));
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        if (newValue !== user_reference) {
            dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { user_reference: newValue } }));
        }
    };

    useEffect(() => {
        setShowInput(user_reference?.trim()?.length > 0);
    }, [user_reference]);

    return (
        <div>
            <div className='flex flex-col lg:flex-row justify-center items-center w-fit gap-4 bg-base-100 text-base-content'>
                <div className='flex flex-row items-center justify-center gap-1'>
                    <div className="label">
                        <InfoTooltip tooltipContent={"Rich text supports buttons, tables, cards, and markdown for displaying structured and interactive content."} className='z-low-medium w-64 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto
            '>
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
                <InfoTooltip className='z-low-medium w-64 p-3 bg-gray-900 text-white text-primary-foreground rounded-md shadow-xl text-xs animate-in fade-in zoom-in border border-gray-700 space-y-2 pointer-events-auto' tooltipContent='Customize rich text to enhance responses with UI elements like buttons, tables, and cards. Or else, responses will appear in plain text.'>
                <div className='flex justify-end' >
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
                </InfoTooltip>
            </div>
            {showInput && isRichText && (
            <div className="mt-3">
                <textarea
                    placeholder="Please provide a user reference for the rich text"
                    className="textarea textarea-bordered border w-full min-h-[10rem] resize-y"
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