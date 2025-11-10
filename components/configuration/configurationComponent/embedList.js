
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import useTutorialVideos from '@/hooks/useTutorialVideos';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import { isEqual } from 'lodash';
import InfoTooltip from '@/components/InfoTooltip';
import { AddIcon, CircleAlertIcon, EllipsisVerticalIcon, TrashIcon, SettingsIcon } from '@/components/Icons';
import { GetPreBuiltToolTypeIcon } from '@/utils/utility';
import DeleteModal from '@/components/UI/DeleteModal';
import PrebuiltToolsConfigModal from '@/components/modals/prebuiltToolsConfigModal';

function getStatusClass(status) {
  switch (status?.toString().trim().toLowerCase()) {
    case 'drafted':
      return 'bg-yellow-100';
    case 'paused':
      return 'bg-red-100';
    case 'active':
    case 'published':
      return 'bg-green-100';
    case 'rejected':
      return 'bg-gray-100';
    // Add more cases as needed
    default:
      return 'bg-gray-100';
  }
};

const EmbedList = ({ params, searchParams }) => {
  const [functionId, setFunctionId] = useState(null);
  const [functionData, setfunctionData] = useState({});
  const [toolData, setToolData] = useState({});
  const [function_name, setFunctionName] = useState("");
  const [variablesPath, setVariablesPath] = useState({});
  const dispatch = useDispatch();
  const { integrationData, bridge_functions, function_data, modelType, model, shouldToolsShow, embedToken, variables_path, prebuiltToolsData, toolsVersionData, showInbuiltTools, isFirstFunction, prebuiltToolsFilters } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
    const orgData = state?.bridgeReducer?.org?.[params?.org_id];
    const modelReducer = state?.modelReducer?.serviceModels;
    const serviceName = versionData?.service;
    const modelTypeName = versionData?.configuration?.type?.toLowerCase();
    const modelName = versionData?.configuration?.model;
    const currentUser = state.userDetailsReducer.userDetails;
    return {
      integrationData: orgData?.integrationData || {},
      function_data: orgData?.functionData || {},
      bridge_functions: versionData?.function_ids || [],
      modelType: modelTypeName,
      model: modelName,
      shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
      showInbuiltTools: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.inbuilt_tools,
      embedToken: orgData?.embed_token,
      variables_path: versionData?.variables_path || {},
      prebuiltToolsData: state?.bridgeReducer?.prebuiltTools,
      toolsVersionData: versionData?.built_in_tools,
      isFirstFunction: currentUser?.meta?.onboarding?.FunctionCreation,
      prebuiltToolsFilters: versionData?.web_search_filters || [],
    };
  });
  // Use the tutorial videos hook
  const { getFunctionCreationVideo, tutorialData } = useTutorialVideos();
     const [tutorialState, setTutorialState] = useState({
          showTutorial: false,
          showSuggestion: false
      });
  const handleTutorial = () => {
          setTutorialState(prev => ({
              ...prev,
              showSuggestion: isFirstFunction
          }));
      };
  const handleOpenModal = (functionId) => {
    setFunctionId(functionId);
    const fn = function_data?.[functionId];
    setfunctionData(fn);
    setToolData(fn);
    const fnName = fn?.function_name || fn?.endpoint;
    setFunctionName(fnName);
    setVariablesPath(variables_path[fnName] || {});
    openModal(MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL)

  }
  const [selectedPrebuiltTool, setSelectedPrebuiltTool] = useState(null);
  const handleOpenDeleteModal = (functionId, functionName) => {
    setFunctionId(functionId);
    setFunctionName(functionName);
    openModal(MODAL_TYPE.DELETE_TOOL_MODAL);
  };
  const handleOpenDeletePrebuiltModal = (item) => {
    setSelectedPrebuiltTool(item);
    openModal(MODAL_TYPE.DELETE_PREBUILT_TOOL_MODAL);
  };
  const bridgeFunctions = useMemo(() => bridge_functions.map((id) => function_data?.[id]), [bridge_functions, function_data]);
  const handleSelectFunction = (functionId) => {
    if (functionId) {
      dispatch(updateBridgeVersionAction({
        bridgeId: params.id,
        versionId: searchParams?.version,
        dataToSend: {
          functionData: {
            function_id: functionId,
            function_operation: "1"
          }
        }
      }))
    }
  };

  const handleRemoveFunctionFromBridge = (id, name) => {
    dispatch(
      updateBridgeVersionAction({
        bridgeId: params.id,
        versionId: searchParams?.version,
        dataToSend: {
          functionData: {
            function_id: id,
            function_name: name,
          },
        },
      })
    ).then(() => {
      closeModal(MODAL_TYPE.DELETE_TOOL_MODAL);
    });
  };

  const handleSaveFunctionData = () => {
    if (!isEqual(toolData, functionData)) {
      const { _id, ...dataToSend } = toolData;
      dispatch(
        updateFuntionApiAction({
          function_id: functionId,
          dataToSend: dataToSend,
        })
      );
      setToolData("");
    }
    if (!isEqual(variablesPath, variables_path[function_name])) {
      dispatch(
        updateBridgeVersionAction({
          bridgeId: params.id,
          versionId: searchParams?.version,
          dataToSend: { variables_path: { [function_name]: variablesPath } },
        })
      );
    }
  };

  // Handle adding a prebuilt tool into built_in_tools from the Tools dropdown
  const handleAddPrebuiltTool = (item) => {
    if (!item?.value) return;
    dispatch(updateBridgeVersionAction({
      versionId: searchParams?.version,
      dataToSend: { built_in_tools_data: { built_in_tools: item?.value, built_in_tools_operation: "1" } }
    }));
    // Close dropdown after selection
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.activeElement?.blur?.();
      }
    }, 0);
  };

  // Handle removing a prebuilt tool from built_in_tools
  const handleDeletePrebuiltTool = (item,name) => {
    if (!item?.value) return;
    dispatch(updateBridgeVersionAction({
      versionId: searchParams?.version,
      dataToSend: { built_in_tools_data: { built_in_tools: item?.value } }
    }));
    closeModal(MODAL_TYPE.DELETE_PREBUILT_TOOL_MODAL);
  };

  // Handle opening prebuilt tools configuration modal
  const handleOpenPrebuiltConfig = () => {
    openModal(MODAL_TYPE.PREBUILT_TOOLS_CONFIG_MODAL);
  };

  // Handle saving prebuilt tools configuration
  const handleSavePrebuiltConfig = async (domains) => {
    try {
      await dispatch(updateBridgeVersionAction({
        bridgeId: params?.id,
        versionId: searchParams?.version,
        dataToSend: {
          
            web_search_filters: domains
        
        }
      }));
    } catch (error) {
      console.error('Error saving prebuilt tools configuration:', error);
      throw error;
    }
  };

  // Compute selected prebuilt tools (to render cards)
  const selectedPrebuiltTools = useMemo(() => {
    const byId = new Map((prebuiltToolsData || []).map(t => [t.value, t]));
    return (Array.isArray(toolsVersionData) ? toolsVersionData : [])
      .map(id => byId.get(id))
      .filter(Boolean);
  }, [prebuiltToolsData, toolsVersionData]);
  return (bridge_functions &&
    <div>
      <DeleteModal
        onConfirm={handleRemoveFunctionFromBridge}
        item={functionId}
        name={function_name}
        title="Are you sure?"
        description={"This action Remove the selected Tool from the Agent."}
        buttonTitle="Remove Tool"
        modalType={MODAL_TYPE.DELETE_TOOL_MODAL}
      />
      <DeleteModal
        onConfirm={handleDeletePrebuiltTool}
        item={selectedPrebuiltTool}
        name={"Prebuilt Tool"}
        title="Are you sure?"
        description={"This action Remove the selected Prebuilt Tool from the Agent."}
        buttonTitle="Remove Prebuilt Tool"
        modalType={MODAL_TYPE.DELETE_PREBUILT_TOOL_MODAL}
      />
      <FunctionParameterModal
        name="Tool"
        functionId={functionId}
        Model_Name={MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL}
        embedToken={embedToken}
        handleSave={handleSaveFunctionData}
        toolData={toolData}
        setToolData={setToolData}
        function_details={functionData}
        variables_path={variables_path}
        functionName={function_name}
        setVariablesPath={setVariablesPath}
        variablesPath={variablesPath}
      />
      <div className="label flex-col items-start  w-full p-0">
        {shouldToolsShow && (
          <>
            <div className="dropdown dropdown-right w-full flex items-center">
              {(bridgeFunctions?.length > 0 || selectedPrebuiltTools.length > 0) ? (
                <>
                  <InfoTooltip video={getFunctionCreationVideo()} tooltipContent="Tool calling lets LLMs use external tools to get real-time data and perform complex tasks.">
                    <p className="label-text mb-2 font-medium whitespace-nowrap info">Tools</p>
                  </InfoTooltip>
                  <button
                    tabIndex={0}
                    className="ml-4 flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                    disabled={!shouldToolsShow}
                  >
                    <AddIcon className="w-2 h-2" />
                    <span className="text-xs font-medium">Add</span>
                  </button>
                </>
              ) : (
                <InfoTooltip video={getFunctionCreationVideo()} tooltipContent="Tool calling lets LLMs use external tools to get real-time data and perform complex tasks.">


                  <button
                    tabIndex={0}
                    className=" flex items-center gap-1 px-3 py-1 mt-2 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2"
                    onClick={handleTutorial}
                  >
                    <AddIcon className="w-2 h-2" />
                    <p className="label-text text-sm whitespace-nowrap">Tool</p>
                  </button>
                </InfoTooltip>
              )}
              <EmbedListSuggestionDropdownMenu
                name={"Function"}
                params={params}
                searchParams={searchParams}
                onSelect={handleSelectFunction}
                onSelectPrebuiltTool={handleAddPrebuiltTool}
                connectedFunctions={bridge_functions}
                shouldToolsShow={shouldToolsShow}
                modelName={model}
                asDropdownContent
                prebuiltToolsData={prebuiltToolsData}
                toolsVersionData={toolsVersionData}
                showInbuiltTools={showInbuiltTools}
                tutorialState={tutorialState}
                setTutorialState={setTutorialState}
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              {bridgeFunctions.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <RenderEmbed bridgeFunctions={bridgeFunctions} integrationData={integrationData} getStatusClass={getStatusClass} handleOpenModal={handleOpenModal} embedToken={embedToken} params={params} name="function" handleRemoveEmbed={handleRemoveFunctionFromBridge} handleOpenDeleteModal={handleOpenDeleteModal} />
                </div>
              )}

              {/* Render selected Prebuilt Tools below functions */}
              {selectedPrebuiltTools.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  {selectedPrebuiltTools.map((item) => {
                    const missingDesc = !item?.description;
                    const isNotSupported = !showInbuiltTools || (Array.isArray(showInbuiltTools) ? !showInbuiltTools.includes(item?.value) : !showInbuiltTools[item?.value]);
                    const hasIssue = missingDesc || isNotSupported;
                    
                    return (
                      <div
                        key={item?.value}
                        className={`group flex w-full flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${hasIssue ? 'border-red-600' : ''} hover:bg-base-200 transition-colors duration-200`}
                      >
                        
                        <div className="p-2 w-full h-full flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {GetPreBuiltToolTypeIcon(item?.value, 16, 16)}
                              <span className="flex-1 min-w-0 text-[13px] sm:text-sm font-semibold text-base-content truncate">
                                <div className="tooltip" data-tip={item?.name?.length > 24 ? item?.name : ''}>
                                  <span>{item?.name?.length > 24 ? `${item?.name.slice(0, 24)}...` : item?.name}</span>
                                  <span className={`shrink-0 inline-block rounded-full capitalize px-2 py-0 text-[10px] ml-2 font-medium border ${
                                    isNotSupported 
                                      ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                      : missingDesc 
                                        ? 'bg-red-100 text-red-700 border-red-200' 
                                        : 'bg-green-100 text-green-700 border-green-200'
                                  }`}>
                                    {isNotSupported ? 'Not Supported' : missingDesc ? 'Description Required' : 'Active'}
                                  </span>
                                </div>
                              </span>
                            </div>
                            <p className="mt-1 text-[11px] sm:text-xs text-base-content/70 line-clamp-1">
                              {isNotSupported 
                                ? `Model doesn't support ${item?.name} tool` 
                                : item?.description || 'A description is required for proper functionality.'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                          {item?.value === "web_search" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPrebuiltConfig();
                              }}
                              className="btn btn-ghost btn-sm p-1 hover:bg-base-300"
                              title="Config"
                            >
                              <SettingsIcon size={16} />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDeletePrebuiltModal(item)
                            }}
                            className="btn btn-ghost btn-sm p-1 hover:bg-red-100 hover:text-error"
                            title="Remove"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Prebuilt Tools Configuration Modal */}
      <PrebuiltToolsConfigModal
        initialDomains={prebuiltToolsFilters}
        onSave={handleSavePrebuiltConfig}
      />
    </div>
  );
};

export default EmbedList;
