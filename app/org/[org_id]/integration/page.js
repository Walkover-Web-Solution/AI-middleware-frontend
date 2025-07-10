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
import IntegrationModal from "@/components/modals/IntegrationModal";
import InfoTooltip from "@/components/InfoTooltip";

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
        <InfoTooltip className="z-low-medium h-2 pt-1 pb-5 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto" tooltipContent={item.name}>
          {truncate(item.name, 30)}
        </InfoTooltip>
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
        <InfoTooltip
          className="z-low-medium w-36 h-4 pl-3 pr-3 pt-2 pb-5 bg-primary text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              bordespace-y-2 space-x-2 pointer-events-auto"
          tooltipContent="Configure Integration"
          
        >
          <ChevronLastIcon strokeWidth={2} size={20} onClick={(e) => {
            e.stopPropagation();
            handleClickIntegration(row.originalItem);
          }} />
        </InfoTooltip>
      </div>
    );
  };

  const handleClickIntegration = (item) => {
    setSelectedIntegration(item);
    openModal(MODAL_TYPE.INTEGRATION_GUIDE_MODAL);
  };

  return (
    <MainLayout>
      <div className="w-full">
        <IntegrationGuideModal params={params} selectedIntegration={selectedIntegration} />
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-6 px-4 pt-4">
          <PageHeader
            title="Integration"
            description="A repository where you can provide integration data that the AI uses to generate accurate and context-aware responses."
          />
          <div className="flex-shrink-0 mt-4 sm:mt-0">
            <button 
              className="btn btn-primary" 
              onClick={() => openModal(MODAL_TYPE.INTEGRATION_MODAL)}
            >
              + create new integration
            </button>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 px-4 pt-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search integration..."
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="join">
            <button
              className={`btn join-item ${viewMode === 'grid' ? 'bg-primary text-base-100' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGridIcon size={16} />
            </button>
            <button
              className={`btn join-item ${viewMode === 'table' ? 'bg-primary text-base-100' : ''}`}
              onClick={() => setViewMode('table')}
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {filteredIntegration.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredIntegration.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer border-2 hover:border-primary"
                    onClick={() => handleClickIntegration(item)}
                  >
                    <div className="flex flex-col items-center w-full gap-2">
                      <InfoTooltip className="z-low-medium h-2  pt-1 pb-5 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto" tooltipContent={item?.name}>
                        <h3 className="text-lg font-medium text-center truncate w-full">
                          {truncate(String(item?.name), 15)}
                        </h3>
                      </InfoTooltip>
                      <InfoTooltip className="z-low-medium  pt-1 pb-5 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto" tooltipContent={item?.description}>
                        <p className="text-sm text-base-content/70 text-center">
                          {truncate(item?.description || 'No description', 25)}
                        </p>
                      </InfoTooltip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full">
                <CustomTable
                  data={tableData}
                  columnsToShow={['name', 'createdAt']}
                  sorting
                  sortingColumns={['name']}
                  keysToWrap={['name', 'description']}
                  endComponent={EndComponent}
                />
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No integration entries found</p>
            </div>
          )}
        </div>
      </div>
      <IntegrationModal params={params}/>
    </MainLayout>
  );
};

export default Page;