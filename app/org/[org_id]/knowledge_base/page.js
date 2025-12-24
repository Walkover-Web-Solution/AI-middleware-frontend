'use client';
import CustomTable from "@/components/customTable/CustomTable";
import { truncate } from "@/components/historyPageComponents/AssistFile";
import MainLayout from "@/components/layoutComponents/MainLayout";
import KnowledgeBaseModal from "@/components/modals/KnowledgeBaseModal";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteKnowBaseDataAction, getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { KNOWLEDGE_BASE_COLUMNS, MODAL_TYPE } from "@/utils/enums";
import { GetFileTypeIcon, openModal } from "@/utils/utility";
import { SquarePenIcon, TrashIcon } from "@/components/Icons";
import React, { useEffect, useState, use } from 'react';
import { useDispatch } from "react-redux";
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";
import useDeleteOperation from "@/customHooks/useDeleteOperation";

export const runtime = 'edge';

const Page = ({ params }) => {
  const resolvedParams = use(params);
  const dispatch = useDispatch();
  const { knowledgeBaseData, descriptions, linksData } = useCustomSelector((state) => ({
    knowledgeBaseData: state?.knowledgeBaseReducer?.knowledgeBaseData?.[resolvedParams?.org_id] || [],
    descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions || {},
    linksData: state.flowDataReducer.flowData.linksData || [],
  }));
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState();
  const [filterKnowledgeBase, setFilterKnowledgeBase] = useState(knowledgeBaseData);
  const [selectedDataToDelete, setselectedDataToDelete] = useState(null);
  const { isDeleting, executeDelete } = useDeleteOperation();
  useEffect(() => {
    setFilterKnowledgeBase(knowledgeBaseData)
  }, [knowledgeBaseData]);
  const tableData = filterKnowledgeBase.map(item => ({
    ...item,
    actualName: item?.name,
    name: <div className="flex gap-2">
      <div className="flex items-center gap-2">
        {GetFileTypeIcon(item?.source?.data?.type || item.source?.type, 14, 14)}
      </div>
      <div className="tooltip" data-tip={item.name}>
        {item.name}
      </div>
    </div>,
    description: <div className="tooltip" data-tip={item.description}>{truncate(item.description, 30)}</div>,
    actual_name: item?.name,
  }));
  const handleUpdateKnowledgeBase = (item) => {
    const originalItem = knowledgeBaseData.find(kb => kb._id === item._id);
    setSelectedKnowledgeBase(originalItem);
    openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL)
  };

  const handleDeleteKnowledgebase = async (item) => {
    await executeDelete(async () => {
      return dispatch(deleteKnowBaseDataAction({ data: { id: item?._id, orgId: resolvedParams?.org_id } }));
    });
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
      <div className="px-2 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full gap-2">
            <PageHeader
              title="Knowledge Base"
              description={descriptions?.['Knowledge Base'] || "A knowledge Base is a collection of useful info like docs and FAQs. You can add it via files, URLs, or websites. Agents use this data to generate dynamic, context-aware responses without hardcoding."}
              docLink={linksData?.find(link => link.title === 'Knowledge Base')?.blog_link}
            />

          </div>
        </MainLayout>
        <div className="flex flex-row gap-4">
          {knowledgeBaseData?.length > 5 && (
            <SearchItems data={knowledgeBaseData} setFilterItems={setFilterKnowledgeBase} item="KnowledgeBase" />
          )}
          <div className={`flex-shrink-0 ${knowledgeBaseData?.length > 5 ? 'mr-2' : 'ml-2'}`}>
            <button className="btn btn-primary btn-sm" onClick={() => { if (window.openRag) { window.openRag() } else { openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL) } }}>+ Create Knowledge Base</button>
          </div>
        </div>
      </div>

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
          <p className="text-gray-500 text-lg">No knowledge base entries found</p>
        </div>
      )}

      <KnowledgeBaseModal params={resolvedParams} selectedKnowledgeBase={selectedKnowledgeBase} setSelectedKnowledgeBase={setSelectedKnowledgeBase} knowledgeBaseData={knowledgeBaseData} />
      <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedDataToDelete} title="Delete knowledgeBase " description={`Are you sure you want to delete the KnowledgeBase "${selectedDataToDelete?.actual_name}"? This action cannot be undone.`} loading={isDeleting} isAsync={true} />
    </div>
  );
};

export default Page;