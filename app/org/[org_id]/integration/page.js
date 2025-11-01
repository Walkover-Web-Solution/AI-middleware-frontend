'use client';
import CustomTable from "@/components/customTable/customTable";
import { truncate } from "@/components/historyPageComponents/assistFile";
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { MODAL_TYPE } from "@/utils/enums";
import React, { useCallback, useEffect, useMemo, useState, use } from 'react';
import { useDispatch } from "react-redux";
import MainLayout from "@/components/layoutComponents/MainLayout";
import { openModal, toggleSidebar } from "@/utils/utility";
import IntegrationModal from "@/components/modals/IntegrationModal";
import GtwyIntegrationGuideSlider from "@/components/sliders/gtwyIntegrationGuideSlider";
import SearchItems from "@/components/UI/SearchItems";
import HoverClickIndicator from "@/components/UI/HoverClickIndicator";

export const runtime = 'edge';

const Page = ({ params }) => {
  const resolvedParams = use(params);
  
  const dispatch = useDispatch();
  const { integrationData, descriptions } = useCustomSelector((state) =>
  ({
    integrationData: state?.integrationReducer?.integrationData?.[resolvedParams?.org_id] || [],
    descriptions: state.flowDataReducer.flowData?.descriptionsData?.descriptions || {},
  })
  );
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [filterIntegration, setFilterIntegration] = useState(integrationData);
  const [isSliderOpen, setIsSliderOpen] = useState(false);

  useEffect(() => {
    setFilterIntegration(integrationData);
  }, [integrationData]);

  const tableData = (filterIntegration || [])?.map((item, index) => ({
    id: item._id,
    actualName: item?.name,
    name: (
      <div className="flex gap-2">
        <div className="tooltip" data-tip={item.name}>
          {truncate(item.name, 50)}
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
    <div className="w-full">
      {/* Header Section */}
      <div className="px-2 pt-4">

        <MainLayout >
          <div className="flex flex-col sm:flex-row">
            <PageHeader
              title=" GTWY Embed Integration"
              docLink="https://gtwy.ai/blogs/features/gtwy-embed--1"
              description={descriptions?.['Gtwy as Embed'] || "Embedded GTWY allows you to seamlessly integrate the full GTWY AI interface directly into any product or website."}
            />

          </div>
        </MainLayout>

        {/* Controls Section */}

        {/* Content Section */}
        <div className="w-full">
          <div className="flex flex-row gap-4">
            {integrationData?.length > 5 && (
              <SearchItems data={integrationData} setFilterItems={setFilterIntegration} item="Integration" />
            )}
            <div className={`flex-shrink-0 ${integrationData?.length > 5 ? 'mr-2' : 'ml-2'}`}>
              <button
                className="btn btn-primary btn-sm mr-2"
                onClick={() => openModal(MODAL_TYPE.INTEGRATION_MODAL)}
              >
                + Create New Integration
              </button>
            </div>
          </div>
        </div>
      </div>
      {filterIntegration.length > 0 ? (
        <div className="w-full">
          <CustomTable
            data={tableData}
            columnsToShow={['name', 'folder_id', 'createdAt']}
            sorting
            sortingColumns={['name']}
            keysToWrap={['name', 'description']}
            handleRowClick={(data) => handleClickIntegration(data)}
            keysToExtractOnRowClick={['org_id', 'folder_id']}
            endComponent={() => <HoverClickIndicator />}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No integration entries found</p>
        </div>
      )}

      <IntegrationModal params={resolvedParams} />
      <GtwyIntegrationGuideSlider data={selectedIntegration} handleCloseSlider={toggleGtwyIntegraionSlider} />

    </div>
  );
};

export default Page;