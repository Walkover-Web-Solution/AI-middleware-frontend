import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Pencil } from 'lucide-react';
import React, { useCallback, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function VersionDescriptionInput({ params }) {
    const dispatch = useDispatch();
    const [isEditable, setIsEditable] = useState(false);
    const { versionDescription } = useCustomSelector((state) => ({
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.version_description || "",
    }));

    const inputRef = useRef(null);

    const saveBridgeVersionDescription = useCallback(() => {
        const newValue = inputRef.current?.value || "";
        dispatch(updateBridgeVersionAction({ versionId: params?.version, dataToSend: { version_description: newValue } }));
        setIsEditable(false);
    }, [dispatch, params?.version]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            saveBridgeVersionDescription();
        }
    }, [saveBridgeVersionDescription]);

    return (
        <div className='mb-2'>
            <div className='flex flex-col items-start gap-2'>
                <p className='font-bold'>Bridge Version Description : </p>
                {!isEditable && <div className='flex items-center gap-4'>
                    <div className="flex items-center gap-4">
                        <div className="bg-base">{versionDescription || <span className='opacity-50'>Enter your bridge version description</span>}</div>
                        <Pencil size={16} onClick={() => setIsEditable(true)} className='' />
                    </div>
                </div>}
                {isEditable && <input ref={inputRef} type="text" placeholder="Enter your bridge version description" autoFocus className="input w-full max-w-xs text-lg bg-base placeholder-opacity-50" onBlur={saveBridgeVersionDescription} defaultValue={versionDescription} onKeyDown={handleKeyDown} />}
            </div>
        </div>
    )
}

export default React.memo(VersionDescriptionInput)