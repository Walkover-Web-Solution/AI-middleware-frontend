import dynamic from 'next/dynamic';
const PublishBridgeVersionModal = dynamic(() => import('@/components/modals/publishBridgeVersionModal'), { ssr: false });
import VersionDescriptionModal from '@/components/modals/versionDescriptionModal';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, deleteBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { closeModal, openModal, sendDataToParent } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronLeft, ChevronUp, Plus, X } from 'lucide-react';
import { TrashIcon } from '@/components/Icons';
import DeleteModal from '@/components/UI/DeleteModal';

function BridgeVersionTabs({ params, searchParams, isEmbedUser }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const versionDescriptionRef = useRef('');
    const hasInitialized = useRef(false);
    const lastFetchedVersion = useRef(null);
    const isProcessing = useRef(false);
    const [showAllVersions, setShowAllVersions] = useState(false);
    const [maxVisibleVersions, setMaxVisibleVersions] = useState(4);
    const [selectedDataToDelete, setselectedDataToDelete] = useState();
    
    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription} = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || [],
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.version_description || "",
    }));

    // Calculate responsive max visible versions based on screen width
    useEffect(() => {
        const updateMaxVersions = () => {
            const width = window.innerWidth;
            if (width < 640) setMaxVisibleVersions(2);      // Mobile
            else if (width < 768) setMaxVisibleVersions(3);  // Small tablet
            else if (width < 1024) setMaxVisibleVersions(4); // Tablet
            else if (width < 1280) setMaxVisibleVersions(5); // Small desktop
            else setMaxVisibleVersions(6);                   // Large desktop
        };

        updateMaxVersions();
        window.addEventListener('resize', updateMaxVersions);
        return () => window.removeEventListener('resize', updateMaxVersions);
    }, []);

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

    const handleDeleteVersion = useCallback(async () => {
        if (bridgeVersionsArray.length <= 1) {
            alert("Cannot delete the only remaining version");
            return;
        }
        if (selectedDataToDelete?.version === publishedVersion) {
            alert("Cannot delete the published version");
            return;
        }
        try {
            await dispatch(deleteBridgeVersionAction({ versionId:selectedDataToDelete?.version, bridgeId: params.id, org_id: params.org_id }));
            if (searchParams?.version === selectedDataToDelete?.version) {
                const remainingVersions = bridgeVersionsArray.filter(v => v !== selectedDataToDelete?.version);
                const nextVersion = publishedVersion && publishedVersion !== selectedDataToDelete?.version 
                    ? publishedVersion 
                    : remainingVersions[0];
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${nextVersion}`);
            }
        } catch (error) {
            console.error("Error deleting version:", error)
        }
        finally{
            setselectedDataToDelete(null);
            closeModal(MODAL_TYPE.DELETE_VERSION_MODAL)
        }
    }, [bridgeVersionsArray, publishedVersion, searchParams?.version, params, router, selectedDataToDelete]);

    // Determine which versions to show with smart visibility around active version
    const getVersionsToShow = () => {
        if (showAllVersions) {
            return bridgeVersionsArray;
        }
        
        if (bridgeVersionsArray.length <= maxVisibleVersions) {
            return bridgeVersionsArray;
        }
        
        // Find the index of the currently active version
        const activeIndex = bridgeVersionsArray.findIndex(version => version === searchParams?.version);
        
        if (activeIndex === -1) {
            // If no active version found, show first versions
            return bridgeVersionsArray.slice(0, maxVisibleVersions);
        }
        
        // Calculate how many versions to show on each side of the active version
        const sideCount = Math.floor((maxVisibleVersions - 1) / 2);
        
        // Calculate start and end indices
        let startIndex = Math.max(0, activeIndex - sideCount);
        let endIndex = Math.min(bridgeVersionsArray.length, activeIndex + sideCount + 1);
        
        // Adjust if we're near the beginning or end
        if (endIndex - startIndex < maxVisibleVersions) {
            if (startIndex === 0) {
                endIndex = Math.min(bridgeVersionsArray.length, maxVisibleVersions);
            } else if (endIndex === bridgeVersionsArray.length) {
                startIndex = Math.max(0, bridgeVersionsArray.length - maxVisibleVersions);
            }
        }
        
        return bridgeVersionsArray.slice(startIndex, endIndex);
    };
    
    const versionsToShow = getVersionsToShow();
    const hasMoreVersions = bridgeVersionsArray.length > maxVisibleVersions;

    if (!bridgeVersionsArray.length) {
        return (
            <div className='flex items-center gap-2'>
                <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName} agent_description={versionDescription}/>
                <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion}/>
            </div>
        );
    }

    return (
        <div className='flex items-center gap-2 w-full'>
            {/* Version Tabs Container */}
            <div className="flex items-center overflow-hidden">
                {/* Version Tabs Group */}
                <div className="tabs tabs-boxed bg-base-200 p-0 gap-0 h-8 flex-nowrap overflow-x-auto scrollbar-hide mr-24">
                    {versionsToShow.map((version, index) => {
                        const isActive = searchParams?.version === version;
                        const isPublished = version === publishedVersion;
                        const canDelete = bridgeVersionsArray.length > 1 && !isPublished;
                        
                        return (
                            <button
                                key={version}
                                onClick={() => handleVersionChange(version)}
                                className={`
                                    tab tab-sm h-full px-3 text-xs font-medium transition-all duration-200 border-0 relative group
                                    ${canDelete ? 'hover:pr-8' : ''}
                                    ${isActive 
                                        ? isPublished 
                                            ? 'tab-active bg-green-100 text-green-800' 
                                            : 'tab-active bg-primary text-primary-content'
                                        : 'hover:bg-base-300 text-base-content'
                                    }
                                `}
                            >
                                <span className="flex items-center gap-1">
                                    V{bridgeVersionsArray.indexOf(version) + 1}
                                    {isPublished && (
                                        <span className="w-2 h-2 bg-green-500 rounded-full" title="Published Version"></span>
                                    )}
                                </span>
                                
                                {/* Delete Button - appears on hover */}
                                {canDelete && (
                                    <span
                                        onClick={(e) => {e.stopPropagation(); setselectedDataToDelete({version, index:bridgeVersionsArray.indexOf(version) + 1}); openModal(MODAL_TYPE?.DELETE_VERSION_MODAL)}}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 
                                                 transition-opacity duration-200 hover:bg-red-100 rounded p-0.5 z-10 cursor-pointer"
                                        title={`Delete Version ${bridgeVersionsArray.indexOf(version) + 1}`}
                                    >
                                        <TrashIcon size={12} className="text-red-500 hover:text-red-700" />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                    
                    {/* More/Less Button */}
                    {hasMoreVersions && (
                        <button
                            onClick={() => setShowAllVersions(!showAllVersions)}
                            className="tab tab-sm h-full px-2 text-xs hover:bg-base-300 text-base-content flex-shrink-0"
                            title={showAllVersions ? "Show Less" : `Show More (${bridgeVersionsArray.length - versionsToShow.length} hidden)`}
                        >
                            {showAllVersions ? (
                                <>
                                    <ChevronLeft className="w-3 h-3" />
                                    <span className="hidden sm:inline ml-1">Less</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDown className="w-3 h-3" />
                                    <span className="badge badge-xs badge-primary ml-1">
                                        +{bridgeVersionsArray.length - versionsToShow.length}
                                    </span>
                                </>
                            )}
                        </button>
                    )}
                    
                    {/* Create New Version Button */}
                    <button
                        onClick={() => openModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL)}
                        className="tab tab-sm h-full px-2 text-xs hover:bg-base-300 text-base-content flex-shrink-0 focus:outline-none"
                        title="Create New Version"
                    >
                        <Plus className="w-3 h-3" />
                        <span className="hidden sm:inline ml-1">New</span>
                    </button>
                </div>
            </div>

            <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName} agent_description={versionDescription}/>
            <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion}/>
            <DeleteModal modalType={MODAL_TYPE.DELETE_VERSION_MODAL} onConfirm={handleDeleteVersion} item={selectedDataToDelete} description={`Are you sure you want to delete the Version "${selectedDataToDelete?.index}"? This action cannot be undone.`} title='Delete Version'/>
        </div>
    );
}

export default Protected(BridgeVersionTabs)