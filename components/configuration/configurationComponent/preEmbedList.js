import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction, updateBridgeVersionAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import { closeModal, getStatusClass, openModal } from '@/utils/utility';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { MODAL_TYPE } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import InfoTooltip from '@/components/InfoTooltip';
import { isEqual } from 'lodash';
import { AddIcon } from '@/components/Icons';

const PreEmbedList = ({ params, searchParams }) => {
    const [preFunctionData, setPreFunctionData] = useState(null);
    const [preFunctionId, setPreFunctionId] = useState(null);
    const [preFunctionName, setPreFunctionName] = useState(null);
    const [preToolData, setPreToolData] = useState(null);
    const [variablesPath, setVariablesPath] = useState({});
    const { integrationData, function_data, bridge_pre_tools, shouldToolsShow, model, embedToken, variables_path } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const orgData = state?.bridgeReducer?.org?.[params?.org_id];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            integrationData: orgData?.integrationData || {},
            function_data: orgData?.functionData || {},
            bridge_pre_tools: versionData?.pre_tools || [],
            modelType: modelTypeName,
            model: modelName,
            service: serviceName,
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
            embedToken: orgData?.embed_token,
            variables_path: versionData?.variables_path || {},
        };
    });
    const dispatch = useDispatch();
    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data, params]);
    const handleOpenModal = (functionId) => {
        setPreFunctionId(functionId);
        setPreFunctionName(function_data?.[functionId]?.function_name || function_data?.[functionId]?.endpoint);
        setPreToolData(function_data?.[functionId]);
        setPreFunctionData(function_data?.[functionId]);
        setVariablesPath(variables_path[preFunctionName] || {});
        openModal(MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL)
    }

    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id],
            version_id: searchParams?.version
        }));
        // Close dropdown after selection
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document.activeElement?.blur?.();
            }
        }, 0);
    }

    const removePreFunction = () => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [],
            version_id: searchParams?.version
        }))
        closeModal(MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL)
    }
    const handleSavePreFunctionData = () => {
        if (!isEqual(preToolData, preFunctionData)) {
            const { _id, ...dataToSend } = preToolData;
            dispatch(
                updateFuntionApiAction({
                    function_id: preFunctionId,
                    dataToSend: dataToSend,
                })
            );
            setPreToolData("");
        }
        if (!isEqual(variablesPath, variables_path[preFunctionName])) {
            dispatch(
                updateBridgeVersionAction({
                    bridgeId: params.id,
                    versionId: searchParams?.version,
                    dataToSend: { variables_path: { [preFunctionName]: variablesPath } },
                })
            );
        }
    };

    return (
        <>
            <div>
                <FunctionParameterModal
                    name="Pre Tool"
                    functionId={preFunctionId}
                    Model_Name={MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL}
                    embedToken={embedToken}
                    handleSave={handleSavePreFunctionData}
                    toolData={preToolData}
                    setToolData={setPreToolData}
                    function_details={preFunctionData}
                    functionName={preFunctionName}
                    variablesPath={variablesPath}
                    setVariablesPath={setVariablesPath}
                    variables_path={variables_path}
                />

                <div className="label flex-col items-start w-full">
                    <div className="dropdown dropdown-right w-full flex items-center">
                        {bridge_pre_tools.length > 0 ? (
                            <div className="flex items-center gap-1 flex-row mb-2">
                                <InfoTooltip tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">

                                    <p className="label-text info font-medium whitespace-nowrap">Pre Tool</p>
                                </InfoTooltip>
                                <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 ml-4">
                                    <AddIcon className="w-2 h-2" />
                                    <span className="text-xs font-medium">{bridge_pre_tools.length > 0 ? "change" : "Add"}</span>
                                </button>
                            </div>
                        ) : (
                            <InfoTooltip tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">


                                <button
                                tabIndex={0}
                                className=" flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2"
                            >
                                <AddIcon className="w-4 h-4" />
                                <p className="label-text font-medium whitespace-nowrap">Pre Tool</p>
                            </button>
                            </InfoTooltip>
                        )}
                        <EmbedListSuggestionDropdownMenu
                            params={params}
                            searchParams={searchParams}
                            name={"preFunction"}
                            hideCreateFunction={false}
                            onSelect={onFunctionSelect}
                            connectedFunctions={bridge_pre_tools}
                            shouldToolsShow={true}
                            modelName={model}
                        />
                    </div>
                    <div className="w-full">
                        <RenderEmbed
                            bridgeFunctions={bridgePreFunctions}
                            integrationData={integrationData}
                            getStatusClass={getStatusClass}
                            handleOpenModal={handleOpenModal}
                            embedToken={embedToken}
                            params={params}
                            name="preFunction"
                            handleRemoveEmbed={removePreFunction}
                        />
                    </div>


                </div>
            </div>
        </>
    );
}

export default PreEmbedList