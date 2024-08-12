import { useCustomSelector } from '@/customSelector/customSelector';
import { updateApiAction } from '@/store/action/bridgeAction';
import { CircleAlert, Info, Trash2 } from 'lucide-react';
import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';

const PreEmbedList = ({ params }) => {
    const { integrationData, bridge_pre_tools, bridge_tools } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData,
        bridge_pre_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.pre_tools || [],
        bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
    }));
    const dispatch = useDispatch();

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
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

    const handleChangePreFunction = (e) => {
        const toolName = e.target.value;
        dispatch(updateApiAction(params.id, {
            "id": toolName,
            "preFunctionCall": true
        }))
    }

    const removePreFunction = (id) => {
        dispatch(updateApiAction(params.id, {
            "id": id,
            "preFunctionCall": false
        }))
    }

    const renderEmbed = useMemo(() => (
        integrationData && (Object.values(integrationData))
            .filter(value => bridge_pre_tools?.some(tool => tool === value?.id)) // Filter to only include items with ids in bridge_pre_tools
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => {
                if (!a?.title) return 1;
                if (!b?.title) return -1;
                return a?.title?.localeCompare(b?.title); // Sort alphabetically based on title
            })
            .map((value) => (
                <div className='flex flex-row gap-1'>
                    <div key={value?.id} id={value.id} className={`flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer bg-base-100 ${value?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200 `} onClick={() => openViasocket(value?.id)}>
                        <div className="p-4 ">
                            <div className="flex justify-between items-center">
                                <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full text-base-content">
                                    {value.title}
                                </h1>
                                {value?.description?.trim() === "" && <CircleAlert color='red' size={16} />}
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                {value.description ? value.description : "A description is required for proper functionality."}
                            </p>
                            <div className="mt-4">
                                <span className={`mr-2 inline-block rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(value?.status)}`}>
                                    {value?.description?.trim() === "" ? "Description Required" : value.status}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className='p-2 cursor-pointer' onClick={() => removePreFunction(value?.id)}>
                        <Trash2 size={16} />
                    </div>
                </div>
            ))
    ), [integrationData, bridge_pre_tools]);

    if (!bridge_tools?.length && !bridge_pre_tools?.length) {
        return null;
    }
    return (bridge_pre_tools?.length > 0 ?
        <div>
            <div className="form-control inline-block">
                <label className='label-text'>Pre functions</label>
                <div className="label flex-col mt-2 items-start">
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                </div>
                <p role='alert' className='label-text-alt mt-2 alert p-2'><Info size={16} />Use pre_function variable to use this function data. &#123;&#123;pre_function&#125;&#125;</p>
            </div>
        </div> :
        (
            <div className='flex flex-col gap-2'>
                <label className='label-text'>Select Pre functions</label>
                <select
                    className="select select-bordered select-sm max-w-[200px]"
                    name='pre_tools'
                    onChange={handleChangePreFunction}
                >
                    <option disabled selected>Select tool</option>
                    {bridge_tools?.map((option, index) => (
                        <option key={index} value={option?.name}>
                            {integrationData?.[option?.name]?.title}
                        </option>
                    ))}
                </select>
            </div>
        )
    );
}

export default PreEmbedList