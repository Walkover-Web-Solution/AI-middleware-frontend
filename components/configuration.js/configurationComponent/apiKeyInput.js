import { updateBridge } from '@/config';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params }) => {

    const dispatch = useDispatch()

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));


    const onSave = (value) => {
        const updatedDataToSend = {
            configuration: {
                model: bridge?.configuration?.model?.default,
            },
            service: bridge?.service?.toLowerCase(),
            apikey: value // Update the field with the new value
        };
        UpdateBridge(updatedDataToSend);
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }


    return (
        <label className="form-control  max-w-xs ">
            <div className="label">
                <span className="label-text">Provide Your API Key</span>
            </div>
            <input
                type="text"
                required
                defaultValue={bridge?.apikey}
                className="input input-bordered max-w-xs input-sm"
                onBlur={(e) => onSave(e.target.value)}
            />
        </label>
    );
};

export default ApiKeyInput;