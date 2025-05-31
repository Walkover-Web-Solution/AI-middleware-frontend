import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction } from '@/store/action/bridgeAction';
import { getStatusClass } from '@/utils/utility';
import { CircleAlert, Info, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';

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
    const dispatch = useDispatch();
    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data, params]);

    const renderEmbed = useMemo(() => (
        bridgePreFunctions && bridgePreFunctions
            // .filter(value => !bridge_pre_tools?.includes(value?._id))
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => {
                const aTitle = integrationData[a?.endpoint]?.title || integrationData[a?.function_name]?.title;
                const bTitle = integrationData[b?.endpoint]?.title || integrationData[b?.function_name]?.title;
                if (!aTitle) return 1;
                if (!bTitle) return -1;

                return aTitle?.localeCompare(bTitle); // Sort alphabetically based on title
            })
            .map((value) => {
                const functionName = value?.function_name || value?.endpoint;
                const title = integrationData?.[functionName]?.title;
                const status = integrationData?.[functionName]?.status;

                return (
                    <div key={value?._id} id={value?._id} className={`flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer bg-base-100 relative ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 `}>
                        <div className="p-4 w-full" onClick={() => openViasocket(functionName,{embedToken, meta: {
                                type: 'tool',
                                bridge_id: params?.id,
                            }})}>
                            <div className="flex justify-between items-center">
                                <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full text-base-content">
                                    {title}
                                </h1>
                                {value?.description?.trim() === "" && <CircleAlert color='red' size={16} />}
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                {value?.description || value?.api_description || value?.short_description || "A description is required for proper functionality."}
                            </p>
                            <div className="mt-4">
                                <span className={`mr-2 inline-block rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(status)}`}>
                                    {!(value?.description || value?.api_description || value?.short_description) ? "Description Required" : status}
                                </span>
                            </div>
                        </div>
                        <div className='p-2 cursor-pointer' onClick={() => removePreFunction(value?.id)}>
                            <Trash2 size={16} />
                        </div>
                    </div>
                )
            }
            )
    ), [bridgePreFunctions, integrationData, getStatusClass, params]);

    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id],
            version_id: params.version
        }))
    }
    const removePreFunction = () => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [],
            version_id: params.version
        }))
    }

    if (Object.keys(function_data).length === 0) {
        return null;
    }

    return (bridge_pre_tools?.length > 0 ?
        <div>
            <div className="form-control inline-block">
                <div className='flex items-center ml-2 '>
                    <label className='label-text font-medium whitespace-nowrap'>Pre functions</label>
                       <div
                className="tooltip tooltip-right"
                data-tip={
                  "A prefunction prepares data before passing it to the main function for the GPT call."
                }
              >
                <Info size={14} className="ml-2" />
              </div>
                </div>
                
                <div className="label flex-col items-start">
                    {shouldToolsShow &&
                        <div className="flex flex-wrap gap-4">
                            {renderEmbed}
                        </div>}
                </div>
            </div>
        </div> :
        (
            <div className='flex'>
                <EmbedListSuggestionDropdownMenu params={params} name={"Select Pre function"} hideCreateFunction={true} onSelect={onFunctionSelect} connectedFunctions={bridge_pre_tools} shouldToolsShow={shouldToolsShow} modelName={model} />
           </div>
        )
    );
}

export default PreEmbedList