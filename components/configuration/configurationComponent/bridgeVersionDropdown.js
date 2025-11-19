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

function BridgeVersionDropdown({ params, searchParams, isEmbedUser }) {
    const router = useRouter();
    const dispatch = useDispatch();
    const versionDescriptionRef = useRef('');
    const hasInitialized = useRef(false);
    const lastFetchedVersion = useRef(null);
    const isProcessing = useRef(false);
    const [showVersionDropdown, setShowVersionDropdown] = useState(false);
    const [maxVisibleVersions, setMaxVisibleVersions] = useState(4);
    const [selectedDataToDelete, setselectedDataToDelete] = useState();
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE.DELETE_VERSION_MODAL);
    const dropdownRef = useRef(null);

    const { bridgeVersionsArray, publishedVersion, bridgeName, versionDescription, bridgeVersionMapping } = useCustomSelector((state) => ({
        bridgeVersionsArray: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.versions || [],
        publishedVersion: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.published_version_id || null,
        bridgeName: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.name || "",
        versionDescription: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.get?.('version')]?.version_description || "",
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowVersionDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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

    // Helper function to get version display name
    const getVersionDisplayName = useCallback((version) => {
        if (version === publishedVersion) {
            return "Published";
        }
        // Get all non-published versions and find the index
        const nonPublishedVersions = bridgeVersionsArray.filter(v => v !== publishedVersion);
        const nonPublishedIndex = nonPublishedVersions.indexOf(version);
        return nonPublishedIndex >= 0 ? `V${nonPublishedIndex + 1}` : `V${bridgeVersionsArray.indexOf(version) + 1}`;
    }, [bridgeVersionsArray, publishedVersion]);

    // SendDataToChatbot effect - only runs when version changes
    useEffect(() => {
        const currentVersion = searchParams?.get?.('version');
        if (!currentVersion) return;

        const timer = setInterval(() => {
            if (typeof SendDataToChatbot !== 'undefined') {
                SendDataToChatbot({ "version_id": currentVersion });
                clearInterval(timer);
            }
        }, 300);

        return () => clearInterval(timer);
    }, [searchParams?.get?.('version')]);

    // Initialize version only once on mount or when versions become available
    useEffect(() => {
        if (hasInitialized.current) {
            return;
        }
        
        const currentVersion = searchParams?.get?.('version');
        
        
        // If no version in URL but we have versions available
        if (!currentVersion && (bridgeVersionsArray.length > 0 || publishedVersion)) {
            const defaultVersion = publishedVersion || bridgeVersionsArray[0];
            if (defaultVersion) {
                hasInitialized.current = true;
                // Only update URL, don't fetch yet - the next effect will handle fetching
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${defaultVersion}`);
            }
        }
        // If version exists in URL, fetch its data
        else if (currentVersion) {
            hasInitialized.current = true;
            fetchVersionData(currentVersion);
        }
    }, [bridgeVersionsArray.length, publishedVersion, searchParams?.get?.('version'), params.id, params.org_id, bridgeName]);

    const handleVersionChange = useCallback((version) => {
        const currentVersion = searchParams?.get?.('version');
        if (currentVersion === version) return;
        router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${version}`);
        fetchVersionData(version);
    }, [searchParams?.get?.('version'), params.org_id, params.id, router, fetchVersionData]);

    const handleCreateNewVersion = () => {
        // create new version
        const version_description_input = versionDescriptionRef?.current?.value;
        
        // Validate inputs
        if (!version_description_input || version_description_input.trim() === '') {
            alert("Please enter a version description");
            return;
        }
        
        if (!params.id || !params.org_id) {
            console.error("Missing required parameters:", { bridgeId: params.id, orgId: params.org_id });
            alert("Missing required parameters. Please refresh the page and try again.");
            return;
        }
        
        // Use current version, published version, or first available version as parent
        const currentVersion = searchParams?.get?.('version');
        const parentVersionId = currentVersion || publishedVersion || bridgeVersionsArray[0];
        
        if (!parentVersionId) {
            console.error("No parent version available for creating new version");
            alert("No parent version available. Please ensure there's at least one existing version.");
            return;
        }
        
      
        
        dispatch(createBridgeVersionAction({ 
            parentVersionId: parentVersionId, 
            bridgeId: params.id, 
            version_description: versionDescriptionRef?.current?.value, 
            orgId: params.org_id 
        }, (data) => {
            if (data && data.version_id) {
                isEmbedUser && sendDataToParent("updated", { name: bridgeName, agent_description: version_description_input, agent_id: params?.id, agent_version_id: data?.version_id }, "Agent Version Created Successfully")
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${data.version_id}`);
            } else {
                console.error("Version creation failed - no version_id returned:", data);
            }
        }, (error) => {
            console.error("Version creation failed:", error);
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
            const currentVersion = searchParams?.get?.('version');
            if (currentVersion === selectedDataToDelete?.version) {
                const remainingVersions = bridgeVersionsArray.filter(v => v !== selectedDataToDelete?.version);
                const nextVersion = publishedVersion && publishedVersion !== selectedDataToDelete?.version
                    ? publishedVersion
                    : remainingVersions[0];
                router.push(`/org/${params.org_id}/agents/configure/${params.id}?version=${nextVersion}`);
            }
            setselectedDataToDelete(null);
        });
    }, [bridgeVersionsArray, publishedVersion, searchParams?.get?.('version'), params, router, selectedDataToDelete, dispatch, executeDelete]);

    // Determine which versions to show with published version always on left
    const getVersionsToShow = () => {
        // Create array with published version first, then other versions
        const otherVersions = bridgeVersionsArray.filter(v => v !== publishedVersion);
        const orderedVersions = publishedVersion ? [publishedVersion, ...otherVersions] : bridgeVersionsArray;
        
        if (orderedVersions.length <= maxVisibleVersions) {
            return orderedVersions;
        }

        // Find the index of the currently active version in the ordered array
        const currentVersion = searchParams?.get?.('version');
        const activeIndex = orderedVersions.findIndex(version => version === currentVersion);

        if (activeIndex === -1) {
            // If no active version found, show first versions (published + others)
            return orderedVersions.slice(0, maxVisibleVersions);
        }

        // If published version exists, always include it
        if (publishedVersion) {
            if (activeIndex === 0) {
                // Active version is published, show published + next versions
                return orderedVersions.slice(0, maxVisibleVersions);
            } else {
                // Active version is not published, show published + versions around active
                const remainingSlots = maxVisibleVersions - 1; // Reserve 1 slot for published
                const sideCount = Math.floor((remainingSlots - 1) / 2);
                
                let startIndex = Math.max(1, activeIndex - sideCount); // Start from 1 to skip published
                let endIndex = Math.min(orderedVersions.length, activeIndex + sideCount + 1);
                
                // Adjust if we're near the end
                if (endIndex - startIndex < remainingSlots) {
                    if (endIndex === orderedVersions.length) {
                        startIndex = Math.max(1, orderedVersions.length - remainingSlots);
                    }
                }
                
                const selectedVersions = orderedVersions.slice(startIndex, endIndex);
                return [publishedVersion, ...selectedVersions];
            }
        }
        
        // Fallback to original logic if no published version
        return orderedVersions.slice(0, maxVisibleVersions);
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
                    const isActive = searchParams.get?.('version') === version;
                    const isPublished = version === publishedVersion;
                    const versionDisplayName = getVersionDisplayName(version);
                    const versionDesc = getVersionDescription(version);
                    const canDelete = bridgeVersionsArray.length > 1 && !isPublished;
                    return (
                        <div key={version} className="relative group">
                            <div className="tooltip tooltip-bottom" data-tip={versionDesc}>
                            <button
                                onClick={() => handleVersionChange(version)}
                                className={`
                                    flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-all duration-200 relative
                                    ${canDelete ? 'group-hover:pr-8' : ''}
                                    ${isActive
                                        ? (isPublished ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-base-300 text-base-content border border-base-300')
                                        : (isPublished ? 'bg-base-100 text-base-content hover:bg-green-50 hover:text-green-700 border border-base-300' : 'bg-base-100 text-base-content hover:bg-base-200')
                                    }
                                `}
                            >
                                <span>{versionDisplayName}</span>
                                {isPublished && (
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Published Version"></span>
                                )}
                                
                                {/* Info Icon - always visible */}
                                    <Info 
                                        size={12} 
                                        className="transition-opacity duration-200 cursor-help text-base-content/60"
                                    />
                            </button>
                                </div>

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

                {/* Version Dropdown */}
                {hasMoreVersions && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-base-100 text-base-content hover:bg-base-200 rounded-md transition-all duration-200"
                            title={`Show All Versions (${bridgeVersionsArray.length - versionsToShow.length} more)`}
                        >
                            <ChevronDown className="w-3 h-3" />
                            <span className="text-xs">+{bridgeVersionsArray.length - versionsToShow.length}</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showVersionDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-48 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                                <div className="p-2">
                                    <div className="text-xs font-medium text-base-content/70 mb-2 px-2">All Versions</div>
                                    {bridgeVersionsArray.map((version, index) => {
                                        const isActive = searchParams?.get?.('version') === version;
                                        const isPublished = version === publishedVersion;
                                        const versionDisplayName = getVersionDisplayName(version);
                                        const versionDesc = getVersionDescription(version);
                                        const canDelete = bridgeVersionsArray.length > 1 && !isPublished;

                                        return (
                                            <div key={version} className="relative group">
                                                <button
                                                    onClick={() => {
                                                        handleVersionChange(version);
                                                        setShowVersionDropdown(false);
                                                    }}
                                                    className={`
                                                        w-full flex items-center justify-between gap-2 px-2 py-2 text-xs rounded-md transition-all duration-200 text-left
                                                        ${isActive
                                                            ? (isPublished ? 'bg-green-100 text-green-800' : 'bg-base-300 text-base-content')
                                                            : (isPublished ? 'bg-base-100 hover:bg-green-50 text-base-content' : 'bg-base-100 hover:bg-base-200 text-base-content')
                                                        }
                                                    `}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{versionDisplayName}</span>
                                                        {isPublished && (
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" title="Published Version"></span>
                                                        )}
                                                        <span className="text-xs text-base-content/60 truncate max-w-24" title={versionDesc}>
                                                            {versionDesc}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Delete Button */}
                                                    {canDelete && (
                                                        <span
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setselectedDataToDelete({ version, index: versionDisplayName }); 
                                                                openModal(MODAL_TYPE?.DELETE_VERSION_MODAL);
                                                                setShowVersionDropdown(false);
                                                            }}
                                                            className="opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded p-1 transition-opacity duration-200 cursor-pointer"
                                                            title={`Delete ${versionDisplayName}`}
                                                        >
                                                            <TrashIcon size={10} className="text-red-500 hover:text-red-700" />
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Create New Version Button */}
                <button
                    onClick={() => openModal(MODAL_TYPE.VERSION_DESCRIPTION_MODAL)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-base-100 text-base-content  hover:bg-base-200 rounded-md transition-all duration-200"
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

export default Protected(BridgeVersionDropdown)