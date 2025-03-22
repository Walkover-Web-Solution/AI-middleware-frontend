import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function VersionDescriptionInput({ params }) {
    const dispatch = useDispatch();
    const { versionDescription } = useCustomSelector((state) => ({
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.version_description || "",
    }));

    const inputRef = useRef(null);

    const saveBridgeVersionDescription = useCallback((e) => {
        const newValue = e.target.textContent.trim() || "";
        if (newValue === versionDescription) return;
        if (newValue?.trim() === "") {
            toast.error('Version description cannot be empty');
            e.target.textContent = versionDescription;
            return;
        }
        dispatch(updateBridgeVersionAction({ versionId: params?.version, dataToSend: { version_description: newValue } }));
    }, [dispatch, params?.version, versionDescription]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }, [saveBridgeVersionDescription]);

    const handleFocus = useCallback((e) => {
        const range = document.createRange();
        const selection = window.getSelection();
        if (e?.target?.childNodes?.length > 0) {
            const firstNode = e.target.childNodes[0];
            const safeOffset = Math.min(1, firstNode.length || 0);
            range?.setStart(firstNode, safeOffset);
            range?.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
        }
    }, []);

    return (
        <div className='mb-2'>
            <div className='flex flex-row items-center gap-2'>
                <div className="label whitespace-nowrap">
                    <span className="label-text capitalize font-medium">Version Description :</span>
                </div>
                <div
                    ref={inputRef}
                    contentEditable
                    suppressContentEditableWarning
                    className="text-md outline-none rounded px-1 cursor-text w-full"
                    onBlur={saveBridgeVersionDescription}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder="Enter version description"
                >
                    {versionDescription}
                </div>
            </div>
        </div>
    )
}

export default React.memo(VersionDescriptionInput)