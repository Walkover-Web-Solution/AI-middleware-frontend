import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Info } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

function ToolCallCount({ params }) {
    const dispatch = useDispatch();
    const { tool_call_count, modelType, model } = useCustomSelector((state) => ({
        tool_call_count: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.tool_call_count,
        modelType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.type?.toLowerCase(),
        model: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.configuration?.model,
    }));

    const handleFunctionCountChange = (e) => {
        const new_value = parseInt(e.target.value, 10);
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { tool_call_count: new_value } }));
    }

    return (
        <>
            {(modelType !== 'reasoning' || model === 'o1') ?
                <div className='form-control'>
                    <div className="label items-center flex justify-start">
                        <span className="label-text font-medium">Maximum Function Call Limit</span>
                        <div className="tooltip tooltip-right" data-tip={"This feature sets a limit on function calls. By default, functions are called one at a time, but with 'Parallel Tools' enabled, multiple functions can be called simultaneously within a single function call."}>
                            <Info size={12} className='ml-2' />
                        </div>
                    </div>
                    <input
                        type="number"
                        placeholder="Type here"
                        class="input input-sm input-bordered w-full max-w-xs"
                        min={1}
                        max={30}
                        key={tool_call_count}
                        defaultValue={tool_call_count || 3}
                        onInput={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (value < 2) e.target.value = 2;
                            if (value > 30) e.target.value = 30;
                        }}
                        onBlur={(e) => handleFunctionCountChange(e)}
                    />
                </div>
                : null}
        </>
    )
}

export default ToolCallCount