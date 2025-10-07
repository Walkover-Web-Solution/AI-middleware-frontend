import React, { useMemo } from 'react';
import { CircleAlertIcon, EllipsisVerticalIcon, SettingsIcon, TrashIcon } from '@/components/Icons';

const RenderEmbed = ({
  bridgeFunctions,
  integrationData,
  getStatusClass,
  handleOpenModal,
  embedToken,
  params,
  handleRemoveEmbed,
  handleOpenDeleteModal
}) => {
  const renderEmbed = useMemo(() => {
    return bridgeFunctions?.slice()
      .sort((a, b) => {
        const aFnName = a?.function_name || a?.endpoint;
        const bFnName = b?.function_name || b?.endpoint;
        const aTitle = a?.title || integrationData?.[aFnName]?.title;
        const bTitle = b?.title || integrationData?.[bFnName]?.title;
        if (!aTitle) return 1;
        if (!bTitle) return -1;
        return aTitle?.localeCompare(bTitle);
      })
      .map((value) => {
        const functionName = value?.function_name || value?.endpoint;
        const title = value?.title || integrationData?.[functionName]?.title;
        const status = value?.status || integrationData?.[functionName]?.status;

        return (
          <div
            key={value?._id}
            id={value?._id}
            className={`group flex w-full flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 transition-colors duration-200`}
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
                  <span className="flex-1 min-w-0 text-[9px] md:text-[12px] lg:text-[13px] font-bold truncate">
                    <div className="tooltip" data-tip={title?.length > 24 ? title : ""}>
                      <span>{ title}</span>
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

            {/* Action buttons that appear on hover */}
            <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(value?._id);
                }}
                className="btn btn-ghost btn-xs p-1 hover:bg-base-300"
                title="Config"
              >
                <SettingsIcon size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(value?._id, value?.function_name);
                }}
                className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-error"
                title="Remove"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        );
      });
  }, [bridgeFunctions, integrationData, getStatusClass, handleOpenModal, embedToken, params, handleRemoveEmbed]);

  return <>{renderEmbed}</>;
};

export default RenderEmbed;