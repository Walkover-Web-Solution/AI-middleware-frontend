import React, { useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import InfoModel from '@/components/infoModel';
import { PencilIcon } from '@/components/Icons';

const UserReferenceForRichText = ({ params }) => {
    const dispatch = useDispatch();
    const [showInput, setShowInput] = useState(false);
    const { is_rich_text = true, user_reference } = useCustomSelector((state) => ({
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.is_rich_text,
        user_reference: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.user_reference || "",

    }));
    const isRichText = is_rich_text === "" ? true : is_rich_text;

    const handleInputChange = (e) => {
        let newCheckedValue = e.target.checked
        let updatedDataToSend = {
            configuration: {
                is_rich_text: newCheckedValue
            }
        };
        // dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { ...updatedDataToSend } }));
        dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params.version, dataToSend: { ...updatedDataToSend } }));
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        if (newValue !== user_reference) {
            dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { user_reference: newValue } }));
        }
    };


    return (
        <div>
            <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
                <div className='flex flex-row items-center gap-2'>
                    <div className="label">
                        <InfoModel tooltipContent={"Rich text supports buttons, tables, cards, and markdown for displaying structured and interactive content."}>
                        <span className="font-medium mr-2 info">Rich Text Supported</span>
                         </InfoModel>
                    </div>
                      
                    <input
                        type="checkbox"
                        key={is_rich_text}
                        className="toggle"
                        defaultChecked={isRichText}
                        onChange={handleInputChange}
                    />
                </div>
                    <div className='tooltip tooltip-top flex justify-end ' data-tip={"Enhance rich text"}>
                        {is_rich_text && (
                            <button
                                onClick={() => setShowInput(!showInput)}
                                className="text-sm text-primary hover:text-primary-focus flex items-center gap-1 cursor-pointer"
                            >
                                customize
                                <PencilIcon size={12} />

                            </button>

                        )}
                    </div>
            </div>
            {is_rich_text && showInput && (
                <textarea
                    placeholder="Please provide a user reference for the rich text"
                    className="textarea textarea-bordered border w-full min-h-[10rem] resize-y"
                    defaultValue={user_reference}
                    key={user_reference}
                    onBlur={handleUserReferenceChange}
                />
            )}
        </div>
    );
};

export default UserReferenceForRichText;