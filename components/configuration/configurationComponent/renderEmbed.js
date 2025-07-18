import React, { useMemo } from 'react';
import { CircleAlertIcon, SettingsIcon } from '@/components/Icons';

const RenderEmbed = ({
  bridgeFunctions,
  integrationData,
  getStatusClass,
  handleOpenModal,
  embedToken,
  params,
}) => {
  const renderEmbed = useMemo(() => {
    return bridgeFunctions?.slice()
      .sort((a, b) => {
        const aTitle = integrationData[a?.endpoint]?.title || integrationData[a?.function_name]?.title;
        const bTitle = integrationData[b?.endpoint]?.title || integrationData[b?.function_name]?.title;
        if (!aTitle) return 1;
        if (!bTitle) return -1;
        return aTitle?.localeCompare(bTitle);
      })
      .map((value) => {
        const functionName = value?.function_name || value?.endpoint;
        const title = integrationData?.[functionName]?.title;
        const status = integrationData?.[functionName]?.status;

        return (
          <div key={value?._id} id={value?._id} className={`flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer bg-base-100 relative ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 `}>
            <div
              className="p-4 w-full h-full flex flex-col justify-between"
              onClick={() => openViasocket(functionName, {
                embedToken,
                meta: {
                  type: 'tool',
                  bridge_id: params?.id,
                },
              })}
            >
              <div>
                <div className="flex justify-between items-center">
                  <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content">
                    {title}
                  </h1>
                  {value?.description?.trim() === "" && <CircleAlertIcon color='red' size={16} />}
                </div>
                <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                  {value?.description || value?.api_description || value?.short_description || "A description is required for proper functionality."}
                </p>
              </div>
              <div className="mt-4">
                <span className={`mr-2 inline-block rounded-full capitalize px-3 bg-base-200 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(status)}`}>
                  {!(value?.description || value?.api_description || value?.short_description) ? "Description Required" : status}
                </span>
              </div>
            </div>
            <div className="dropdown shadow-none border-none absolute right-1 top-1">
              <div role="button" className="btn bg-transparent shadow-none border-none outline-none hover:bg-base-200" onClick={() => handleOpenModal(value?._id)}>
                <SettingsIcon size={18} />
              </div>
            </div>
          </div>
        );
      });
  }, [bridgeFunctions, integrationData, getStatusClass, handleOpenModal, embedToken, params]);

  return <>{renderEmbed}</>;
};

export default RenderEmbed;
