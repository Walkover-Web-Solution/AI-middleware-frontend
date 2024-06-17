import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const SlugNameInput = ({ params }) => {

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const dispatch = useDispatch();
    const handleInputChange = (e, key, isSlider = false) => {
        let newValue = e.target.value;

        let updatedDataToSend = {
            service: bridge?.service?.toLowerCase(),
            configuration: {
                model: bridge?.configuration?.model?.default,
            },
            slugName: isSlider ? Number(newValue) : newValue,
        };

        UpdateBridge(updatedDataToSend);
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }

    if (bridge?.bridgeType !== "chatbot") return null;
    return (
        <label className="form-control max-w-xs">
            <div className="label">
                <span className="label-text">Enter Slugname</span>
            </div>
            <input
                type="text"
                key={bridge?.slugName}
                placeholder="Type here"
                className="input input-bordered w-full max-w-xs input-sm"
                defaultValue={bridge?.slugName}
                onBlur={(e) => {
                    if (e.target.value.trim()) handleInputChange(e, "slugName")
                }}
            />
            <div className="label">
                <span className="label-text-alt text-gray-500">Slugname must be unique</span>
                {/* <span className="label-text-alt">It can only contain letters, numbers, and hyphens</span> */}
            </div>
        </label>
    );
};

export default SlugNameInput;