import React, { useMemo } from 'react';
import { SettingsIcon, TrashIcon, RefreshIcon, SquareFunctionIcon } from '@/components/Icons';
import { truncate } from '@/components/historyPageComponents/AssistFile';
import useExpandableList from '@/customHooks/useExpandableList';

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
  name,
  halfLength = 1,
  isPublished,
  isEditor = true
}) => {
  // Determine if content is read-only (either published or user is not an editor)
  const isReadOnly = isPublished || !isEditor;
  // Sort functions first
  const sortedFunctions = useMemo(() => {
    return bridgeFunctions?.slice()
      .sort((a, b) => {
        const aFnName = a?.function_name || a?.endpoint;
        const bFnName = b?.function_name || b?.endpoint;
        const aTitle = a?.title || integrationData?.[aFnName]?.title;
        const bTitle = b?.title || integrationData?.[bFnName]?.title;
        if (!aTitle) return 1;
        if (!bTitle) return -1;
        return aTitle?.localeCompare(bTitle);
      }) || [];
  }, [bridgeFunctions, integrationData]);

  // Use expandable list hook
  const { displayItems, isExpanded, toggleExpanded, shouldShowToggle, hiddenItemsCount } = useExpandableList(sortedFunctions, halfLength);

  const renderEmbed = useMemo(() => {
    const embedItems = displayItems?.map((value) => {
        const functionName = value?.function_name || value?.endpoint;
        const title = value?.title || integrationData?.[functionName]?.title;

        return (
          <div
            key={value?._id}
            id={value?._id}
            className={`group flex items-center rounded-md border border-base-300 cursor-pointer bg-base-200 relative min-h-[44px] w-full ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-300 transition-colors duration-200`}
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
              <div className="flex items-center gap-2 w-full">
                <SquareFunctionIcon size={16} className="shrink-0" />
                {title?.length > 24 ? (
                  <div className="tooltip tooltip-top min-w-0" data-tip={title}>
                    <span className="min-w-0 text-sm truncate">
                      <span className="text-sm font-normal block w-full">{truncate(title, 24)}</span>
                    </span>
                  </div>
                ) : (
                  <span className="min-w-0 text-sm truncate">
                    <span className="text-sm font-normal block w-full">{truncate(title, 24)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action buttons that appear on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 pr-2 flex-shrink-0">
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
                  disabled={isReadOnly}
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
                disabled={isReadOnly}
              >
                <TrashIcon size={16} />
              </button>
            </div>
          </div>
        );
      });

    return (
      <div className="w-full">
        <div className={`grid gap-2 w-full`}>
          {embedItems}
        </div>
      </div>
    );
  }, [displayItems, integrationData, getStatusClass, handleOpenModal, embedToken, params, handleRemoveEmbed, handleChangePreTool, name, shouldShowToggle, isExpanded, toggleExpanded, hiddenItemsCount]);

  return renderEmbed;
};

export default RenderEmbed;
