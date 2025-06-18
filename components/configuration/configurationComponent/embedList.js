import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { openModal } from '@/utils/utility';
import { MODAL_TYPE, PROMPT_SUPPORTED_REASIONING_MODELS } from '@/utils/enums';
import RenderEmbed from './renderEmbed';

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
    const dispatch = useDispatch();
    const { integrationData, bridge_functions, function_data, modelType, model, shouldToolsShow, embedToken } = useCustomSelector((state) => {
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
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.configuration?.additional_parameters?.tools,
            embedToken: orgData?.embed_token,
        };
    });
    const handleOpenModal = (functionId) => {
        setFunctionId(functionId);
        openModal(MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL)
    }

    const bridgeFunctions = useMemo(() => bridge_functions.map((id) => function_data?.[id]), [bridge_functions, function_data]);
    const handleSelectFunction = (functionId) => {
        if (functionId) {
            // dispatch(updateBridgeAction({
            //     bridgeId: params.id,
            //     dataToSend: {
            //         functionData: {
            //             function_id: functionId,
            //             function_operation: "1"
            //         }
            //     }
            // }))
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

    if (modelType === 'reasoning') {
        return <></>;
    }

    return (bridge_functions &&
        <div>
            <FunctionParameterModal preFunction={false} functionId={functionId} params={params} Model_Name={MODAL_TYPE.TOOL_FUNCTION_PARAMETER_MODAL} />
            <div className="label flex-col items-start mb-2">
                {
                    shouldToolsShow &&
                    <div className="flex flex-wrap gap-4">
                        <RenderEmbed bridgeFunctions={bridgeFunctions} integrationData={integrationData} getStatusClass={getStatusClass} handleOpenModal={handleOpenModal} embedToken={embedToken} params={params} name="function" />
                    </div>
                }
            </div>
            <EmbedListSuggestionDropdownMenu name={"Function"} params={params} onSelect={handleSelectFunction} connectedFunctions={bridge_functions} shouldToolsShow={shouldToolsShow} modelName={model} />
        </div>
    );
};

export default EmbedList;