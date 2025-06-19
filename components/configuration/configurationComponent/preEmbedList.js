import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction } from '@/store/action/bridgeAction';
import { getStatusClass } from '@/utils/utility';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';
import { MODAL_TYPE } from '@/utils/enums';
import RenderEmbed from './renderEmbed';
import InfoModel from '@/components/infoModel';

const PreEmbedList = ({ params }) => {
    const { integrationData, function_data, bridge_pre_tools, shouldToolsShow, model, embedToken } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
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
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.configuration?.additional_parameters?.tools,
            embedToken: orgData?.embed_token,
        };
    });
    const [functionId, setFunctionId] = useState(null);
    const dispatch = useDispatch();
    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data, params]);
    const handleOpenModal = (functionId) => {
        setFunctionId(functionId);
        openModal(MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL)
    }

    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id],
            version_id: params.version
        }))
    }




    return (bridge_pre_tools?.length > 0 ?
        <div>
            <FunctionParameterModal preFunction={true} functionId={functionId} params={params} Model_Name={MODAL_TYPE.PRE_FUNCTION_PARAMETER_MODAL} embedToken={embedToken} />
            <div className="form-control inline-block">
                <div className='flex gap-5 items-center ml-2 '>
                    <InfoModel tooltipContent="A prefunction prepares data before passing it to the main function for the GPT call.">
                        <p className="label-text font-medium whitespace-nowrap info">Pre Tool</p>
                    </InfoModel>
                </div>
                <div className="label flex-col items-start">
                    {shouldToolsShow &&
                        <div className="flex flex-wrap gap-4">
                            <RenderEmbed bridgeFunctions={bridgePreFunctions} integrationData={integrationData} getStatusClass={getStatusClass} handleOpenModal={handleOpenModal} embedToken={embedToken} params={params} name="preFunction" />
                        </div>}
                </div>
            </div>
        </div> :
        (
            <div className='flex'>
                <EmbedListSuggestionDropdownMenu params={params} name={"preFunction"} hideCreateFunction={false} onSelect={onFunctionSelect} connectedFunctions={bridge_pre_tools} shouldToolsShow={shouldToolsShow} modelName={model} />
            </div>
        )
    );
}

export default PreEmbedList