import dynamic from 'next/dynamic';
const PublishBridgeVersionModal = dynamic(() => import('@/components/modals/publishBridgeVersionModal'), { ssr: false });
import VersionDescriptionModal from '@/components/modals/versionDescriptionModal';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal, sendDataToParent } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';

function BridgeVersionDropdown({ params, searchParams, isEmbedUser }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const versionDescriptionRef = useRef('');
    const hasInitialized = useRef(false);
    const lastFetchedVersion = useRef(null);
    const isProcessing = useRef(false);
    
    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription} = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || [],
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.version_description || "",
    }));

    // Memoized function to fetch version data only when needed
    const fetchVersionData = useCallback((versionId) => {
        if (!versionId || lastFetchedVersion.current === versionId || isProcessing.current) {
            return;
        }
        isProcessing.current = true;
        lastFetchedVersion.current = versionId;
        dispatch(getBridgeVersionAction({ versionId, version_description: versionDescriptionRef }))
            .finally(() => {
                isProcessing.current = false;
            });
    }, [dispatch]);

    // SendDataToChatbot effect - only runs when version changes
    useEffect(() => {
        if (!searchParams?.version) return;
        
        const timer = setInterval(() => {
            if (typeof SendDataToChatbot !== 'undefined') {
                SendDataToChatbot({ "version_id": searchParams.version });
                clearInterval(timer);
            }
        }, 300);
        
        return () => clearInterval(timer);
    }, [searchParams?.version]);

    // Initialize version only once on mount or when versions become available
    useEffect(() => { 
        if (hasInitialized.current) {
            return;
        }
        // If no version in URL but we have versions available
        if (!searchParams?.version && (bridgeVersionsArray.length > 0 || publishedVersion)) {
            const defaultVersion = publishedVersion || bridgeVersionsArray[0];
            if (defaultVersion) {
                hasInitialized.current = true;
                // Only update URL, don't fetch yet - the next effect will handle fetching
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${defaultVersion}`);
            }
        }
        // If version exists in URL, fetch its data
        else if (searchParams?.version) {
            hasInitialized.current = true;
            fetchVersionData(searchParams.version);
        }
    }, []);

    const handleVersionChange = useCallback((version) => {
        if (searchParams?.version === version) return;
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${version}`);
        fetchVersionData(version);
    }, [searchParams?.version, params.org_id, params.id, router]);

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
        {(bridgeVersionsArray?.length > 0 || publishedVersion) && (
            <div className="dropdown  dropdown-bottom dropdown-end mr-2">
                <div tabIndex={0} role="button" className={`btn btn-sm ${searchParams?.version === publishedVersion ? 'bg-green-100 hover:bg-green-200 text-base-content' : ''}`}>
                    <span className={`${searchParams?.version === publishedVersion ? 'text-black' : 'text-base-content'}`}>V{bridgeVersionsArray.indexOf(searchParams?.version) + 1 || 'Select'}</span>
                    {searchParams?.version === publishedVersion &&
                        <span className="relative inline-flex items-center ml-2">
                            <span className="text-green-600 ml-1">●</span>
                        </span>
                    }
                </div>
                <ul tabIndex={0} className="dropdown-content menu rounded-box z-high w-52 p-2 shadow bg-base-100">
                    {bridgeVersionsArray?.map((version, index) => (
                        <li key={version} onClick={() => handleVersionChange(version)} >
                            <a className={`flex justify-between ${searchParams?.version === version ? 'active' : ''}`}>
                                Version {index + 1}
                                {version === publishedVersion && <span className="text-green-600 ml-1">●</span>}
                            </a>
                        </li>
                    ))}
                    {/* Only show Create New Version button if first version is published */}
                    
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
        )}
            <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName}  agent_description = {versionDescription}/>
            <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion}/>
        </div>
    );
}

export default Protected(BridgeVersionDropdown)