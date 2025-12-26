import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlertIcon, AddIcon, TrashIcon } from '@/components/Icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/KnowledgeBaseModal';
import { truncate } from '@/components/historyPageComponents/AssistFile';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/TutorialSuggestoinToast';
import InfoTooltip from '@/components/InfoTooltip';
import { getAllKnowBaseDataAction } from '@/store/action/knowledgeBaseAction';
import DeleteModal from '@/components/UI/DeleteModal';
import useTutorialVideos from '@/hooks/useTutorialVideos';
import useDeleteOperation from '@/customHooks/useDeleteOperation';
import { CircleQuestionMark } from 'lucide-react';

const KnowledgebaseList = ({ params, searchParams, isPublished, isEditor = true }) => {
    // Determine if content is read-only (either published or user is not an editor)
    const isReadOnly = isPublished || !isEditor;
    // Use the tutorial videos hook
    const { getKnowledgeBaseVideo } = useTutorialVideos();

    const { knowledgeBaseData, knowbaseVersionData, shouldToolsShow } = useCustomSelector((state) => {
        const modelReducer = state?.modelReducer?.serviceModels;
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
        
        
        // Use bridgeData when isPublished=true, otherwise use versionData
        const activeData = isPublished ? bridgeDataFromState : versionData;
        const serviceName = activeData?.service;
        const modelTypeName = activeData?.configuration?.type?.toLowerCase();
        const modelName = activeData?.configuration?.model;
        
        return {
            knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id],
            knowbaseVersionData: isPublished ? (bridgeDataFromState?.doc_ids || []) : (versionData?.doc_ids || []),
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
        };
    });
    const [selectedKnowledgebase, setSelectedKnowledgebase] = useState(null);
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [tutorialState, setTutorialState] = useState({
        showTutorial: false,
        showSuggestion: false
    });
    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };
    const handleAddKnowledgebase = (id) => {
        if (knowbaseVersionData?.includes(id)) return; // Check if ID already exists
        dispatch(updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: { doc_ids: [...(knowbaseVersionData || []), id] }
        }));
        // Close dropdown after selection
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document.activeElement?.blur?.();
            }
        }, 0);
    };
    const handleDeleteKnowledgebase = async (item) => {
        await executeDelete(async () => {
            return dispatch(updateBridgeVersionAction({
                versionId: searchParams?.version,
                dataToSend: { doc_ids: knowbaseVersionData.filter(docId => docId !== item?._id) }
            }));
        });
    };
    const handleOpenDeleteModal = (item) => {
        setSelectedKnowledgebase(item);
        openModal(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    };

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.data?.type === 'rag') {
                if (e.data?.status == "create") {
                    dispatch(getAllKnowBaseDataAction(params.org_id));
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [params.org_id]);

    const renderKnowledgebase = useMemo(() => {
        const knowledgebaseItems = (Array.isArray(knowbaseVersionData) ? knowbaseVersionData : [])?.map((docId) => {
            const item = knowledgeBaseData?.find(kb => kb._id === docId);
            return item ? (
                <div
                    key={docId}
                    className={`group flex items-center rounded-md border border-base-300 cursor-pointer bg-base-200 relative min-h-[44px] w-full ${item?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-300 transition-colors duration-200`}
                >
                    <div className="flex items-center gap-2 w-full ml-2">
                        {GetFileTypeIcon(item?.source?.data?.type || item.source?.type, 16, 16)}
                        <div className="flex items-center gap-2 w-full">
                            {item?.name?.length > 24 ? (
                                <div className="tooltip tooltip-top min-w-0" data-tip={item?.name}>
                                    <span className="min-w-0 text-sm truncate text-left">
                                            <span className="truncate text-sm font-normal block w-[300px]">{item?.name}</span>
                                        </span>
                                    </div>
                                ) : (
                                    <span className="min-w-0 text-sm truncate text-left">
                                        <span className="truncate text-sm font-normal block w-[300px]">{item?.name}</span>
                                    </span>
                                )}
                            </div>
                            {!item?.description && <CircleAlertIcon color='red' size={16} />}
                        </div>

                    {/* Remove button that appears on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 pr-2 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(item);
                            }}
                            className="btn btn-ghost btn-sm p-1 hover:bg-red-100 hover:text-error"
                            title="Remove"
                            disabled={isReadOnly}
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                </div>
            ) : null;
        }).filter(Boolean);

        return (
            <div className={`grid gap-2 w-full`}>
                {knowledgebaseItems}
            </div>
        );
    }, [knowbaseVersionData, knowledgeBaseData]);
    return (
        <div className="label max-w-md flex-col items-start w-full p-0">
            <div className="dropdown dropdown-right flex items-center">
                <div className='flex items-center w-full'>
                    {knowbaseVersionData?.length > 0 ? (
                        <>
                            <div className="flex items-center gap-1 mb-2">
                                <p className="whitespace-nowrap font-medium">KnowledgeBase</p>
                                <InfoTooltip tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
                                    <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                                </InfoTooltip>
                            </div>
                            <button

                                tabIndex={0}
                                className=" flex ml-4 items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!shouldToolsShow || isReadOnly}
                            >
                                <AddIcon className="w-2 h-2" />
                                <span className="text-xs font-medium">Add</span>
                            </button>
                        </>
                    ) : (
                        <InfoTooltip tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
                            <button
                                tabIndex={0}
                                className="flex items-center gap-1 px-3 py-1 mt-2 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!shouldToolsShow || isReadOnly}
                            >
                                <AddIcon className="w-2 h-2" />
                                <span className="text-sm font-medium">Knowledge Base</span>
                            </button>
                        </InfoTooltip>

                    )}
                </div>
                {tutorialState?.showSuggestion && (
                    <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"knowledgeBase"} TutorialDetails={"KnowledgeBase Configuration"} />
                )}
                {tutorialState?.showTutorial && (
                    <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={getKnowledgeBaseVideo()} flagKey={"knowledgeBase"} />
                )}
                {!tutorialState?.showTutorial && (
                    <div className="dropdown dropdown-left mt-8">
                        <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">                        <div className='flex flex-col gap-2 w-full'>
                            <li className="text-sm font-semibold disabled">Suggested Knowledge Bases</li>
                            <input
                                type='text'
                                placeholder='Search Knowledge Base'
                                value={searchQuery}
                                onChange={handleInputChange}
                                className='input input-bordered w-full input-sm'
                            />
                            {(Array.isArray(knowledgeBaseData) ? knowledgeBaseData : [])
                                .filter(item =>
                                    item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) &&
                                    !knowbaseVersionData?.includes(item?._id)
                                )
                                .map(item => (
                                    <li key={item?._id} onClick={() => handleAddKnowledgebase(item?._id)}>
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-2">
                                                {GetFileTypeIcon(item?.source?.data?.type || item.source?.type, 16, 16)}
                                                {item?.name.length > 20 ? (
                                                    <div className="tooltip" data-tip={item?.name}>
                                                        {truncate(item?.name, 20)}
                                                    </div>
                                                ) : (
                                                    truncate(item?.name, 20)
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                            <li className="py-2 border-t border-base-300 w-full sticky bottom-0 bg-base-100" onClick={() => { if (window.openRag) { window.openRag() } else { openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL) }; if (typeof document !== 'undefined') { document.activeElement?.blur?.(); } }}>
                                <div>
                                    <AddIcon size={16} /><p className='font-semibold'>Add new Knowledge Base</p>
                                </div>
                            </li>
                        </div>
                        </ul>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-2 w-full ">
                {renderKnowledgebase}
            </div>
            <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedKnowledgebase} name="knowledgebase" title="Are you sure?" description="This action Remove the selected Knowledgebase from the Agent." buttonTitle="Remove" modalType={MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL} loading={isDeleting} isAsync={true} />
            <KnowledgeBaseModal params={params} searchParams={searchParams} knowbaseVersionData={knowbaseVersionData} addToVersion={true} />
        </div>
    );
};

export default KnowledgebaseList;
