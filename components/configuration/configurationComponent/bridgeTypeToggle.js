import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React from 'react';
import { useDispatch } from 'react-redux';

const BridgeTypeToggle = ({ params }) => {
    const dispatch = useDispatch();
    const { bridgeType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    }));


    const handleInputChange = (e) => {
        let newCheckedValue = e.target.checked
        let updatedDataToSend = {
            bridgeType: newCheckedValue ? 'chatbot' : 'api'
        };
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { ...updatedDataToSend } }));
    };

    return (
        <label className='flex items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className="label">
                <span className="label-text">API</span>
            </div>
            <input
                type="checkbox"
                key={bridgeType}
                className="toggle"
                defaultChecked={bridgeType?.toString()?.toLowerCase() === "chatbot" ? true : false}
                onChange={(e) => handleInputChange(e, "bridgeType")}
            />
            <div className="label">
                <span className="label-text">ChatBot</span>
            </div>
        </label>
    );
};

export default BridgeTypeToggle;