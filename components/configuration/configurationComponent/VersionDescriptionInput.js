import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { sendDataToParent } from '@/utils/utility';
import React, { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

function VersionDescriptionInput({ params, searchParams, isEmbedUser }) {
    const dispatch = useDispatch();
    const { versionDescription, bridgeName } = useCustomSelector((state) => ({
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.version_description || "",
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
    }));

    const saveBridgeVersionDescription = useCallback((e) => {
        const newValue = e.target.value.trim() || "";
        if (newValue === versionDescription) { e.target.value = versionDescription; return };
        if (newValue?.trim() === "") {
            toast.error('Version description cannot be empty');
            e.target.value = versionDescription;
            return;
        }
        dispatch(updateBridgeVersionAction({ versionId: searchParams?.version, dataToSend: { version_description: newValue } }));
        isEmbedUser && sendDataToParent("updated", {name: bridgeName, agent_description: newValue, agent_id: params?.id, agent_version_id: searchParams?.version }, "Agent Version Description Updated")
    }, [dispatch, searchParams?.version, versionDescription]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.target.blur();
        }
    }, [saveBridgeVersionDescription]);

    return (
        <div className='mb-2 '>
            <div className='flex flex-row items-center'>
                <div className="label pl-0  whitespace-nowrap">
                </div>
                <div className="relative w-full">
                    <input
                        type="text"
                        className="text-md outline-none w-full bg-transparent"
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

export default Protected(React.memo(VersionDescriptionInput))