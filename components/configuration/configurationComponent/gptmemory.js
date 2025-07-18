import React, { useEffect, useState } from 'react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { useDispatch } from 'react-redux';
import { PencilIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';

const GptMemory = ({ params }) => {
    const dispatch = useDispatch();
    const { gpt_memory_context, gpt_memory } = useCustomSelector((state) => ({
        gpt_memory_context: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.gpt_memory_context || "",
        gpt_memory: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.gpt_memory || false,
    }));

    const [showInput, setShowInput] = useState(gpt_memory_context?.length > 0);
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

    useEffect(() => {
        setShowInput(gpt_memory_context?.length > 0);
    }, [gpt_memory_context]);

    return (
        <div>
            <div className='flex  flex-row justify-center items-center w-fit gap-4 bg-base-100 text-base-content'>
                <div className='flex flex-row items-center justify-center gap-1'>
                    <div className="label">
                        <InfoTooltip tooltipContent={"If this feature is enabled, we will pass the stored memory data by default in history/conversations."}>
                        <span className="font-medium text-nowrap info ">Enable LLM-memory</span>
                        
                        </InfoTooltip>
                    </div>
                    <input
                        type="checkbox"
                        checked={gpt_memory}
                        onChange={handleCheckboxChange}
                        className="toggle"
                    />
                </div>
                <div className='tooltip tooltip-top flex justify-end' data-tip={"Customize the context you’d like the LLM to remember for future conversations; or else, it’ll store only your basic personal information by default."}>
                    {(gpt_memory && gpt_memory_context?.length === 0) && (
                        <button
                            onClick={() => setShowInput(!showInput)}
                            className="btn btn-sm gap-1"
                        >
                            <PencilIcon size={12} />
                            customize
                        </button>
                    )}
                </div>
            </div>

            {showInput && gpt_memory && (
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