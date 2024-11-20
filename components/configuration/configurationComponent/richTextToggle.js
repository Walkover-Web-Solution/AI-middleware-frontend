import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

function RichTextToggle({ params }) {
    const dispatch = useDispatch();
    const { is_rich_text = true } = useCustomSelector((state) => ({
        is_rich_text: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.is_rich_text,
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
    return (
        <label className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className='flex flex-row items-center gap-2'>
                <div className="label">
                    <span className="label-text">Rich Text Supported</span>
                </div>
                <input
                    type="checkbox"
                    key={is_rich_text}
                    className="toggle"
                    defaultChecked={isRichText}
                    onChange={(e) => handleInputChange(e, "bridgeType")}
                />
            </div>
        </label>
    )
}

export default RichTextToggle;