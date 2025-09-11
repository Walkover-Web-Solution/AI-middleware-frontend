import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction, updateFuntionApiAction } from '@/store/action/bridgeAction';
import { getStatusClass, openModal } from '@/utils/utility';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { MODAL_TYPE } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import InfoTooltip from '@/components/InfoTooltip';

const PreEmbedList = ({ params, searchParams }) => {
    const [preFunctionData, setPreFunctionData] = useState(null);
    const [preFunctionId, setPreFunctionId] = useState(null);
    const [preFunctionName, setPreFunctionName] = useState(null);
    const [preToolData, setPreToolData] = useState(null);
    const { integrationData, function_data, bridge_pre_tools, shouldToolsShow, model, embedToken } = useCustomSelector((state) => {
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
        };
    });
    const dispatch = useDispatch();
    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data, params]);
    const handleOpenModal = (functionId) => {
        setPreFunctionId(functionId);
        setPreFunctionName(function_data?.[functionId]?.function_name || function_data?.[functionId]?.endpoint);
        setPreToolData(function_data?.[functionId]);
        setPreFunctionData(function_data?.[functionId]);
        openModal(MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL)
    }

    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id],
            version_id: searchParams?.version
        }))
    }

    const removePreFunction = () => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [],
            version_id: searchParams?.version
        }))
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
    };

    return (bridge_pre_tools?.length > 0 ?
        <div>
            <FunctionParameterModal
                name="Pre Tool"
                functionId={preFunctionId}
                Model_Name={MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL}
                embedToken={embedToken}
                handleRemove={removePreFunction}
                handleSave={handleSavePreFunctionData}
                toolData={preToolData}
                setToolData={setPreToolData}
                function_details={preFunctionData}
                functionName={preFunctionName}
            />
            <div className="form-control inline-block">
                <div className='flex gap-5 items-center ml-2 '>
                    <InfoTooltip tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">
                        <p className="label-text font-medium whitespace-nowrap info">Pre Tool</p>
                    </InfoTooltip>
                </div>
                <div className="label flex-col items-start">
                    
                        <div className="flex flex-wrap gap-4">
                            <RenderEmbed
                                bridgeFunctions={bridgePreFunctions}
                                integrationData={integrationData}
                                getStatusClass={getStatusClass}
                                handleOpenModal={handleOpenModal}
                                embedToken={embedToken}
                                params={params}
                                name="preFunction"
                            />
                        </div>
                </div>
            </div>
        </div> :
        (
            <div className='flex'>
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
        )
    );
}

export default PreEmbedList