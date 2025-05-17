import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlert, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import KnowledgeBaseModal from '@/components/modals/knowledgeBaseModal';
import GoogleDocIcon from '@/icons/GoogleDocIcon';
import { truncate } from '@/components/historyPageComponents/assistFile';
import { updateOrgDetails } from '@/store/action/orgAction';

const KnowledgebaseList = ({ params }) => {
    const { knowledgeBaseData, knowbaseVersionData } = useCustomSelector((state) => ({
        knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id],
        knowbaseVersionData: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.doc_ids,
    }));

    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');
    
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
  const orgId = params.org_id;
  
  const isFirstKnowledgeBase = useCustomSelector(
    (state) =>
      state.userDetailsReducer.userDetails?.c_companies?.find(
        (c) => c.id === Number(orgId)
      )?.meta?.onboarding.ServiceSelection
  );
  const [showTutorial, setShowTutorial] = useState(false);

  const currentOrg = useCustomSelector((state) =>
    state.userDetailsReducer.userDetails?.c_companies?.find(
      (c) => c.id === Number(orgId)
    )
  );
  
  const handleTutorial = () => {
    
    setShowTutorial(isFirstKnowledgeBase);
  };
  const handleVideoEnd = async () => {
    try {
      setShowTutorial(false);

      const updatedOrgDetails = {
        ...currentOrg,
        meta: {
          ...currentOrg?.meta,
          onboarding: {
            ...currentOrg?.meta?.onboarding,
            ServiceSelection: false,
          },
        },
      };

      await dispatch(updateOrgDetails(orgId, updatedOrgDetails));
    } catch (error) {
      console.error("Failed to update full organization:", error);
    }
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
                                        <Trash2 size={16} />
                                    </button>
                                    {!item?.description && <CircleAlert color='red' size={16} />}
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
            <div className="dropdown dropdown-right">
                <button tabIndex={0} className="btn btn-outline btn-sm mt-0" onClick={()=>handleTutorial()}>
                    <Plus size={16} />Add Knowledgebase
                </button>
                {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <button
            onClick={() => handleVideoEnd()}
            className="absolute top-4 right-4 text-white text-4xl hover:text-red-500 z-50"
            aria-label="Close Tutorial"
          >
            &times;
          </button>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              position: "relative",
              boxSizing: "content-box",
              maxHeight: "80vh",
              width: "100%",
              aspectRatio: "1.935483870967742",
              padding: "40px 0",
            }}
          >
            <iframe
              src="https://video-faq.viasocket.com/embed/cm9tl9dpo0oeh11m7dz1bipq5?embed_v=2"
              loading="lazy"
              title="AI-middleware"
              allow="clipboard-write"
              frameBorder="0"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              className="rounded-xl"
            />
          </div>
        </div>
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
                                <Plus size={16} /><p className='font-semibold'>Add new Knowledgebase</p>
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
