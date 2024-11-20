import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import React from 'react'
import { useDispatch } from 'react-redux';

function BridgeVersionDropdown({ params }) {
    const dispatch = useDispatch();
    const { bridgeVersionsArray } = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || []
    }));

    const handleVersionChange = (version) => {
        dispatch(getBridgeVersionAction({ versionId: version }));
    }
    const handleCreateNewVersion = () => {
        // create new version
        dispatch(createBridgeVersionAction({parentVersionId: bridgeVersionsArray[0], bridgeId: params.id}, (data)=>{

        }))
    }
    return (
        <div className="dropdown dropdown-bottom dropdown-end mr-2">
            <div tabIndex={0} role="button" className="btn m-1">Versions</div>
            <ul tabIndex={0} className="dropdown-content menu rounded-box z-[9999999] w-52 p-2 shadow bg-base-100">
                {bridgeVersionsArray?.map((version, index) => (
                    <li key={version} onClick={() => handleVersionChange(version)}><a>Version {index + 1}</a></li>
                ))}
                <button className="btn" onClick={handleCreateNewVersion}>Create New Version</button>
            </ul>
        </div>
    )
}
export default BridgeVersionDropdown