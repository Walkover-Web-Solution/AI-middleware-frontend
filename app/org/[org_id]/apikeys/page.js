'use client';
import CustomTable from "@/components/customTable/customTable";
import MainLayout from "@/components/layoutComponents/MainLayout";
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import PageHeader from "@/components/Pageheader";
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteApikeyAction} from '@/store/action/apiKeyAction';
import { API_KEY_COLUMNS, MODAL_TYPE } from '@/utils/enums';
import { closeModal, getIconOfService, openModal, toggleSidebar } from '@/utils/utility';
import { BookIcon, InfoIcon, SquarePenIcon, TrashIcon } from '@/components/Icons';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import DeleteModal from "@/components/UI/DeleteModal";
import SearchItems from "@/components/UI/SearchItems";
import ApiKeyGuideSlider from "@/components/configuration/configurationComponent/ApiKeyGuide";
import ConnectedAgentsModal from '@/components/modals/ConnectedAgentsModal';

export const runtime = 'edge';

const Page = () => {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const path = pathName?.split('?')[0].split('/');
  const orgId = path[2] || '';
  const { apikeyData, descriptions } = useCustomSelector((state) => ({
    apikeyData: state?.bridgeReducer?.apikeys[orgId] || [],
    descriptions: state.flowDataReducer.flowData.descriptionsData?.descriptions||{},
  }));
  const [filterApiKeys, setFilterApiKeys] = useState(apikeyData);

  useEffect(() => {
    setFilterApiKeys(apikeyData);
  }, [apikeyData]);

  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDataToDelete, setselectedDataToDelete] = useState(null);
  const [selectedApiKeyForAgents, setSelectedApiKeyForAgents] = useState(null);

  useEffect(() => {
    if (selectedApiKeyForAgents) {
      openModal(MODAL_TYPE.CONNECTED_AGENTS_MODAL);
    }
  }, [selectedApiKeyForAgents]);

  const handleUpdateClick = useCallback((item) => {
    setSelectedApiKey(item);
    setIsEditing(true);
    openModal(MODAL_TYPE.API_KEY_MODAL);
  },
    [MODAL_TYPE, openModal]
  );

  const deleteApikey = useCallback(
    (item) => {
      closeModal(MODAL_TYPE?.DELETE_MODAL)
      dispatch(
        deleteApikeyAction({
          org_id: item.org_id,
          name: item.name,
          id: item._id,
        })
      )
    },
    [dispatch]
  );

  const showConnectedAgents = useCallback((item) => {
    setSelectedApiKeyForAgents(item);
    openModal(MODAL_TYPE.CONNECTED_AGENTS_MODAL);
  }, []);

  const dataWithIcons = filterApiKeys.map((item) => ({
    ...item,
    actualName: item.name,
    service: (
      <div className="flex items-center gap-2">
        {getIconOfService(item.service, 18, 18)}
        <span className="capitalize">{item.service}</span>
      </div>
    ),
  }));

  const EndComponent = ({ row }) => {
    return (
      <div className="flex gap-3 justify-center items-center" onClick={(e) => e.stopPropagation()}>
        <div
          className="tooltip tooltip-primary"
          data-tip="delete"
          onClick={(e) => { 
            e.stopPropagation();
            setselectedDataToDelete(row); 
            openModal(MODAL_TYPE.DELETE_MODAL);
          }}
        >
          <TrashIcon size={16} />
        </div>
        <div
          className="tooltip tooltip-primary"
          data-tip="Update"
          onClick={(e) => {
            e.stopPropagation();
            handleUpdateClick(row);
          }}
        >
          <SquarePenIcon size={16} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
     <div className="px-2">
      <MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full pt-4 ">
          <PageHeader
            title="ApiKeys"
            description={descriptions?.['Provider Keys'] || "Add your model-specific API keys to enable and use different AI models in your chat."}
            docLink="https://techdoc.walkover.in/p/serviceapi-key?collectionId=1YnJD-Bzbg4C"
          />
        
        </div>
      </MainLayout>
      <div className="flex flex-row gap-4 justify-between ">

      <SearchItems data={apikeyData} setFilterItems={setFilterApiKeys} item="ApiKeys"/>
      <div className="flex-shrink-0 flex gap-4 mr-2">
            <button 
              className="btn" 
              onClick={() => toggleSidebar("Api-Keys-guide-slider","right")}
            >
             <BookIcon />  APIKey Guide
            </button>
            <button className="btn btn-primary" onClick={() => openModal(MODAL_TYPE.API_KEY_MODAL)}>
              + Add New ApiKey
            </button>
          </div>
      </div>
      </div>
      {Object.entries(
        dataWithIcons.reduce((acc, item) => {
          const service = item.service.props.children[1].props.children;
          if (!acc[service]) {
            acc[service] = [];
          }
          acc[service].push(item);
          return acc;
        }, {})
      ).map(([service, items]) => (
        <div key={service} className="mb-2 mt-4">
          <h2 className="text-xl font-semibold capitalize flex items-center gap-2 pl-4">
            {getIconOfService(service.toLowerCase(), 24, 24)}
            {service}
          </h2>
          <CustomTable
            data={items}
            columnsToShow={API_KEY_COLUMNS}
            sorting
            sortingColumns={["name"]}
            keysToWrap={["apikey", "comment"]}
            endComponent={EndComponent}
            handleRowClick={(data) => showConnectedAgents(items.find(item => item._id === data._id))}
            keysToExtractOnRowClick={["_id"]}
          />
        </div>
      ))}
      <ApiKeyModal orgId={orgId} isEditing={isEditing} selectedApiKey={selectedApiKey} setSelectedApiKey={setSelectedApiKey} setIsEditing={setIsEditing} apikeyData={apikeyData} />
      
      <ApiKeyGuideSlider/>
      <DeleteModal onConfirm={deleteApikey} item={selectedDataToDelete} title="Delete API Key" description={`Are you sure you want to delete the API key "${selectedDataToDelete?.name}"? This action cannot be undone.`}
      />
      <ConnectedAgentsModal apiKey={selectedApiKeyForAgents} orgId={orgId} />
    </div>
  );
};

export default Page;