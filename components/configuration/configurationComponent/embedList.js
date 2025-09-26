import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE, ONBOARDING_VIDEOS } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import { isEqual } from 'lodash';
import InfoTooltip from '@/components/InfoTooltip';
import { AddIcon } from '@/components/Icons';

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
    const { integrationData, bridge_functions, function_data, modelType, model, shouldToolsShow, embedToken, variables_path } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const orgData = state?.bridgeReducer?.org?.[params?.org_id];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            integrationData: orgData?.integrationData || {},
            function_data: orgData?.functionData || {},
            bridge_functions: versionData?.function_ids || [],
            modelType: modelTypeName,
            model: modelName,
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
            embedToken: orgData?.embed_token,
            variables_path: versionData?.variables_path || {},
        };
    });
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

    const handleRemoveFunctionFromBridge = (id,name) => {
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
            closeModal(MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL);
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
            // Do not clear toolData; let Redux update propagate the latest value
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

    return (bridge_functions &&
        <div>
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
                        <div className="dropdown dropdown-bottom w-full flex items-center">
                            <InfoTooltip video={ONBOARDING_VIDEOS.FunctionCreation} tooltipContent="Tool calling lets LLMs use external tools to get real-time data and perform complex tasks.">
                                <p className="label-text mb-2 font-medium whitespace-nowrap info">Tools</p>
                            </InfoTooltip>
                            <button
                                tabIndex={0}
                                className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                                disabled={!shouldToolsShow}
                            >
                                <AddIcon className="w-2 h-2" />
                                <span className="text-xs font-medium">Add</span>
                            </button>
                            <EmbedListSuggestionDropdownMenu
                                name={"Function"}
                                params={params}
                                searchParams={searchParams}
                                onSelect={handleSelectFunction}
                                connectedFunctions={bridge_functions}
                                shouldToolsShow={shouldToolsShow}
                                modelName={model}
                                asDropdownContent
                            />
                        </div>

                        {bridgeFunctions.length > 0 && (
                            <div className="flex flex-col gap-2 w-full">
                                <RenderEmbed bridgeFunctions={bridgeFunctions} integrationData={integrationData} getStatusClass={getStatusClass} handleOpenModal={handleOpenModal} embedToken={embedToken} params={params} name="function" handleRemoveEmbed={handleRemoveFunctionFromBridge} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EmbedList;