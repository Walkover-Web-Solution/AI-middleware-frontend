import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const ApiKeyInput = ({ params }) => {
    const dispatch = useDispatch();
    const { bridge_apiKey } = useCustomSelector((state) => ({
        bridge_apiKey: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.apikey,
    }));

    const onChangeApiKey = (e) => {
        const newValue = e.target?.value;
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { apikey: newValue } }));
    }

    return (
        <label className="form-control max-w-xs text-base-content">
            <div className="label">
                <span className="label-text">Service's API Key</span>
            </div>
            <input
                type="text"
                required
                key={bridge_apiKey}
                defaultValue={bridge_apiKey}
                className="input input-bordered max-w-xs input-sm bg-base-100 text-base-content"
                onBlur={onChangeApiKey}
            />
        </label>
    );
};

export default ApiKeyInput;