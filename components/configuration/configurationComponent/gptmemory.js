import React, { useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import InfoModel from '@/components/infoModel';
import { PencilIcon } from '@/components/Icons';

const GptMemory = ({ params }) => {
    const dispatch = useDispatch();
    const [showInput, setShowInput] = useState(false);
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
            <div className='flex flex-col lg:flex-row justify-start w-fit gap-4 bg-base-100 text-base-content'>
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
                <div className='tooltip tooltip-top flex justify-end' data-tip={"enhance gpt memeory"}>
                    {gpt_memory && (
                        <button
                            onClick={() => setShowInput(!showInput)}
                            className="text-sm text-primary hover:text-primary-focus flex items-center gap-1 cursor-pointer"
                        >
                            customize
                            <PencilIcon size={12} />

                        </button>
                    )}
                </div>
            </div>

            {gpt_memory && showInput && (
                <div className="mt-3">
                    <textarea
                        placeholder="Provide context for LLM memory (e.g., user preferences, conversation style, key information to remember)"
                        className=" textarea textarea-bordered border w-full min-h-[10rem] resize-y"
                        defaultValue={gpt_memory_context}
                        key={gpt_memory_context}
                        onBlur={handleUserReferenceChange}
                    />
                </div>
            )}
        </div>
    );
};

export default GptMemory;