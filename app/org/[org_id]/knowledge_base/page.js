'use client';
import CustomTable from "@/components/customTable/customTable";
import { truncate } from "@/components/historyPageComponents/assistFile";
import MainLayout from "@/components/layoutComponents/MainLayout";
import KnowledgeBaseModal from "@/components/modals/knowledgeBaseModal";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteKnowBaseDataAction, getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { KNOWLEDGE_BASE_COLUMNS, MODAL_TYPE } from "@/utils/enums";
import { closeModal, GetFileTypeIcon, openModal } from "@/utils/utility";
import { SquarePenIcon, TrashIcon } from "@/components/Icons";
import React, { useEffect, useState, use } from 'react';
import { useDispatch } from "react-redux";
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";

export const runtime = 'edge';

const Page = ({ params }) => {
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const knowledgeBaseData = useCustomSelector((state) => state?.knowledgeBaseReducer?.knowledgeBaseData?.[resolvedParams?.org_id]) || [];
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState();
  const [filterKnowledgeBase, setFilterKnowledgeBase] = useState(knowledgeBaseData);
  const [selectedDataToDelete, setselectedDataToDelete] = useState(null);
  
  useEffect(() => {
    dispatch(getAllKnowBaseDataAction(resolvedParams?.org_id));
    setFilterKnowledgeBase(knowledgeBaseData);
  }, []);

 
  const tableData = filterKnowledgeBase.map(item => ({
    ...item,
    actualName: item?.name,
    name: <div className="flex gap-2">
      <div className="flex items-center gap-2">
        {GetFileTypeIcon(item?.source?.data?.type||item.source?.type, 14, 14)}
        </div>
      <div className="tooltip" data-tip={item.name}>
        {truncate(item.name, 30)}
      </div>
    </div>,
    description: item?.description,
    actual_name: item?.name,
  }));
  const handleUpdateKnowledgeBase = (item) => {
    setSelectedKnowledgeBase(item);
    openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL)
  };

  const handleDeleteKnowledgebase = (item) => {
    closeModal(MODAL_TYPE.DELETE_MODAL);
    dispatch(deleteKnowBaseDataAction({ data: { id: item?._id, orgId: resolvedParams?.org_id } }))
  };
  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center">
        <div
          className="tooltip tooltip-primary"
          data-tip="delete"
          onClick={() => { setselectedDataToDelete(row); openModal(MODAL_TYPE.DELETE_MODAL) }}
        >
          <TrashIcon strokeWidth={2} size={20} />
        </div>
        <div
          className="tooltip tooltip-primary"
          data-tip="Update"
          onClick={() => handleUpdateKnowledgeBase(row)}
        >
          <SquarePenIcon size={20} />
        </div>
      </div>
    );
  };

  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'rag') {
        if (e.data?.status === "create") {
          dispatch(getAllKnowBaseDataAction(resolvedParams.org_id));
        }
      }
    }
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [resolvedParams.org_id]);

  return (
    <div className="w-full">
      <div className="px-4 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-4">
            <PageHeader
              title="Knowledge Base"
              description="A knowledge base is a collection of useful info like docs and FAQs. You can add it via files, URLs, or websites. Agents use this data to generate dynamic, context-aware responses without hardcoding."
              docLink="https://blog.gtwy.ai/features/knowledgebase"
            />
            <div className="flex-shrink-0 mt-4 sm:mt-0">
              <button className="btn btn-primary" onClick={() => { if (window.openRag) { window.openRag() } else { openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL) } }}>+ Create Knowledge Base</button>
            </div>
          </div>
        </MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
          <SearchItems data={knowledgeBaseData} setFilterItems={setFilterKnowledgeBase} item="KnowledgeBase" />
        </div>
      </div>

      <div className="px-4">
        {filterKnowledgeBase.length > 0 ? (
          <CustomTable
            data={tableData}
            columnsToShow={KNOWLEDGE_BASE_COLUMNS}
            sorting
            sortingColumns={['name']}
            keysToWrap={['name', 'description']}
            endComponent={EndComponent}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No knowledge base entries found</p>
          </div>
        )}
      </div>

      <KnowledgeBaseModal params={resolvedParams} selectedKnowledgeBase={selectedKnowledgeBase} setSelectedKnowledgeBase={setSelectedKnowledgeBase} knowledgeBaseData={knowledgeBaseData} />
      <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedDataToDelete} title="Delete knowledgeBase " description={`Are you sure you want to delete the KnowledgeBase "${selectedDataToDelete?.actual_name}"? This action cannot be undone.`} />
    </div>
  );
};

export default Page;