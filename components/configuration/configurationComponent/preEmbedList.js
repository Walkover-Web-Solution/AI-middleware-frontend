import { useCustomSelector } from '@/customHooks/customSelector';
import { updateApiAction } from '@/store/action/bridgeAction';
import { CircleAlert, Info, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import { getStatusClass } from '@/utils/utility';

const PreEmbedList = ({ params }) => {
    const { integrationData, bridge_pre_tools, function_data } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData,
        bridge_pre_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.pre_tools || [],
        function_data: state?.bridgeReducer?.org?.[params?.org_id]?.functionData || {},
    }));
    const dispatch = useDispatch();

    const bridgePreFunctions = useMemo(() => bridge_pre_tools.map((id) => function_data?.[id]), [bridge_pre_tools, function_data]);

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
                        <div className="p-4 w-full" onClick={() => openViasocket(functionName)}>
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
    ), [bridgePreFunctions, integrationData, getStatusClass]);

    const onFunctionSelect = (id) => {
        dispatch(updateApiAction(params.id, {
            pre_tools: [id]
        }))
    }
    const removePreFunction = () => {
        dispatch(updateApiAction(params.id, {
            pre_tools: []
        }))
    }

    if (Object.keys(function_data).length === 0) {
        return null;
    }
    return (bridge_pre_tools?.length > 0 ?
        <div>
            <div className="form-control inline-block">
                <div className='flex gap-5 items-center ml-2 '>
                <label className='label-text font-medium whitespace-nowrap'>Pre functions</label>
                <p role='alert' className='label-text-alt alert p-2'><Info size={16} />Use pre_function variable to use this function data. &#123;&#123;pre_function&#125;&#125;</p>
                </div>
                <div className="label flex-col items-start">
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                </div>
            </div>
        </div> :
        (
            <div className='flex'>
                <EmbedListSuggestionDropdownMenu params={params} name={"Select Pre function"} hideCreateFunction={true} onSelect={onFunctionSelect} connectedFunctions={bridge_pre_tools} />
            </div>
        )
    );
}

export default PreEmbedList