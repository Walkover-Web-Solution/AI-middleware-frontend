import React from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { Info } from 'lucide-react';
import InfoModel from '@/components/infoModel';

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
                <InfoModel tooltipContent={"Toggle to enable/disable starter questions"}>
                <span className="font-medium mr-2 info">Starter Question</span>
                </InfoModel>
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