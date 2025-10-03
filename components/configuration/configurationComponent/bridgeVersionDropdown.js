import InfoTooltip from '@/components/InfoTooltip';
import PublishBridgeVersionModal from '@/components/modals/publishBridgeVersionModal';
import VersionDescriptionModal from '@/components/modals/versionDescriptionModal';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal, sendDataToParent } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function BridgeVersionDropdown({ params, searchParams, isEmbedUser }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const versionDescriptionRef = React?.useRef('');
    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription} = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || [],
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.version_description || "",
    }));

    useEffect(() => {
        const timer = setInterval(() => {
            if (typeof SendDataToChatbot !== 'undefined' && searchParams?.version) {
                SendDataToChatbot({ "version_id": searchParams.version });
                clearInterval(timer);
            }
        }, 300);
        return () => {
            clearInterval(timer);
        }
    }, [searchParams?.version])

    const handleVersionChange = (version) => {
        if(searchParams?.version === version) return;
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${version}`);
        dispatch(getBridgeVersionAction({ versionId: version, version_description:versionDescriptionRef }));
    };

    useEffect(() => {
        if ((!searchParams?.version && bridgeVersionsArray.length > 0) || (!searchParams?.version && publishedVersion.length > 0)) {
            router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${publishedVersion?.length > 0 ? publishedVersion : bridgeVersionsArray[0]}`);
            dispatch(getBridgeVersionAction({ versionId: publishedVersion?.length > 0 ? publishedVersion : bridgeVersionsArray[0], version_description:versionDescriptionRef }));
        }
        else{
            router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${searchParams?.version}`);
            dispatch(getBridgeVersionAction({ versionId: searchParams?.version, version_description:versionDescriptionRef }));
        }
    }, [publishedVersion, searchParams?.version]);

    const handleCreateNewVersion = () => {
        // create new version
        const version_description_input  = versionDescriptionRef?.current?.value;
         dispatch(createBridgeVersionAction({ parentVersionId: searchParams?.version, bridgeId: params.id, version_description: versionDescriptionRef?.current?.value,orgId: params.org_id }, (data) => {
            isEmbedUser && sendDataToParent("updated", { name: bridgeName, agent_description: version_description_input , agent_id: params?.id, agent_version_id: data?.version_id }, "Agent Version Created Successfully")
            router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${data.version_id}`);
        }))
        versionDescriptionRef.current.value = ''
    }
    return (
        <div className='flex items-center gap-2'>
            <div className="dropdown dropdown-bottom dropdown-end mr-2">
                <div tabIndex={0} role="button" className={`btn ${searchParams?.version === publishedVersion ? 'bg-green-100 hover:bg-green-200 text-base-content' : ''}`}>
                    <span className={`${searchParams?.version === publishedVersion ? 'text-black' : 'text-base-content'}`}>V{bridgeVersionsArray.indexOf(searchParams?.version) + 1 || 'Select'}</span>
                    {searchParams?.version === publishedVersion &&
                        <span className="relative inline-flex items-center ml-2">
                            <span className="text-green-600 ml-1">●</span>
                            <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-green-500 opacity-75"></span>
                        </span>
                    }
                </div>
                <ul tabIndex={0} className="dropdown-content menu rounded-box z-high w-52 p-2 shadow bg-base-100">
                    {bridgeVersionsArray?.map((version, index) => (
                        <li key={version} onClick={() => handleVersionChange(version)} >
                            <InfoTooltip tooltipContent={versionDescription}>
                                <a className={`flex justify-between ${searchParams?.version === version ? 'active' : ''}`}>
                                    Version {index + 1}
                                    {version === publishedVersion && <span className="text-green-600 ml-1">●</span>}
                                </a>
                            </InfoTooltip>
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
            <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName}  agent_description = {versionDescription}/>
            <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion}/>
        </div>
    );
}

export default Protected(BridgeVersionDropdown)