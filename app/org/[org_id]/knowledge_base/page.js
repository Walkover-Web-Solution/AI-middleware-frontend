'use client';
import KnowledgeBaseIntegrationSlider from "@/components/configuration/configurationComponent/knowledgeBaseIntegrationSlider";
import CustomTable from "@/components/customTable/customTable";
import { truncate } from "@/components/historyPageComponents/assistFile";
import MainLayout from "@/components/layoutComponents/MainLayout";
import KnowledgeBaseModal from "@/components/modals/knowledgeBaseModal";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteKnowBaseDataAction, getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { KNOWLEDGE_BASE_COLUMNS, MODAL_TYPE } from "@/utils/enums";
import { closeModal, GetFileTypeIcon, openModal, toggleSidebar } from "@/utils/utility";
import { BookIcon, EllipsisVerticalIcon, LayoutGridIcon, SquarePenIcon, TableIcon, TrashIcon } from "@/components/Icons";
import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";

export const runtime = 'edge';

const Page = ({ params }) => {
  const dispatch = useDispatch();
  const knowledgeBaseData = useCustomSelector((state) => state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id])||[];
  const [viewMode, setViewMode] = useState(window.innerWidth < 640 ? 'grid' : 'table');
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState();
  const [filterKnowledgeBase, setFilterKnowledgeBase] = useState(knowledgeBaseData)
  const [selectedDataToDelete, setselectedDataToDelete] = useState(null);
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    dispatch(getAllKnowBaseDataAction(params?.org_id))
    updateScreenSize();
    setFilterKnowledgeBase(knowledgeBaseData)
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);


  const tableData = filterKnowledgeBase.map(item => ({
    ...item,
    name: <div className="flex gap-2">
      <div className="flex items-center gap-2">
        {GetFileTypeIcon(item?.type, 24, 24)}
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
    dispatch(deleteKnowBaseDataAction({ data: { id: item?._id, orgId: params?.org_id } }))
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
                dispatch(getAllKnowBaseDataAction(params.org_id));
            }
        }
    }
    window.addEventListener('message', handleMessage);
    return () => {
        window.removeEventListener('message', handleMessage);
    };
}, [params.org_id]);

  return (
    <div className="w-full">
      <div className="px-2 pt-4">
        <MainLayout>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between w-full mb-4 gap-2">
            <PageHeader
              title="Knowledge Base"
              description="A knowledge base is a collection of useful info like docs and FAQs. You can add it via files, URLs, or websites. Agents use this data to generate dynamic, context-aware responses without hardcoding."
              docLink="https://blog.gtwy.ai/features/knowledgebase"
            />
            {/* <div className="flex flex-wrap justify-end items-center gap-2">
            </div> */}
            <div className="flex flex-shrink-0 gap-2 mt-4 sm:mt-0">
              <button className="btn" onClick={() => toggleSidebar("knowledgeBase-integration-slider","right")}>
                <BookIcon /> Integration Guide
              </button>
              <button className="btn btn-primary" onClick={() => {if(window.openRag){window.openRag()} else {openModal(MODAL_TYPE?.KNOWLEDGE_BASE_MODAL)}}}>+ create knowledge base</button>
            </div>
          </div>
        </MainLayout>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">

          <SearchItems data={knowledgeBaseData} setFilterItems={setFilterKnowledgeBase} />
          
        </div>
      </div>

      <div className="px-4">
        {filterKnowledgeBase.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filterKnowledgeBase.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
                >
                  <div className="dropdown dropdown-right absolute top-2 right-2">
                    <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle" onClick={(e) => e.stopPropagation()}>
                      <EllipsisVerticalIcon size={16} />
                    </div>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box z-high w-32">
                      <li><a onClick={() => handleDelete()} className="text-error hover:bg-error hover:text-error-content">Delete</a></li>
                      <li><a onClick={() => handleUpdateKnowledgeBase(item)} className="hover:bg-base-200">Update</a></li>
                    </ul>
                  </div>
                  <div className="flex flex-col items-center w-full gap-2">
                    {GetFileTypeIcon(item?.type, 26, 26)}
                    <div className="tooltip" data-tip={item?.name}>
                      <h3 className="text-lg font-medium max-w-[90%] w-full">
                        {truncate(String(item?.name), 10)}
                      </h3>
                    </div>
                    <div className="tooltip" data-tip={item?.description}>
                      <p className="text-sm text-base-content/70 max-w-[90%] w-full">
                        {truncate(item?.description, 20)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <CustomTable
              data={tableData}
              columnsToShow={KNOWLEDGE_BASE_COLUMNS}
              sorting
              sortingColumns={['name']}
              keysToWrap={['name', 'description']}
              endComponent={EndComponent}
            />
          )
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No knowledge base entries found</p>
          </div>
        )}
      </div>

      <KnowledgeBaseModal params={params} selectedKnowledgeBase={selectedKnowledgeBase} setSelectedKnowledgeBase={setSelectedKnowledgeBase} knowledgeBaseData={knowledgeBaseData} />
      <KnowledgeBaseIntegrationSlider params={params}  />
      <DeleteModal onConfirm={handleDeleteKnowledgebase} item={selectedDataToDelete} title="Delete knowledgeBase " description={`Are you sure you want to delete the KnowledgeBase "${selectedDataToDelete?.actual_name}"? This action cannot be undone.`} />
    </div>
  );
};

export default Page;