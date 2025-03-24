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

    const saveBridgeVersionDescription = useCallback((e) => {
        const newValue = e.target.value.trim() || "";
        if (newValue === versionDescription) { e.target.value = versionDescription; return };
        if (newValue?.trim() === "") {
            toast.error('Version description cannot be empty');
            e.target.value = versionDescription;
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

    return (
        <div className='mb-2'>
            <div className='flex flex-row items-center'>
                <div className="label pl-0  whitespace-nowrap">
                    <span className="label-text capitalize font-medium">Version Description :</span>
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        className="text-md outline-none w-full"
                        onBlur={saveBridgeVersionDescription}
                        onKeyDown={handleKeyDown}
                        defaultValue={versionDescription}
                        placeholder="Enter Version Description"
                        key={versionDescription}
                    />
                </div>
            </div>
        </div>
    )
}

export default React.memo(VersionDescriptionInput)