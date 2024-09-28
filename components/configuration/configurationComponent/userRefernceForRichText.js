import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const UserReferenceForRichText = ({ params }) => {
    const dispatch = useDispatch();

    // Destructure the necessary state using the custom selector
    const { userReferenceRichText } = useCustomSelector((state) => ({
        userReferenceRichText: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.userReferenceRichText || "",
    }));

    // Handler for when the textarea loses focus (onBlur)
    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { user_reference: newValue } }));
    };

    return (
        <>
            <label className="form-control max-w-xs">
                    <div className="label">
                        <span className="font-medium">Enter User Reference for Rich Text</span>
                    </div>
                    <textarea
                        placeholder="Type here"
                        className="textarea textarea-bordered w-full min-h-[10rem] input-sm"
                        defaultValue={userReferenceRichText}
                        onBlur={handleUserReferenceChange}
                    />
                </label>
           
        </>
    );
};

export default UserReferenceForRichText;
