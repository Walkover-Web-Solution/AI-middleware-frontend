import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function BridgeNameInput({ params }) {
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const { bridgeName } = useCustomSelector((state) => ({
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name,
    }));

    const handleBridgeNameChange = useCallback((e) => {
        const newValue = e.target.textContent;
        if (newValue?.trim() === "") {
            toast.error('Bridge name cannot be empty');
            e.target.textContent = bridgeName;
            return;
        }
        if(newValue === bridgeName) return;
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { name: newValue } }));
        if (newValue && window?.SendDataToChatbot) {
            SendDataToChatbot({
                "threadId": newValue
            });
        }
    }, [dispatch, params.id, bridgeName]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }, [handleBridgeNameChange]);

    const handleFocus = useCallback((e) => {
        const range = document.createRange();
        const selection = window.getSelection();
        range.setStart(e.target, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }, []);

    return (
        <div className='mb-2'>
            <div
                ref={inputRef}
                contentEditable
                suppressContentEditableWarning
                className="font-bold text-xl outline-none rounded px-1 cursor-text"
                onBlur={handleBridgeNameChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
            >
                {bridgeName}
            </div>
        </div>
    )
}

export default React.memo(BridgeNameInput)