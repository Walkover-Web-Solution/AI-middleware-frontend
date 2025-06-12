import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlertIcon, AddIcon, TrashIcon } from '@/components/Icons';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE, ONBOARDING_VIDEOS } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/knowledgeBaseModal';
import GoogleDocIcon from '@/icons/GoogleDocIcon';
import { truncate } from '@/components/historyPageComponents/assistFile';
import OnBoarding from '@/components/OnBoarding';
import InfoModel from '@/components/infoModel';

const KnowledgebaseList = ({ params }) => {
    const { knowledgeBaseData, knowbaseVersionData, isFirstKnowledgeBase, } = useCustomSelector((state) => {
        const user = state.userDetailsReducer.userDetails||[]
        return {
            knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id],
            knowbaseVersionData: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.doc_ids,
            isFirstKnowledgeBase: user?.meta?.onboarding?.knowledgeBase,
        };
    });


    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    const [showTutorial, setShowTutorial] = useState(false);
    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };
    const handleAddKnowledgebase = (id) => {
        if (knowbaseVersionData?.includes(id)) return; // Check if ID already exists
        dispatch(updateBridgeVersionAction({
            versionId: params.version,
            dataToSend: { doc_ids: [...(knowbaseVersionData || []), id] }
        }));
    };
    const handleDeleteKnowledgebase = (id) => {
        dispatch(updateBridgeVersionAction({
            versionId: params.version,
            dataToSend: { doc_ids: knowbaseVersionData.filter(docId => docId !== id) }
        }));
    };

    const handleTutorial = () => {
        setShowTutorial(isFirstKnowledgeBase);
    };

    const renderKnowledgebase = useMemo(() => (
        (Array.isArray(knowbaseVersionData) ? knowbaseVersionData : [])?.map((docId) => {
            const item = knowledgeBaseData?.find(kb => kb._id === docId);
            return item ? (
                <div key={docId} className="flex w-[250px] flex-col items-start rounded-md border cursor-pointer bg-base-100 hover:bg-base-200 relative">
                    <div className="p-4 w-full h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {GetFileTypeIcon(item?.type, 24, 24)}
                                    <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content pr-5">
                                        {item?.name}
                                    </h1>
                                </div>
                                <div className="flex gap-2 absolute top-2 right-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteKnowledgebase(item?._id);
                                        }}
                                        className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-red-600"
                                    >
                                        <TrashIcon size={16} />
                                    </button>
                                    {!item?.description && <CircleAlertIcon color='red' size={16} />}
                                </div>
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                {item?.description || "A description is required for proper functionality."}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null;
        })
    ), [knowbaseVersionData, knowledgeBaseData]);

    return (
        <div className="label flex-col items-start p-0">
            <div className="flex flex-wrap gap-4 mb-4">
                {renderKnowledgebase}
            </div>
                 <InfoModel tooltipContent={"A knowledgebase stores helpful info like docs and FAQs. Agents use it to give accurate answers without hardcoding, and it’s easy to update."}>
                        <p className=" label-text info mb-2">Knowledgebase Configuration</p>
                 </InfoModel>
            <div className="dropdown dropdown-right">
                
                       
                <button tabIndex={0} className="btn btn-outline btn-sm mt-0" onClick={() => handleTutorial()}>
                    <AddIcon size={16} />Connect Knowledgebase
                </button>
                {showTutorial && (
                    <OnBoarding setShowTutorial={setShowTutorial} video={ONBOARDING_VIDEOS.knowledgeBase} flagKey={"knowledgeBase"} />
                )}
                {!showTutorial && (
                    <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-[9999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                        <div className='flex flex-col gap-2 w-full'>
                            <li className="text-sm font-semibold disabled">Suggested Knowledgebases</li>
                            <input
                                type='text'
                                placeholder='Search Knowledgebase'
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
                                                {GetFileTypeIcon(item?.type, 16, 16)}
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
                            <li className="mt-2 border-t w-full sticky bottom-0 bg-white py-2" onClick={() => { openModal(MODAL_TYPE.KNOWLEDGE_BASE_MODAL) }}>
                                <div>
                                    <AddIcon size={16} /><p className='font-semibold'>Add new Knowledgebase</p>
                                </div>
                            </li>
                        </div>
                    </ul>
                )}
            </div>
            <KnowledgeBaseModal params={params} />
        </div>
    );
};

export default KnowledgebaseList;
