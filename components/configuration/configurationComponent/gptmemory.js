import React from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import InfoModel from '@/components/infoModel';

const GptMemory = ({ params }) => {
    const dispatch = useDispatch();
    const { gpt_memory_context, gpt_memory } = useCustomSelector((state) => ({
        gpt_memory_context: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.gpt_memory_context || "",
        gpt_memory: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.gpt_memory || false,
    }));

    const handleCheckboxChange = (e) => {
        const newValue = e.target.checked;
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { gpt_memory: newValue } }));
    };

    const handleUserReferenceChange = (e) => {
        const newValue = e.target.value;
        if (newValue !== gpt_memory_context) {
            dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { gpt_memory_context: newValue } }));
        }
    };

    return (
        <div>
            <label className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
                <div className='flex flex-row items-center gap-2'>
                    <div className="label">
                        <InfoModel tooltipContent={"If this feature is enabled, we will pass the stored memory data by default in history/conversations."}>
                        <span className="font-medium text-nowrap info ">Enable LLM-memory</span>
                        
                        </InfoModel>
                    </div>
                    <input
                        type="checkbox"
                        checked={gpt_memory}
                        onChange={handleCheckboxChange}
                        className="toggle"
                    />
                </div>
            </label>
            {gpt_memory && (
                <textarea
                    placeholder="Please provide the context for LLM memory (e.g., instructions, preferences)"
                    className="textarea textarea-bordered w-full min-h-[10rem] border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-primary"
                    defaultValue={gpt_memory_context}
                    key={gpt_memory_context}
                    onBlur={handleUserReferenceChange}
                />
            )}
        </div>
    );
};

export default GptMemory;