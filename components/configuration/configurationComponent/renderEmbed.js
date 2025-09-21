import React, { useMemo } from 'react';
import { CircleAlertIcon, SettingsIcon, TrashIcon } from '@/components/Icons';

const RenderEmbed = ({
  bridgeFunctions,
  integrationData,
  getStatusClass,
  handleOpenModal,
  embedToken,
  params,
  handleRemoveEmbed,
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
          <div
            key={value?._id}
            id={value?._id}
            className={`flex w-full  flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 transition-colors duration-200`}
          >
            <div
              className="p-2 w-full h-full flex flex-col justify-between"
              onClick={() => openViasocket(functionName, {
                embedToken,
                meta: {
                  type: 'tool',
                  bridge_id: params?.id,
                },
              })}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 text-[13px] sm:text-sm font-semibold text-base-content truncate">
                    <div className="tooltip" data-tip={title?.length > 24 ? title : ""}>
                      <span>{title?.length > 24 ? `${title.slice(0, 24)}...` : title}</span>
                      <span
                        className={`shrink-0 inline-block rounded-full capitalize px-2 py-0 text-[10px] ml-2 font-medium border ${!(value?.description || value?.api_description || value?.short_description)
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-green-100 text-green-700 border-green-200'}`}
                      >
                        {!(value?.description || value?.api_description || value?.short_description) ? 'Description Required' : 'Active'}
                      </span>
                    </div>
                  </span>
                  {value?.description?.trim() === "" && <CircleAlertIcon color='red' size={16} />}
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-base-content/70 line-clamp-1">
                  {value?.description || value?.api_description || value?.short_description || 'A description is required for proper functionality.'}
                </p>
              </div>
                </div>
              <div className="flex items-center justify-center absolute right-1 top-1">
                <button
                  className="btn bg-transparent hover:bg-transparent shadow-none border-none outline-none pr-1"
                  onClick={() => handleOpenModal(value?._id)}
                >
                  <SettingsIcon size={16} />
                </button>
                <button className=" btn bg-transparent hover:bg-transparent shadow-none border-none outline-none pr-1" onClick={() => handleRemoveEmbed(value?._id,value?.function_name)}>
                  <TrashIcon size={16} className="hover:text-error" />
                </button>
              </div>
          </div>
        );
      });
  }, [bridgeFunctions, integrationData, getStatusClass, handleOpenModal, embedToken, params]);

  return <>{renderEmbed}</>;
};

export default RenderEmbed;
