import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { Info } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

const BridgeTypeToggle = ({ params }) => {
    const dispatch = useDispatch();
    const { bridgeType } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
    }));


    const handleInputChange = (e) => {
        let newCheckedValue = e.target.value;
        let updatedDataToSend = {
            bridgeType: newCheckedValue
        };
        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { ...updatedDataToSend } }));
    };

    return (
        <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className='flex flex-row items-center gap-2'>
                <div className="label">
                    {/* <span className="label-text">Select Bridge Type</span> */}
                </div>
                <div className="flex flex-row items-center gap-2">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="bridgeType"
                            value="api"
                            className="radio radio-primary"
                            checked={bridgeType?.toString()?.toLowerCase() === "api"}
                            onChange={(e) => handleInputChange(e, "bridgeType")}
                        />
                        <span className="label-text ml-2">API</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="bridgeType"
                            value="chatbot"
                            className="radio radio-primary"
                            checked={bridgeType?.toString()?.toLowerCase() === "chatbot"}
                            onChange={(e) => handleInputChange(e, "bridgeType")}
                        />
                        <span className="label-text ml-2">ChatBot</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="radio"
                            name="bridgeType"
                            value="batch"
                            className="radio radio-primary"
                            checked={bridgeType?.toString()?.toLowerCase() === "batch"}
                            onChange={(e) => handleInputChange(e, "bridgeType")}
                        />
                        <span className="label-text ml-2">Batch API</span>
                    </label>
                </div>
            </div>
            <div>
                {bridgeType?.toString()?.toLowerCase() === "chatbot" && <div role="alert" className="alert p-2">
                    <Info size={16} />
                    <span className='label-text-alt'>Only supports models which have JSON support. &#40; like gpt-4o &#41;</span>
                </div>}
            </div>
        </div>
    );
};

export default BridgeTypeToggle;