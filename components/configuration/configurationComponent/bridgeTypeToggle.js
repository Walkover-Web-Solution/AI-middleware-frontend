import { useCustomSelector } from '@/customHooks/customSelector';
import { DEFAULT_MODEL } from '@/jsonFiles/bridgeParameter';
import { updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Info } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

const BridgeTypeToggle = ({ params }) => {
    const dispatch = useDispatch();
    const { bridgeType, modelType, service } = useCustomSelector((state) => ({
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    }));


    const handleInputChange = (e) => {
        let newCheckedValue = e.target.checked;
        let updatedDataToSend = {
            bridgeType: newCheckedValue ? 'chatbot' : 'api'
        };

        dispatch(updateBridgeAction({ bridgeId: params?.id, dataToSend: { ...updatedDataToSend } }));
    };

    return (
        <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
            <div className='flex flex-row items-center gap-2'>
                <div className="label">
                    <span className="label-text">API</span>
                </div>
                <input
                    type="checkbox"
                    key={bridgeType}
                    className="toggle"
                    defaultChecked={bridgeType?.toString()?.toLowerCase() === "chatbot" ? true : false}
                    onChange={(e) => handleInputChange(e, "bridgeType")}
                    disabled={modelType === 'embedding'}
                />
                <div className="label">
                    <span className="label-text">ChatBot</span>
                </div>
            </div>
            <div>
                {modelType === 'embedding' && (
                    <div role="alert" className="alert p-2">
                        <Info size={16} />
                        <span className='label-text-alt'>Embedding models do not support ChatBot.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BridgeTypeToggle;