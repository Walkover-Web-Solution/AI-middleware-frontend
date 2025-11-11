import React from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import InfoTooltip from '@/components/InfoTooltip';

const StarterQuestionToggle = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const IsstarterQuestionEnable = useCustomSelector((state) => 
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.IsstarterQuestionEnable || false
    );
    
    const handleToggle = () => {
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: searchParams?.version,
            dataToSend: { IsstarterQuestionEnable: !IsstarterQuestionEnable }
        }));
    };

    return (
        <div className="flex items-center justify-between border border-base-content/20 rounded-md gap-2">
            <div className="label cursor-pointer ml-1">
                <InfoTooltip tooltipContent={"Toggle to enable/disable starter questions"}>
                <span className="mr-2 info text-sm">Starter Question</span>
                </InfoTooltip>
            </div>
            <input
                type="checkbox"
                checked={IsstarterQuestionEnable}
                onChange={handleToggle}
                className="toggle mr-2 toggle-xs"
                defaultValue={IsstarterQuestionEnable ? "true" : "false"}
            />
        </div>
    );
};

export default StarterQuestionToggle;