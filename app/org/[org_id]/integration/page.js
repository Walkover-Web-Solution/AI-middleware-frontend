'use client';
import CustomTable from "@/components/customTable/customTable";
import { truncate } from "@/components/historyPageComponents/assistFile";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { getAllIntegrationDataAction } from "@/store/action/integrationAction";
import { MODAL_TYPE } from "@/utils/enums";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from "react-redux";
import MainLayout from "@/components/layoutComponents/MainLayout";
import { openModal, toggleSidebar } from "@/utils/utility";
import IntegrationModal from "@/components/modals/IntegrationModal";
import GtwyIntegrationGuideSlider from "@/components/sliders/gtwyIntegrationGuideSlider";
import SearchItems from "@/components/UI/SearchItems";

export const runtime = 'edge';

const Page = ({ params }) => {
  const dispatch = useDispatch();
  const { integrationData } = useCustomSelector((state) =>
  ({
    integrationData: state?.integrationReducer?.integrationData?.[params?.org_id],
  })
  );
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [filterIntegration, setFilterIntegration] = useState(integrationData);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllIntegrationDataAction(params?.org_id));
  }, [dispatch, params?.org_id]);

  useEffect(() => {
    setFilterIntegration(integrationData);
  }, [integrationData]);

  const tableData = filterIntegration.map((item, index) => ({
    id: index,
    name: (
      <div className="flex gap-2">
        <div className="tooltip" data-tip={item.name}>
          {truncate(item.name, 30)}
        </div>
      </div>
    ),
    createdAt: new Date(item?.created_at).toLocaleString(),
    folder_id: item?.folder_id,
    originalName: item?.name,
    org_id: item?.org_id,
    originalItem: item
  }));

  const toggleGtwyIntegraionSlider = useCallback(() => {
    setIsSliderOpen(!isSliderOpen);
    toggleSidebar("gtwy-integration-slider", "right");
  }, [isSliderOpen]);

  const handleClickIntegration = (item) => {
    setSelectedIntegration(item);
    toggleGtwyIntegraionSlider();
  };

  return (
    <MainLayout>
      <div className="w-full">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full mb-4 px-4 pt-4">
          <PageHeader
            title="Integration"
            description="Embedded GTWY allows you to seamlessly integrate the full GTWY AI interface directly into any product or website."
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
        
        {/* Content Section */}
        <div className="w-full">
          <SearchItems data={integrationData} setFilterItems={setFilterIntegration} />
          {filterIntegration.length > 0 ? (
              <div className="w-full">
                <CustomTable
                  data={tableData}
                  columnsToShow={['name', 'folder_id', 'createdAt']}
                  sorting
                  sortingColumns={['name']}
                  keysToWrap={['name', 'description']}
                  handleRowClick={(data)=>handleClickIntegration(data)}
                  keysToExtractOnRowClick = {['org_id', 'folder_id']}
                />
              </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No integration entries found</p>
            </div>
          )}
        </div>
      </div>
      <IntegrationModal params={params}/>
      <GtwyIntegrationGuideSlider data={selectedIntegration} handleCloseSlider={toggleGtwyIntegraionSlider}/>
    </MainLayout>
  );
};

export default Page;