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

const EmbedList = ({ params }) => {
    const [functionId, setFunctionId] = useState(null);
    const [functionData, setfunctionData] = useState({});
    const [toolData, setToolData] = useState({});
    const [function_name, setFunctionName] = useState("");
    const [variablesPath, setVariablesPath] = useState({});
    const dispatch = useDispatch();
    const { integrationData, bridge_functions, function_data, modelType, model, shouldToolsShow, embedToken, variables_path } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
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
        setfunctionData(function_data?.[functionId]);
        setFunctionName(function_data?.[functionId]?.function_name || function_data?.[functionId]?.endpoint);
        setVariablesPath(variables_path[function_name] || {});
        openModal(MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL)

    }

    const bridgeFunctions = useMemo(() => bridge_functions.map((id) => function_data?.[id]), [bridge_functions, function_data]);
    const handleSelectFunction = (functionId) => {
        if (functionId) {
            dispatch(updateBridgeVersionAction({
                bridgeId: params.id,
                versionId: params.version,
                dataToSend: {
                    functionData: {
                        function_id: functionId,
                        function_operation: "1"
                    }
                }
            }))
        }
    };

    const handleRemoveFunctionFromBridge = () => {
        dispatch(
            updateBridgeVersionAction({
                bridgeId: params.id,
                versionId: params.version,
                dataToSend: {
                    functionData: {
                        function_id: functionId,
                        function_name: function_name,
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
            setToolData("");
        }
        if (!isEqual(variablesPath, variables_path[function_name])) {
            dispatch(
                updateBridgeVersionAction({
                    bridgeId: params.id,
                    versionId: params.version,
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
                params={params}
                Model_Name={MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL}
                embedToken={embedToken}
                handleRemove={handleRemoveFunctionFromBridge}
                handleSave={handleSaveFunctionData}
                toolData={toolData}
                setToolData={setToolData}
                function_details={functionData}
                variables_path={variables_path}
                functionName={function_name} 
                setVariablesPath={setVariablesPath}
                variablesPath={variablesPath}
            />
            <div className="label flex-col items-start mb-2">
                {
                    shouldToolsShow && bridgeFunctions.length > 0 &&
                    <>
                        <InfoTooltip video={ONBOARDING_VIDEOS.FunctionCreation}  tooltipContent="Tool calling lets LLMs use external tools to get real-time data and perform complex tasks.">
                            <p className="label-text mb-2 font-medium whitespace-nowrap info">Tools</p>
                        </InfoTooltip>
                        <div className="flex flex-wrap gap-4">
                            <RenderEmbed bridgeFunctions={bridgeFunctions} integrationData={integrationData} getStatusClass={getStatusClass} handleOpenModal={handleOpenModal} embedToken={embedToken} params={params} name="function" />
                        </div>
                    </>
                }
            </div>
            <EmbedListSuggestionDropdownMenu name={"Function"} params={params} onSelect={handleSelectFunction} connectedFunctions={bridge_functions} shouldToolsShow={shouldToolsShow} modelName={model} />
        </div>
    );
};

export default EmbedList;