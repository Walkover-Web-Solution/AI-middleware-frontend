import React from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import InfoTooltip from '@/components/InfoTooltip';

const StarterQuestionToggle = ({ params }) => {
    const dispatch = useDispatch();
    const IsstarterQuestionEnable = useCustomSelector((state) => 
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.IsstarterQuestionEnable || false
    );
    
    const handleToggle = () => {
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { IsstarterQuestionEnable: !IsstarterQuestionEnable }
        }));
    };

    return (
        <div className="flex items-center gap-2">
            <div className="label cursor-pointer">
                <InfoTooltip tooltipContent={"Toggle to enable/disable starter questions"} className='z-low-medium w-64 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto
            '>
                <span className="font-medium mr-2 info">Starter Question</span>
                </InfoTooltip>
            </div>
            <input
                type="checkbox"
                checked={IsstarterQuestionEnable}
                onChange={handleToggle}
                className="toggle"
                defaultValue={IsstarterQuestionEnable ? "true" : "false"}
            />
        </div>
    );
};

export default StarterQuestionToggle;