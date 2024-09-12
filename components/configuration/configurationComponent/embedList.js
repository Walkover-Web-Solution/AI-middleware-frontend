import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import { CircleAlert, Settings } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import EmbedListSuggestionDropdownMenu from './embedListSuggestionDropdownMenu';
import FunctionParameterModal from './functionParameterModal';

function getStatusClass (status) {
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
    const { integrationData, bridge_functions, function_data } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData || {},
        function_data: state?.bridgeReducer?.org?.[params?.org_id]?.functionData || {},
        bridge_functions: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.function_ids || [],
    }));

    const handleOpenModal = (functionId) => {
        setFunctionId(functionId);
        const modal = document.getElementById('function-parameter-modal');
        if (modal) {
            modal.showModal();
        }
    }

    const bridgeFunctions = useMemo(() => bridge_functions.map((id) => function_data?.[id]), [bridge_functions, function_data]);

    const renderEmbed = useMemo(() => (
        bridgeFunctions && bridgeFunctions
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
                        <div className="p-4 w-full h-full flex flex-col justify-between" onClick={() => openViasocket(functionName)}>
                           <div>
                                <div className="flex justify-between items-center">
                                    <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content">
                                        {title}
                                    </h1>
                                    {value?.description?.trim() === "" && <CircleAlert color='red' size={16} />}
                                </div>
                                <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                    {value?.description || value?.api_description || value?.short_description || "A description is required for proper functionality."}
                                </p>
                           </div>
                            <div className="mt-4">
                                <span className={`mr-2 inline-block rounded-full capitalize px-3 bg-base-200 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(status)}`}>
                                    {!(value?.description || value?.api_description || value?.short_description) ? "Description Required" : status}
                                </span>
                            </div>
                        </div>
                        {status?.toString()?.toLowerCase() !== 'paused' && <div className="dropdown shadow-none border-none absolute right-1 top-1">
                            <div role="button" className="btn bg-transparent shadow-none border-none outline-none hover:bg-base-200" onClick={() => handleOpenModal(value?._id)}>
                                <Settings size={18} />
                            </div>
                        </div>}
                    </div>
                )
            }
            )
    ), [integrationData, bridgeFunctions, getStatusClass]);

    const handleSelectFunction = (functionId) => {
        if (functionId) {
            dispatch(updateBridgeAction({
                bridgeId: params.id,
                dataToSend: {
                    functionData: {
                        function_id: functionId,
                        function_operation: "1"
                    }
                }
            }))
        }
    }

    return (bridge_functions &&
        <div>
            <FunctionParameterModal functionId={functionId} params={params} />
            <div className="form-control ">
                <div className="label flex-col mt-2 items-start">
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                    <EmbedListSuggestionDropdownMenu params={params} onSelect={handleSelectFunction} connectedFunctions={bridge_functions} />
                </div>
            </div>
        </div>
    );
};

export default EmbedList;