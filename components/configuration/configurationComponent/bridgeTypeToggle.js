import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const BridgeTypeToggle = ({ params }) => {

    const { bridge } = useCustomSelector((state) => ({
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    }));

    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        let newCheckedValue = e.target.checked
        let updatedDataToSend = {
            configuration: {
                model: bridge?.configuration?.model?.default,
            },
            service: bridge?.service?.toLowerCase(),
            bridgeType: newCheckedValue ? 'chatbot' : 'api'
        };
        UpdateBridge(updatedDataToSend);
    };

    const UpdateBridge = (currentDataToSend) => {
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { ...currentDataToSend } }));
    }

    return (
        <label className='flex items-center justify-start w-fit gap-4'>
            <div className="label">
                <span className="label-text">API</span>
            </div>
            <input
                type="checkbox"
                key={bridge?.bridgeType}
                className="toggle"
                defaultChecked={bridge?.bridgeType === "chatbot" ? true : false}
                onChange={(e) => handleInputChange(e, "bridgeType")}
            />
            <div className="label">
                <span className="label-text">ChatBot</span>
            </div>
        </label>
    );
};

export default BridgeTypeToggle;