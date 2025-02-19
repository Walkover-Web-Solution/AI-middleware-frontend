'use client';
import KnowledgeBaseModal from "@/components/modals/knowledgeBaseModal";
import { useCustomSelector } from '@/customHooks/customSelector';
import GoogleDocIcon from "@/icons/GoogleDocIcon";
import { deleteKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { BookText, EllipsisVertical, LayoutGrid, Table } from "lucide-react";
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from "react-redux";
import CustomTable from "@/components/customTable/customTable";
import { KNOWLEDGE_BASE_COLUMNS } from "@/utils/enums";
import { truncate } from "@/components/historyPageComponents/assistFile";
import KnowledgeBaseIntegrationSlider from "@/components/configuration/configurationComponent/knowledgeBaseIntegrationSlider";
import { GetFileTypeIcon } from "@/utils/utility";

export const runtime = 'edge';

const Page = ({ params }) => {
  const dispatch = useDispatch();
  const knowledgeBaseData = useCustomSelector((state) => state?.knowledgeBaseReducer?.knowledgeBaseData?.[params?.org_id]);
  const [viewMode, setViewMode] = useState(window.innerWidth < 640 ? 'grid' : 'table');
  const [searchTerm, setSearchTerm] = useState('');
  const [openKnowledgeBaseSlider, setOpenKnowledgeBaseSlider] = useState(false);

  useEffect(() => {
    const updateScreenSize = () => {
      if (window.matchMedia('(max-width: 640px)').matches) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  

  const filteredKnowledgeBase = useMemo(() =>
    knowledgeBaseData?.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
    , [knowledgeBaseData, searchTerm]);

  const tableData = filteredKnowledgeBase.map(item => ({
    ...item,
    name: <div className="flex gap-2">
      <div className="flex items-center gap-2">
       {GetFileTypeIcon(item?.type, 24 , 24)}
      </div>
      <div className="tooltip" data-tip={item.name}>
        {truncate(item.name, 30)}
      </div>
      
    </div>,
    description : item?.description,
    actual_name: item?.name,
  }));

  const EndComponent = () =>{
    return (
      <div className="dropdown dropdown-left">
        <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle" onClick={(e) => e.stopPropagation()}>
          <EllipsisVertical size={16} />
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
          <li><a onClick={() => handleDelete(item.name, item?._id)} className="">Delete</a></li>
        </ul>
      </div>
    )
  }
  const handleDelete = (name, id) => {
    if (window.confirm(`Do you want to delete document with name: ${name}?`)) {
      dispatch(deleteKnowBaseDataAction({ data: { id, orgId: params?.org_id } }));
    }
  };

  return (
    <div className="">
      <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
        <input
          type="text"
          placeholder="Search knowledge base..."
          className="input input-bordered w-full md:max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="join">
          <button className="btn mr-4" onClick={() => setOpenKnowledgeBaseSlider(true)}>
          <BookText /> Integration Guide
          </button>
          <button
            className={`btn rounded-r-none rounded-md ${viewMode === 'grid' ? 'bg-primary text-base-100' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            className={`btn rounded-l-none rounded-md ${viewMode === 'table' ? 'bg-primary text-base-100' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <Table size={16} />
          </button>
        </div>
      </div>

      {filteredKnowledgeBase.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredKnowledgeBase.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative"
              >
                <div className="dropdown dropdown-right absolute top-2 right-2">
                  <div tabIndex={0} role="button" className="btn btn-sm btn-ghost btn-circle" onClick={(e) => e.stopPropagation()}>
                    <EllipsisVertical size={16} />
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32">
                    <li><a onClick={() => handleDelete(item.name, item?._id)} className="text-error">Delete</a></li>
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
      <KnowledgeBaseModal params={params} />
      <KnowledgeBaseIntegrationSlider params={params} setOpenKnowledgeBaseSlider={setOpenKnowledgeBaseSlider} openKnowledgeBaseSlider={openKnowledgeBaseSlider} />
    </div>
  );
};

export default Page;
