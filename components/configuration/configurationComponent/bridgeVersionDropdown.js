import PublishBridgeVersionModal from '@/components/modals/publishBridgeVersionModal';
import VersionDescriptionModal from '@/components/modals/versionDescriptionModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { useCreateBridgeVersionMutation } from '@/store/services/bridgeApi';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function BridgeVersionDropdown({ params }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const versionDescriptionRef = React?.useRef('');
    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription} = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || [],
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.version_description || "",
    }));
   const [createBridgeVersionMutation] = useCreateBridgeVersionMutation();
    useEffect(() => {
        const timer = setInterval(() => {
            if (typeof SendDataToChatbot !== 'undefined' && params.version) {
                SendDataToChatbot({ "version_id": params.version });
                clearInterval(timer);
            }
        }, 300);
        return () => {
            clearInterval(timer);
        }
    }, [params.version])

    const handleVersionChange = (version) => {
        if(params.version === version) return;
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${version}`);
        dispatch(getBridgeVersionAction({ versionId: version, version_description:versionDescriptionRef }));
    };

    useEffect(() => {
        if (!params.version && bridgeVersionsArray.length > 0) {
            router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${publishedVersion?.length > 0 ? publishedVersion : bridgeVersionsArray[0]}`);
        }
    }, [params.version, bridgeVersionsArray]);

    const handleCreateNewVersion = async () => {
        // create new version
        const dataToSend = {
            version_id: params?.version,
            version_description: versionDescriptionRef?.current?.value
          }
      const res= await createBridgeVersionMutation(dataToSend)
       router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${res?.data?.version_id}`);
        versionDescriptionRef.current.value = ''
    }
    return (
        <div className='flex items-center gap-2'>
            <div className="dropdown dropdown-bottom dropdown-end mr-2">
                <div tabIndex={0} role="button" className={`btn ${params.version === publishedVersion ? 'bg-green-100 hover:bg-green-200' : ''}`}>
                    V {bridgeVersionsArray.indexOf(params.version) + 1 || 'Select'}
                    {params.version === publishedVersion &&
                        <span className="relative inline-flex items-center ml-2">
                            <span className="text-green-600 ml-1">●</span>
                            <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-green-500 opacity-75"></span>
                        </span>
                    }
                </div>
                <ul tabIndex={0} className="dropdown-content menu rounded-box z-high w-52 p-2 shadow bg-base-100">
                    {bridgeVersionsArray?.map((version, index) => (
                        <li key={version} onClick={() => handleVersionChange(version)} >
                            <a className={`flex justify-between ${params.version === version ? 'active' : ''}`}>
                                Version {index + 1}
                                {version === publishedVersion && <span className="text-green-600 ml-1">●</span>}
                            </a>
                        </li>
                    ))}
                    <li>
                        <button
                            className="btn mt-3 w-full text-left"
                            onClick={()=>openModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL)}
                        >
                            Create New Version <span className='ml-1'>&rarr;</span>
                        </button>
                    </li>
                </ul>
            </div>
            <PublishBridgeVersionModal params={params} agent_name={bridgeName}  agent_description = {versionDescription}/>
            <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion}/>
        </div>
    );
}

export default BridgeVersionDropdown