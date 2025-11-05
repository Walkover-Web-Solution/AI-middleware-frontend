import React, { useMemo } from 'react';
import { CircleAlertIcon, EllipsisVerticalIcon, SettingsIcon, TrashIcon, RefreshIcon } from '@/components/Icons';

const RenderEmbed = ({
  bridgeFunctions,
  integrationData,
  getStatusClass,
  handleOpenModal,
  embedToken,
  params,
  handleRemoveEmbed,
  handleOpenDeleteModal,
  handleChangePreTool,
  name
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
            className={`group flex w-full items-center rounded-md border border-base-300 cursor-pointer bg-base-100 relative ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 transition-colors duration-200`}
          >
            <div
              className="p-2 flex-1 flex items-center"
              onClick={() => openViasocket(functionName, {
                embedToken,
                meta: {
                  type: 'tool',
                  bridge_id: params?.id,
                },
              })}
            >
              <span className="flex-1 min-w-0 text-[9px] md:text-[12px] lg:text-[13px] font-bold truncate">
                <div className="tooltip" data-tip={title?.length > 24 ? title : ""}>
                  <span className="text-sm font-normal">{title}</span>
                </div>
              </span>
            </div>

            {/* Action buttons that appear on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 pr-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(value?._id);
                }}
                className="btn btn-ghost btn-sm p-1 hover:bg-base-300"
                title="Config"
              >
                <SettingsIcon size={16} />
              </button>
              {name === "preFunction" && handleChangePreTool && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChangePreTool();
                  }}
                  className="btn btn-ghost btn-sm p-1 hover:text-primary"
                  title="Change Pre Tool"
                >
                  <RefreshIcon size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(value?._id, value?.function_name);
                }}
                className="btn btn-ghost btn-sm p-1 hover:bg-red-100 hover:text-error"
                title="Remove"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        );
      });
  }, [bridgeFunctions, integrationData, getStatusClass, handleOpenModal, embedToken, params, handleRemoveEmbed, handleChangePreTool, name]);

  return <>{renderEmbed}</>;
};

export default RenderEmbed;