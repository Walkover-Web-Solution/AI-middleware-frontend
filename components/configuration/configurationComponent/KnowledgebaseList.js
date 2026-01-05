import { useCustomSelector } from '@/customHooks/customSelector';
import { AddIcon, TrashIcon, DatabaseIcon, ChevronRightIcon } from '@/components/Icons';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/KnowledgeBaseModal';
import { truncate } from '@/components/historyPageComponents/AssistFile';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/TutorialSuggestoinToast';
import InfoTooltip from '@/components/InfoTooltip';
import { getAllKnowBaseDataAction, getCollectionsAction, getResourcesForCollectionAction } from '@/store/action/knowledgeBaseAction';
import DeleteModal from '@/components/UI/DeleteModal';
import useTutorialVideos from '@/hooks/useTutorialVideos';
import useDeleteOperation from '@/customHooks/useDeleteOperation';
import { CircleQuestionMark } from 'lucide-react';

const KnowledgebaseList = ({ params, searchParams, isPublished, isEditor = true }) => {
    // Determine if content is read-only (either published or user is not an editor)
    const isReadOnly = isPublished || !isEditor;
    // Use the tutorial videos hook
    const { getKnowledgeBaseVideo } = useTutorialVideos();

    const { knowbaseVersionData, collections, resourcesByCollection, shouldToolsShow } = useCustomSelector((state) => {
        const modelReducer = state?.modelReducer?.serviceModels;
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
        
        
        // Use bridgeData when isPublished=true, otherwise use versionData
        const activeData = isPublished ? bridgeDataFromState : versionData;
        const serviceName = activeData?.service;
        const modelTypeName = activeData?.configuration?.type?.toLowerCase();
        const modelName = activeData?.configuration?.model;
        
        return {
            // Support both old doc_ids format and new knowledge_base format
            knowbaseVersionData: isPublished 
                ? (bridgeDataFromState?.knowledge_base || bridgeDataFromState?.doc_ids || []) 
                : (versionData?.knowledge_base || versionData?.doc_ids || []),
            collections: state?.knowledgeBaseReducer?.collections || [],
            resourcesByCollection: state?.knowledgeBaseReducer?.resourcesByCollection || {},
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
        };
    });
    const [selectedKnowledgebase, setSelectedKnowledgebase] = useState(null);
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCollections, setExpandedCollections] = useState({});
    const [expandedDropdownCollections, setExpandedDropdownCollections] = useState({});
    
    // Toggle collection expansion in dropdown
    const toggleDropdownCollection = (collectionId) => {
        setExpandedDropdownCollections(prev => {
            const newState = {
                ...prev,
                [collectionId]: !prev[collectionId]
            };
            
            // Only fetch resources when expanding (not when collapsing)
            if (!prev[collectionId]) {
                dispatch(getResourcesForCollectionAction(collectionId));
            }
            
            return newState;
        });
    };
    const [tutorialState, setTutorialState] = useState({
        showTutorial: false,
        showSuggestion: false
    });
    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };
    // Handle adding collection or resource
    const handleAddKnowledgebase = (item, type = 'collection') => {
        const currentKnowledgeBase = Array.isArray(knowbaseVersionData) ? knowbaseVersionData : [];
        
        if (type === 'collection') {
            // Check if collection already exists
            const exists = currentKnowledgeBase.some(kb => 
                kb.collection_id === item.collection_id
            );
            if (exists) return;
            
            // Add entire collection
            const newEntry = {
                collection_id: item.collection_id,
                resource_ids: item.resource_ids || []
            };
            
            dispatch(updateBridgeVersionAction({
                versionId: searchParams?.version,
                dataToSend: { knowledge_base: [...currentKnowledgeBase, newEntry] }
            }));
        } else if (type === 'resource') {
            // Add specific resource to collection
            const updatedKnowledgeBase = [...currentKnowledgeBase];
            const collectionIndex = updatedKnowledgeBase.findIndex(kb => 
                kb.collection_id === item.collection_id
            );
            
            if (collectionIndex >= 0) {
                // Collection exists, add resource if not already present
                const resourceIds = updatedKnowledgeBase[collectionIndex].resource_ids || [];
                if (!resourceIds.includes(item.resource_id)) {
                    updatedKnowledgeBase[collectionIndex].resource_ids = [...resourceIds, item.resource_id];
                }
            } else {
                // Collection doesn't exist, create new entry
                updatedKnowledgeBase.push({
                    collection_id: item.collection_id,
                    resource_ids: [item.resource_id]
                });
            }
            
            dispatch(updateBridgeVersionAction({
                versionId: searchParams?.version,
                dataToSend: { knowledge_base: updatedKnowledgeBase }
            }));
        }
        
        // Close dropdown after selection
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document.activeElement?.blur?.();
            }
        }, 0);
    };
    const handleDeleteKnowledgebase = async (item, type = 'collection') => {
        await executeDelete(async () => {
            const currentKnowledgeBase = Array.isArray(knowbaseVersionData) ? knowbaseVersionData : [];
            
            if (type === 'collection') {
                // Remove entire collection
                const updatedKnowledgeBase = currentKnowledgeBase.filter(kb => 
                    kb.collection_id !== item.collection_id
                );
                
                return dispatch(updateBridgeVersionAction({
                    versionId: searchParams?.version,
                    dataToSend: { knowledge_base: updatedKnowledgeBase }
                }));
            } else if (type === 'resource') {
                // Remove specific resource from collection
                const updatedKnowledgeBase = currentKnowledgeBase.map(kb => {
                    if (kb.collection_id === item.collection_id) {
                        const updatedResourceIds = (kb.resource_ids || []).filter(id => id !== item.resource_id);
                        return {
                            ...kb,
                            resource_ids: updatedResourceIds
                        };
                    }
                    return kb;
                }).filter(kb => (kb.resource_ids || []).length > 0); // Remove collections with no resources
                
                return dispatch(updateBridgeVersionAction({
                    versionId: searchParams?.version,
                    dataToSend: { knowledge_base: updatedKnowledgeBase }
                }));
            }
        });
    };
    const handleOpenDeleteModal = (item) => {
        setSelectedKnowledgebase(item);
        openModal(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    };

    useEffect(() => {
        // Fetch collections on component mount
        dispatch(getCollectionsAction());
        
        const handleMessage = (e) => {
            if (e.data?.type === 'rag') {
                if (e.data?.status == "create") {
                    dispatch(getAllKnowBaseDataAction(params.org_id));
                    dispatch(getCollectionsAction());
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [params.org_id, dispatch]);


    // Get resources for collection when expanded
    const getResourcesForCollection = (collectionId) => {
        if (!resourcesByCollection[collectionId]) {
            dispatch(getResourcesForCollectionAction(collectionId));
        }
        return resourcesByCollection[collectionId] || [];
    };

    // Toggle collection expansion
    const toggleCollectionExpansion = (collectionId) => {
        setExpandedCollections(prev => ({
            ...prev,
            [collectionId]: !prev[collectionId]
        }));
        
        if (!expandedCollections[collectionId]) {
            getResourcesForCollection(collectionId);
        }
    };

    const hasKnowledgeBase = Array.isArray(knowbaseVersionData) && knowbaseVersionData.length > 0;

    const renderAddDropdown = () => (
        <div className="dropdown dropdown-end w-full flex justify-center">
            <button
                tabIndex={0}
                className="flex items-center justify-center gap-2 px-2 py-2 mx-auto text-base-content/60 hover:text-base-content cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                disabled={!shouldToolsShow || isReadOnly}
            >
                <AddIcon className="w-4 h-4" />
                <span className="text-sm">Add</span>
            </button>
            <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high px-2 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                <div className='flex flex-col gap-1 w-full'>
                    <li className="text-xs font-semibold disabled py-1">Available Knowledge Bases</li>
                    <input
                        type='text'
                        placeholder='Search Knowledge Base'
                        value={searchQuery}
                        onChange={handleInputChange}
                        className='input input-bordered w-full input-xs text-xs'
                    />
                    <div className="text-xs text-base-content/60 mb-1 px-1">Expand collections to see individual resources</div>
                    {collections
                        .filter(collection =>
                            collection?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
                        )
                        .map(collection => {
                            const isCollectionConnected = Array.isArray(knowbaseVersionData) && 
                                knowbaseVersionData.some(kb => kb.collection_id === collection.collection_id);
                            const isExpanded = expandedDropdownCollections[collection.collection_id];
                            const resources = resourcesByCollection[collection.collection_id] || [];
                            
                            return (
                                <div key={collection.collection_id} className="mb-1">
                                    {/* Collection Header */}
                                    <li className="hover:bg-base-300/30 rounded px-1 py-0.5">
                                        <div className="flex items-center justify-between w-full">
                                            <div className="flex items-center gap-2 flex-1">
                                                {/* Chevron Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleDropdownCollection(collection.collection_id);
                                                    }}
                                                    className="p-0.5 hover:bg-base-300 rounded transition-colors"
                                                >
                                                    <ChevronRightIcon 
                                                        size={10} 
                                                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                    />
                                                </button>
                                                
                                                {/* Collection Info */}
                                                <div className="flex items-center gap-1 flex-1">
                                                    <DatabaseIcon size={12} className="text-base-content" />
                                                    <div className="flex-1">
                                                        <div className="text-xs font-medium leading-tight">
                                                            {collection.name.length > 20 ? (
                                                                <div className="tooltip" data-tip={collection.name}>
                                                                    {truncate(collection.name, 20)}
                                                                </div>
                                                            ) : (
                                                                collection.name
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-base-content/60 leading-tight">
                                                            {collection.resource_ids?.length || 0} resources
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Add All Collection Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isCollectionConnected) {
                                                        handleAddKnowledgebase(collection, 'collection');
                                                    }
                                                }}
                                                className={`px-1.5 py-0.5 rounded text-xs ${
                                                    isCollectionConnected 
                                                        ? 'text-base-content bg-base-300 cursor-not-allowed' 
                                                        : 'text-base-content hover:bg-base-200 cursor-pointer'
                                                }`}
                                                disabled={isCollectionConnected}
                                            >
                                                {isCollectionConnected ? '✓ All' : '+ All'}
                                            </button>
                                        </div>
                                    </li>
                                    
                                    {/* Expanded Resources */}
                                    {isExpanded && (
                                        <div className="ml-4 mt-0.5 space-y-0.5">
                                            {resources.length === 0 ? (
                                                <div className="text-xs text-base-content/60 py-1 px-1">
                                                    Loading resources...
                                                </div>
                                            ) : (
                                                resources
                                                    .filter(resource =>
                                                        resource?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                                                        resource?.url?.toLowerCase()?.includes(searchQuery?.toLowerCase())
                                                    )
                                                    .map(resource => {
                                                        const isResourceConnected = Array.isArray(knowbaseVersionData) && 
                                                            knowbaseVersionData.some(kb => 
                                                                kb.collection_id === collection.collection_id &&
                                                                kb.resource_ids?.includes(resource._id)
                                                            );
                                                        
                                                        return (
                                                            <li key={resource._id}
                                                                onClick={() => !isResourceConnected && handleAddKnowledgebase({
                                                                    collection_id: collection.collection_id,
                                                                    resource_id: resource._id
                                                                }, 'resource')}
                                                                className={`${isResourceConnected ? 'opacity-50 cursor-not-allowed' : 'hover:bg-base-200 cursor-pointer'} rounded px-1 py-0.5`}
                                                            >
                                                                <div className="flex justify-between items-center w-full">
                                                                    <div className="flex items-center gap-1 flex-1">
                                                                        {GetFileTypeIcon('document', 10, 10)}
                                                                        <div className="flex-1">
                                                                            <div className="text-xs font-medium leading-tight">
                                                                                {(resource.title || 'Untitled').length > 25 ? (
                                                                                    <div className="tooltip" data-tip={resource.title || 'Untitled'}>
                                                                                        {truncate(resource.title || 'Untitled', 25)}
                                                                                    </div>
                                                                                ) : (
                                                                                    resource.title || 'Untitled'
                                                                                )}
                                                                            </div>
                                                                            {resource.url && (
                                                                                <div className="text-xs text-base-content/50 truncate max-w-[180px] leading-tight">
                                                                                    {resource.url}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {isResourceConnected ? (
                                                                        <span className="text-xs text-base-content">✓</span>
                                                                    ) : (
                                                                        <span className="text-xs text-base-content">+</span>
                                                                    )}
                                                                </div>
                                                            </li>
                                                        );
                                                    })
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    }
                    <li className="py-2 border-t border-base-300 w-full sticky bottom-0 bg-base-100 hover:bg-base-200" onClick={() => { if (window.openRag) { window.openRag() } else { openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL) }; if (typeof document !== 'undefined') { document.activeElement?.blur?.(); } }}>
                        <div className="flex items-center gap-1 justify-center text-base-content">
                            <AddIcon size={14} />
                            <p className='font-semibold text-xs'>Create New Collection</p>
                        </div>
                    </li>
                </div>
            </ul>
        </div>
    );
    return (
        <div className="w-full gap-3 flex flex-col px-2 py-2 cursor-default">
            <div className="flex items-center gap-2">
                <p className="text-sm whitespace-nowrap">Knowledge Base</p>
                <InfoTooltip tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
                    <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                </InfoTooltip>
            </div>
            {tutorialState?.showSuggestion && (
                <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"knowledgeBase"} TutorialDetails={"KnowledgeBase Configuration"} />
            )}
            {tutorialState?.showTutorial && (
                <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={getKnowledgeBaseVideo()} flagKey={"knowledgeBase"} />
            )}

            <div className="flex flex-col gap-3 w-full border-2 border-base-300 border-dashed rounded-lg p-4 min-h-[220px]">
                <div className="flex-1 flex flex-col gap-2 w-full">
                    {!hasKnowledgeBase ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-base-content/60 text-center gap-2">
                            <p className="text-sm">No knowledge base found.</p>
                        </div>
                    ) : null}

                    {hasKnowledgeBase && (
                        <div className="flex flex-col gap-2 w-full">
                            {knowbaseVersionData.map((kbEntry, index) => {
                                const collection = collections.find(c => c.collection_id === kbEntry.collection_id);
                                const isExpanded = expandedCollections[kbEntry.collection_id];
                                const resources = resourcesByCollection[kbEntry.collection_id] || [];
                                const connectedResources = resources.filter(resource =>
                                    kbEntry.resource_ids?.includes(resource._id)
                                );
                                
                                return (
                                    <div key={`${kbEntry.collection_id}-${index}`} className="border border-base-300 rounded-lg p-3 bg-base-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 flex-1">
                                                <button
                                                    onClick={() => toggleCollectionExpansion(kbEntry.collection_id)}
                                                    className="p-1 hover:bg-base-200 rounded transition-colors"
                                                >
                                                    <ChevronRightIcon 
                                                        size={12} 
                                                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                    />
                                                </button>
                                                <DatabaseIcon size={16} className="text-base-content" />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium">
                                                        {collection?.name || 'Unknown Collection'}
                                                    </div>
                                                    <div className="text-xs text-base-content/60">
                                                        {connectedResources.length} of {collection?.resource_ids?.length || 0} resources connected
                                                    </div>
                                                </div>
                                            </div>
                                            {!isReadOnly && (
                                                <button
                                                    onClick={() => handleOpenDeleteModal({ collection_id: kbEntry.collection_id, type: 'collection' })}
                                                    className="p-1 hover:bg-base-200 rounded transition-colors text-base-content/60 hover:text-base-content"
                                                >
                                                    <TrashIcon size={14} />
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Expanded Resources */}
                                        {isExpanded && (
                                            <div className="mt-3 ml-6 space-y-2">
                                                {connectedResources.length === 0 ? (
                                                    <div className="text-xs text-base-content/60">No resources connected from this collection</div>
                                                ) : (
                                                    connectedResources.map(resource => (
                                                        <div key={resource._id} className="flex items-center justify-between p-2 bg-base-200/50 rounded">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                {GetFileTypeIcon('document', 12, 12)}
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-medium">
                                                                        {resource.title || 'Untitled'}
                                                                    </div>
                                                                    {resource.url && (
                                                                        <div className="text-xs text-base-content/50 truncate">
                                                                            {resource.url}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {!isReadOnly && (
                                                                <button
                                                                    onClick={() => handleOpenDeleteModal({
                                                                        collection_id: kbEntry.collection_id,
                                                                        resource_id: resource._id,
                                                                        type: 'resource'
                                                                    })}
                                                                    className="p-1 hover:bg-base-300 rounded transition-colors text-base-content/60 hover:text-base-content"
                                                                >
                                                                    <TrashIcon size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {renderAddDropdown()}
            </div>
            <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedKnowledgebase} name="knowledgebase" title="Are you sure?" description="This action Remove the selected Knowledgebase from the Agent." buttonTitle="Remove" modalType={MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL} loading={isDeleting} isAsync={true} />
            <KnowledgeBaseModal params={params} searchParams={searchParams} knowbaseVersionData={knowbaseVersionData} addToVersion={true} />
        </div>
    );
};

export default KnowledgebaseList;
