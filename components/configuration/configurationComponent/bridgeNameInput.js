import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function BridgeNameInput({ params }) {
    const dispatch = useDispatch();
    const { bridgeName } = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
    }));

    const handleBridgeNameChange = useCallback((e) => {
        const newValue = e.target.value.trim() || "";
        if (newValue === bridgeName) { e.target.value = bridgeName; return };
        if (newValue?.trim() === "") {
            toast.error('Bridge name cannot be empty');
            e.target.value = bridgeName;
            
            return;
        }
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { name: newValue } }));
    }, [dispatch, params.id, bridgeName]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }, [handleBridgeNameChange]);

    return (
        <div className='flex flex-row items-center'>
            <div className="relative w-full">
                <input
                    type="text"
                    className="font-bold text-xl outline-none w-full"
                    onBlur={handleBridgeNameChange}
                    onKeyDown={handleKeyDown}
                    defaultValue={bridgeName}
                    placeholder="Enter Bridge Name"
                    key={bridgeName}
                />
            </div>
        </div>
    )
}

export default React.memo(BridgeNameInput)