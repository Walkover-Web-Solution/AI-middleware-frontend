import React, { useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { Info } from 'lucide-react';

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
            <label className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
                <div className='flex flex-row items-center gap-2'>
                    <div className="label">
                        <span className="font-medium text-nowrap">Rich Text Supported</span>
                        <div className="tooltip tooltip-right" data-tip={"If this feature is enabled, the system will support rich text formatting in responses."}>
                            <Info size={12} className='ml-2' />
                        </div>
                    </div>
                    <input
                        type="checkbox"
                        key={is_rich_text}
                        className="toggle"
                        defaultChecked={isRichText}
                        onChange={handleInputChange}
                    />
                    {is_rich_text && <button 
                        onClick={() => setShowInput(!showInput)}
                        className="btn btn-sm bg-transparent text-primary hover:bg-primary/10 border-none shadow-none"
                    >
                        {showInput ? 'Hide Customization' : 'Customize Rich Text'}
                    </button>}
                </div>
            </label>
            {is_rich_text && showInput && (
                <textarea
                    placeholder="Please provide a user reference for the rich text"
                    className="textarea textarea-bordered w-full min-h-[10rem] border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    defaultValue={user_reference}
                    key={user_reference}
                    onBlur={handleUserReferenceChange}
                />
            )}
        </div>
    );
};

export default UserReferenceForRichText;