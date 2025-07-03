// First, let's add some debugging to the main page component
'use client';
import CustomTable from "@/components/customTable/customTable";
import { truncate } from "@/components/historyPageComponents/assistFile";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { getAllIntegrationDataAction } from "@/store/action/integrationAction";
import { MODAL_TYPE } from "@/utils/enums";
import { ChevronLastIcon, LayoutGridIcon, TableIcon } from "@/components/Icons";
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from "react-redux";
import MainLayout from "@/components/layoutComponents/MainLayout";
import IntegrationGuideModal from "@/components/modals/IntegrationGuideModal";
import { openModal } from "@/utils/utility";

export const runtime = 'edge';

const Page = ({ params }) => {
  const dispatch = useDispatch();
  const { integrationData } = useCustomSelector((state) =>
  ({
    integrationData: state?.integrationReducer?.integrationData?.[params?.org_id],
  })
  );
  const [viewMode, setViewMode] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  useEffect(() => {
    const updateScreenSize = () => {
      if (typeof window !== 'undefined') {
        setViewMode(window.innerWidth < 640 ? 'grid' : 'table');
      }
    };
    dispatch(getAllIntegrationDataAction(params?.org_id));
    if (typeof window !== 'undefined') {
      updateScreenSize();
      window.addEventListener('resize', updateScreenSize);
      return () => window.removeEventListener('resize', updateScreenSize);
    }
  }, [dispatch, params?.org_id]);

  const filteredIntegration = useMemo(() => {
    const filtered = integrationData?.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
    return filtered;
  }, [integrationData, searchTerm]);

  const tableData = filteredIntegration.map((item, index) => ({
    id: index,
    name: (
      <div className="flex gap-2">
        <div className="tooltip" data-tip={item.name}>
          {truncate(item.name, 30)}
        </div>
      </div>
    ),
    createdAt: item?.created_at,
    folder_id: item?._id,
    originalName: item?.name,
    org_id: item?.org_id,
    originalItem: item
  }));

  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center">
        <button
          className="tooltip tooltip-primary cursor-pointer btn btn-sm"
          data-tip="Configure Integration"
          onClick={(e) => {
            e.stopPropagation();
            handleClickIntegration(row.originalItem);
          }}
        >
          <ChevronLastIcon strokeWidth={2} size={20} />
        </button>
      </div>
    );
  };

  const handleClickIntegration = (item) => {
    setSelectedIntegration(item);
    openModal(MODAL_TYPE.INTEGRATION_GUIDE_MODAL);
  };

  return (
    <div className="">
      <IntegrationGuideModal params={params} selectedIntegration={selectedIntegration} />
      <div className="flex flex-col md:flex-row items-start justify-between mb-4 gap-4 p-1">
        <MainLayout>
          <PageHeader
            title="Integration"
            description="A repository where you can provide integration data that the AI uses to generate accurate and context-aware responses."
          />
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Search integration..."
              className="input input-bordered w-full md:max-w-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </MainLayout>
        <div className="flex flex-wrap justify-end items-start gap-2">
          <button
            className={`btn rounded-r-none rounded-md ${viewMode === 'grid' ? 'bg-primary text-base-100' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGridIcon size={16} />
          </button>
          <button
            className={`btn rounded-l-none rounded-md ${viewMode === 'table' ? 'bg-primary text-base-100' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <TableIcon size={16} />
          </button>
        </div>
      </div>

      {filteredIntegration.length > 0 ? (
        viewMode === 'grid' ? 
        (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredIntegration.map((item, index) => (
              <div
                key={index}
                className="bg-base-100 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer relative border-2 hover:border-primary"
                onClick={() => {
                  handleClickIntegration(item);
                }}
              >
                <div className="flex flex-col items-center w-full gap-2">
                  <div className="tooltip" data-tip={item?.name}>
                    <h3 className="text-lg font-medium max-w-[90%] w-full text-center">
                      {truncate(String(item?.name), 10)}
                    </h3>
                  </div>
                  <div className="tooltip" data-tip={item?.description}>
                    <p className="text-sm text-base-content/70 max-w-[90%] w-full text-center">
                      {truncate(item?.description || 'No description', 20)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CustomTable
            data={tableData}
            columnsToShow={['name', 'createdAt']}
            sorting
            sortingColumns={['name']}
            keysToWrap={['name', 'description']}
            endComponent={EndComponent}
          />
        )
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No integration entries found</p>
        </div>
      )}
    </div>
  );
};

export default Page;