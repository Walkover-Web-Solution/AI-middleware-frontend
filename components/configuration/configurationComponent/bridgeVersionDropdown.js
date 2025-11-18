import dynamic from 'next/dynamic';
const PublishBridgeVersionModal = dynamic(() => import('@/components/modals/publishBridgeVersionModal'), { ssr: false });
import VersionDescriptionModal from '@/components/modals/versionDescriptionModal';
import Protected from '@/components/protected';
import { useCustomSelector } from '@/customHooks/customSelector';
import { createBridgeVersionAction, deleteBridgeVersionAction, getBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { openModal, sendDataToParent } from '@/utils/utility';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ChevronDown, ChevronLeft, Plus, Info } from 'lucide-react';
import { TrashIcon } from '@/components/Icons';
import DeleteModal from '@/components/UI/DeleteModal';
import useDeleteOperation from '@/customHooks/useDeleteOperation';

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
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE.DELETE_VERSION_MODAL);

    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription, bridgeVersionMapping } = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || [],
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.version_description || "",
        bridgeVersionMapping: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id] || {},
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

    // Helper function to get version description
    const getVersionDescription = useCallback((versionId) => {
        return bridgeVersionMapping?.[versionId]?.version_description || "No description available";
    }, [bridgeVersionMapping]);

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
        const version_description_input = versionDescriptionRef?.current?.value;
        dispatch(createBridgeVersionAction({ parentVersionId: searchParams?.version, bridgeId: params.id, version_description: versionDescriptionRef?.current?.value, orgId: params.org_id }, (data) => {
            isEmbedUser && sendDataToParent("updated", { name: bridgeName, agent_description: version_description_input, agent_id: params?.id, agent_version_id: data?.version_id }, "Agent Version Created Successfully")
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

        await executeDelete(async () => {
            await dispatch(deleteBridgeVersionAction({ versionId: selectedDataToDelete?.version, bridgeId: params.id, org_id: params.org_id }));
            if (searchParams?.version === selectedDataToDelete?.version) {
                const remainingVersions = bridgeVersionsArray.filter(v => v !== selectedDataToDelete?.version);
                const nextVersion = publishedVersion && publishedVersion !== selectedDataToDelete?.version
                    ? publishedVersion
                    : remainingVersions[0];
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${nextVersion}`);
            }
            setselectedDataToDelete(null);
        });
    }, [bridgeVersionsArray, publishedVersion, searchParams?.version, params, router, selectedDataToDelete, dispatch, executeDelete]);

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
                <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName} agent_description={versionDescription} />
                <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion} />
            </div>
        );
    }

    return (
        <div className='flex items-center gap-1'>
            {/* Version Tabs Container */}
            <div className="flex items-center gap-1">
                {versionsToShow.map((version, index) => {
                    const isActive = searchParams?.version === version;
                    const isPublished = version === publishedVersion;
                    const versionNumber = bridgeVersionsArray.indexOf(version) + 1;
                    const versionDesc = getVersionDescription(version);
                    const canDelete = bridgeVersionsArray.length > 1 && !isPublished;

                    return (
                        <div key={version} className="relative group">
                            <button
                                onClick={() => handleVersionChange(version)}
                                className={`
                                    flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 relative
                                    ${canDelete ? 'group-hover:pr-8' : ''}
                                    ${isActive
                                        ? 'bg-base-300 text-base-content border border-base-300'
                                        : 'bg-base-100 text-base-content border border-base-200 hover:bg-base-200'
                                    }
                                `}
                            >
                                <span>V{versionNumber}</span>
                                {isPublished && (
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Published Version"></span>
                                )}
                                
                                {/* Info Icon - always visible */}
                                <div className="tooltip tooltip-bottom" data-tip={versionDesc}>
                                    <Info 
                                        size={12} 
                                        className="transition-opacity duration-200 cursor-help text-base-content/60"
                                    />
                                </div>
                            </button>

                            {/* Delete Button - appears on hover, positioned outside button */}
                            {canDelete && (
                                <span
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setselectedDataToDelete({ version, index: bridgeVersionsArray.indexOf(version) + 1 }); 
                                        openModal(MODAL_TYPE?.DELETE_VERSION_MODAL) 
                                    }}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 
                                             transition-opacity duration-200 hover:bg-red-100 rounded p-0.5 z-10 cursor-pointer"
                                    title={`Delete Version ${bridgeVersionsArray.indexOf(version) + 1}`}
                                >
                                    <TrashIcon size={12} className="text-red-500 hover:text-red-700" />
                                </span>
                            )}
                        </div>
                    );
                })}

                {/* More/Less Button */}
                {hasMoreVersions && (
                    <button
                        onClick={() => setShowAllVersions(!showAllVersions)}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-base-100 text-base-content border border-base-200 hover:bg-base-200 rounded-md transition-all duration-200"
                        title={showAllVersions ? "Show Less" : `Show More (${bridgeVersionsArray.length - versionsToShow.length} hidden)`}
                    >
                        {showAllVersions ? (
                            <>
                                <ChevronLeft className="w-3 h-3" />
                                <span className="hidden sm:inline">Less</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-3 h-3" />
                                <span className="text-xs">+{bridgeVersionsArray.length - versionsToShow.length}</span>
                            </>
                        )}
                    </button>
                )}

                {/* Create New Version Button */}
                <button
                    onClick={() => openModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-base-100 text-base-content border border-base-200 hover:bg-base-200 rounded-md transition-all duration-200"
                    title="Create New Version"
                >
                    <Plus className="w-3 h-3" />
                    <span className="hidden sm:inline">New</span>
                </button>
            </div>

            <PublishBridgeVersionModal params={params} searchParams={searchParams} agent_name={bridgeName} agent_description={versionDescription} />
            <VersionDescriptionModal versionDescriptionRef={versionDescriptionRef} handleCreateNewVersion={handleCreateNewVersion} />
            <DeleteModal modalType={MODAL_TYPE.DELETE_VERSION_MODAL} onConfirm={handleDeleteVersion} item={selectedDataToDelete} description={`Are you sure you want to delete the Version "${selectedDataToDelete?.index}"? This action cannot be undone.`} title='Delete Version' loading={isDeleting} isAsync={true} />
        </div>
    );
}

export default Protected(BridgeVersionTabs)