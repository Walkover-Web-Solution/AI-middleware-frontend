'use client';
import CustomTable from "@/components/customTable/customTable";
import ApiKeyModal from '@/components/modals/ApiKeyModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { deleteApikeyAction, getAllApikeyAction } from '@/store/action/apiKeyAction';
import { API_KEY_COLUMNS, MODAL_TYPE } from '@/utils/enums';
import { getIconOfService, openModal } from '@/utils/utility';
import { SquarePen, Trash2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

export const runtime = 'edge';

const Page = () => {
  const pathName = usePathname();
  const dispatch = useDispatch();
  const path = pathName?.split('?')[0].split('/');
  const orgId = path[2] || '';

  const { apikeyData } = useCustomSelector((state) => ({
    apikeyData: state?.bridgeReducer?.apikeys[orgId] || []
  }));

  useEffect(() => {
    if (orgId) {
      dispatch(getAllApikeyAction(orgId));
    }
  }, []);

  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateClick = useCallback((item) => {
    setSelectedApiKey(item);
    setIsEditing(true);
    openModal(MODAL_TYPE.API_KEY_MODAL);
  },
    [MODAL_TYPE, openModal]
  );

  const deleteApikey = useCallback(
    (item) => {
      if (window.confirm("Are you sure you want to delete this API key?")) {
        dispatch(
          deleteApikeyAction({
            org_id: item.org_id,
            name: item.name,
            id: item._id,
          })
        );
      }
    },
    [dispatch]
  );

  const columns = API_KEY_COLUMNS || [];

  const dataWithIcons = apikeyData.map((item) => ({
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
      <div className="flex gap-3 justify-center items-center">
        <div
          className="tooltip tooltip-primary"
          data-tip="delete"
          onClick={() => deleteApikey(row)}
        >
          <Trash2 strokeWidth={2} size={20} />
        </div>
        <div
          className="tooltip tooltip-primary"
          data-tip="Update"
          onClick={() => handleUpdateClick(row)}
        >
          <SquarePen size={20} />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
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
        <div key={service} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 capitalize flex items-center gap-2 pl-3">
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
          />
        </div>
      ))}
      <ApiKeyModal orgId={orgId} isEditing={isEditing} selectedApiKey={selectedApiKey} setSelectedApiKey={setSelectedApiKey} setIsEditing={setIsEditing} apikeyData={apikeyData} />
    </div>
  );
};

export default Page;
