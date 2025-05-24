import React from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { Info } from 'lucide-react';

const StarterQuestionToggle = ({ params }) => {
    const dispatch = useDispatch();
    const starterQuestionEnabled = useCustomSelector((state) => 
        state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.starter_question_enable || false
    );

    const handleToggle = () => {
        dispatch(updateBridgeVersionAction({
            bridgeId: params.id,
            versionId: params.version,
            dataToSend: { starter_question_enable: !starterQuestionEnabled }
        }));
    };

    return (
        <div className="flex items-center gap-2">
            <div className="label cursor-pointer">
                <span className="font-medium mr-2">Starter Question</span>
                <div className="tooltip" data-tip="Toggle to enable/disable starter questions">
                    <Info size={14} className="inline-block" />
                </div>
            </div>
            <input
                type="checkbox"
                checked={starterQuestionEnabled}
                onChange={handleToggle}
                className="toggle toggle-primary"
                defaultValue={starterQuestionEnabled ? "true" : "false"}
            />
        </div>
    );
};

export default StarterQuestionToggle;