import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlertIcon, AddIcon, TrashIcon } from '@/components/Icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/knowledgeBaseModal';
import { truncate } from '@/components/historyPageComponents/assistFile';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import InfoTooltip from '@/components/InfoTooltip';
import { getAllKnowBaseDataAction } from '@/store/action/knowledgeBaseAction';
import DeleteModal from '@/components/UI/DeleteModal';
import useTutorialVideos from '@/hooks/useTutorialVideos';
import useDeleteOperation from '@/customHooks/useDeleteOperation';

const KnowledgebaseList = ({ params, searchParams }) => {
    // Use the tutorial videos hook
    const { getKnowledgeBaseVideo } = useTutorialVideos();

    const { knowledgeBaseData, knowbaseVersionData, isFirstKnowledgeBase, shouldToolsShow, model } = useCustomSelector((state) => {
        const user = state.userDetailsReducer.userDetails || []
        const modelReducer = state?.modelReducer?.serviceModels;
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id],
            knowbaseVersionData: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.doc_ids || [],
            isFirstKnowledgeBase: user?.meta?.onboarding?.knowledgeBase,
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
            model: modelName
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
                    className={`group flex items-center rounded-md border border-base-300 cursor-pointer bg-base-200 relative min-h-[44px] w-full overflow-hidden ${!item?.description ? 'border-red-600' : ''} hover:bg-base-300 transition-colors duration-200`}
                >
                    <div className="p-2 flex-1 flex items-center">
                        <div className="flex items-center gap-2 w-full">
                            {GetFileTypeIcon(item?.source?.data?.type || item.source?.type, 16, 16)}
                            {item?.name?.length > 24 ? (
                                <div className="tooltip tooltip-top min-w-0" data-tip={item?.name}>
                                    <span className="min-w-0 text-sm truncate">
                                        <span className="text-sm font-normal block w-full">{item?.name}</span>
                                    </span>
                                </div>
                            ) : (
                                <span className="min-w-0 text-sm truncate">
                                    <span className="text-sm font-normal block w-full">{item?.name}</span>
                                </span>
                            )}
                            {!item?.description && <CircleAlertIcon color='red' size={16} />}
                        </div>
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
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                </div>
            ) : null;
        }).filter(Boolean);

        return (
            <div className={`grid gap-2 w-full ${knowledgebaseItems.length === 1 ? 'grid-cols-2' : 'grid-cols-1'}`} style={{
                gridTemplateColumns: knowledgebaseItems.length === 1 ? 'repeat(2, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))'
            }}>
                {knowledgebaseItems}
                {/* Add empty div for spacing when only one item */}
                {knowledgebaseItems.length === 1 && <div></div>}
            </div>
        );
    }, [knowbaseVersionData, knowledgeBaseData]);
    return (
        <div className="label flex-col items-start w-full p-0">
            <div className="dropdown dropdown-right flex items-center">
                <div className='flex items-center w-full'>
                    {knowbaseVersionData?.length > 0 ? (
                        <>
                            <InfoTooltip tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
                                <p className="label-text mb-2 whitespace-nowrap font-medium info">KnowledgeBase</p>
                            </InfoTooltip>
                            <button
                                tabIndex={0}
                                className=" flex ml-4 items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                                disabled={!shouldToolsShow}
                            >
                                <AddIcon className="w-2 h-2" />
                                <span className="text-xs font-medium">Add</span>
                            </button>
                        </>
                    ) : (
                        <InfoTooltip tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
                            <button
                                tabIndex={0}
                                className="flex items-center gap-1 px-3 py-1 mt-2 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2"
                                disabled={!shouldToolsShow}
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