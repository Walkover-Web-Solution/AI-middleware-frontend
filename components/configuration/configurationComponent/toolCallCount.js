import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import React from 'react'
import { useDispatch } from 'react-redux';

function ToolCallCount({ params }) {
    const dispatch = useDispatch();
    const { tool_call_count } = useCustomSelector((state) => ({
        tool_call_count: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.tool_call_count,
    }));

    const handleFunctionCountChange = (e) => {
        const new_value = parseInt(e.target.value, 10);
        dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { tool_call_count: new_value } }));
    }

    return (
        <div className='form-control'>
            <div className="label">
                <span className="label-text font-medium">Number of function calls</span>
            </div>
            <input
                type="number"
                placeholder="Type here"
                class="input input-sm input-bordered w-full max-w-xs"
                min={1}
                max={30}
                defaultValue={tool_call_count || 3}
                onInput={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (value < 2) e.target.value = 2;
                    if (value > 30) e.target.value = 30;
                }}
                onBlur={(e) => handleFunctionCountChange(e)}
            />
        </div>
    )
}

export default ToolCallCount