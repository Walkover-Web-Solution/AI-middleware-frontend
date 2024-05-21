import { updateBridge } from '@/api';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ dataToSend, params }) => {

    const dispatch = useDispatch()

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));


    const onSave = (value) => {
        const updatedDataToSend = {
            ...dataToSend,
            apikey: value // Update the field with the new value
        };
        UpdateBridge(updatedDataToSend); // Send the updated dataToSend to UpdateBridge
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...currentDataToSend } }));
    }


    return (
        <label className="form-control w-full ">
            <div className="label">
                <span className="label-text">Provide Your API Key</span>
            </div>
            <input
                type="text"
                required
                defaultValue={bridge?.apikey}
                className="input w-full input-bordered max-w-xs input-sm"
                onBlur={(e) => onSave(e.target.value)}
            />
        </label>
    );
};

export default ApiKeyInput;