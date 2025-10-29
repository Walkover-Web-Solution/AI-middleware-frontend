import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlertIcon, AddIcon, EllipsisVerticalIcon, TrashIcon } from '@/components/Icons';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { closeModal, GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE, ONBOARDING_VIDEOS } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/knowledgeBaseModal';
import { truncate } from '@/components/historyPageComponents/assistFile';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import { InfoIcon } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import { getAllKnowBaseDataAction } from '@/store/action/knowledgeBaseAction';
import DeleteModal from '@/components/UI/DeleteModal';

const KnowledgebaseList = ({ params, searchParams }) => {
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
    const handleDeleteKnowledgebase = (item) => {
        dispatch(updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: { doc_ids: knowbaseVersionData.filter(docId => docId !== item?._id) }
        }));
         closeModal(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    };
    const handleOpenDeleteModal = (item) => {
        setSelectedKnowledgebase(item);
        openModal(MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL);
    };
    const handleTutorial = () => {
        setTutorialState(prev => ({
            ...prev,
            showSuggestion: isFirstKnowledgeBase
        }))
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

    const renderKnowledgebase = useMemo(() => (
        (Array.isArray(knowbaseVersionData) ? knowbaseVersionData : [])?.map((docId) => {
            const item = knowledgeBaseData?.find(kb => kb._id === docId);
            return item ? (
                <div
                    key={docId}
                    className={`group flex w-full flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${!item?.description ? 'border-red-600' : ''} hover:bg-base-200 transition-colors duration-200`}
                >
                    <div className="p-2 w-full h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                {GetFileTypeIcon(item?.source?.data?.type || item.source?.type, 16, 16)}
                                <span className="flex-1 min-w-0 text-[9px] md:text-[12px] lg:text-[13px] font-bold truncate">
                                    <div className="tooltip" data-tip={item?.name?.length > 24 ? item?.name : ''}>
                                        <span>{item?.name?.length > 50 ? `${item?.name.slice(0, 50)}...` : item?.name}</span>
                                        <span className={`shrink-0 inline-block rounded-full capitalize px-2 py-0 text-[10px] ml-2 font-medium border ${!item?.description ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                            {!item?.description ? 'Description Required' : 'Active'}
                                        </span>
                                    </div>
                                </span>
                                {!item?.description && <CircleAlertIcon color='red' size={16} />}
                            </div>
                            <p className="mt-1 text-[11px] sm:text-xs text-base-content/70 line-clamp-1">
                                {item?.description || 'A description is required for proper functionality.'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Remove button that appears on hover */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                               handleOpenDeleteModal(item);
                            }}
                            className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-error"
                            title="Remove"
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                </div>
            ) : null;
        })
    ), [knowbaseVersionData, knowledgeBaseData]);
    return (
        <div className="label flex-col items-start w-full p-0">
            <div className="dropdown dropdown-right flex items-center">
                <div className='flex items-center w-full'>
                    {knowbaseVersionData?.length > 0 ? (
                        <>
                            <InfoTooltip  tooltipContent="A Knowledge Base stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it's easy to update.">
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
                    <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.knowledgeBase} flagKey={"knowledgeBase"} />
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
            <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedKnowledgebase} name="knowledgebase" title="Are you sure?" description="This action Remove the selected Knowledgebase from the Agent." buttonTitle="Remove" modalType={MODAL_TYPE?.DELETE_KNOWLEDGE_BASE_MODAL} />
            <KnowledgeBaseModal params={params} searchParams={searchParams} knowbaseVersionData={knowbaseVersionData} addToVersion={true} />
        </div>
    );
};

export default KnowledgebaseList;