import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { Pencil } from 'lucide-react';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function BridgeNameInput({ params }) {
    const dispatch = useDispatch();
    const [isEditable, setIsEditable] = React.useState(false);
    const { bridgeName } = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
    }));

    const handleBridgeNameChange = useCallback((e) => {
        const newValue = e.target.value;
        if (newValue?.trim() === "") {
            toast.error('Bridge name cannot be empty');
            return;
        }
        setIsEditable(false);
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { name: newValue } }));
        if (newValue && window?.SendDataToChatbot) {
            SendDataToChatbot({
                "threadId": newValue
            });
        }
    }, [dispatch, params.id]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            handleBridgeNameChange(e);
        }
    }, [handleBridgeNameChange]);

    return (
        <div className='mb-2'>
            {!isEditable &&
                <div className='flex flex-row items-center gap-4'>
                    <div className="font-bold text-xl">{bridgeName}</div>
                    <Pencil size={18} onClick={() => setIsEditable(true)} className='' />
                </div>
            }
            {isEditable && <input key={bridgeName} type="text" placeholder="Type here" autoFocus className="input w-full max-w-xs text-lg" onBlur={handleBridgeNameChange} defaultValue={bridgeName} onKeyDown={handleKeyDown} />}
        </div>
    )
}

export default React.memo(BridgeNameInput)