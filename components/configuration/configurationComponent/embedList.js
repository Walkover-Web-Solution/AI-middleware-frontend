import { useCustomSelector } from '@/customSelector/customSelector';
import { CircleAlert, Plus } from 'lucide-react';
import React, { useMemo } from 'react';

const EmbedList = ({ params }) => {
    const { integrationData, bridge_tools, bridge_pre_tools } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData,
        bridge_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.tools || [],
        bridge_pre_tools: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.pre_tools || [],
    }))

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

    const renderEmbed = useMemo(() => (
        integrationData && (Object.values(integrationData))
            .filter(value => !bridge_pre_tools?.includes(value?.id))
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => {
                if (!a?.title) return 1;
                if (!b?.title) return -1;
                return a?.title?.localeCompare(b?.title); // Sort alphabetically based on title
            })
            .map((value) => (
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
            ))
    ), [integrationData, bridge_tools]);

    return (bridge_tools &&
        <div>
            <div className="form-control ">
                <div className="label flex-col mt-2 items-start">
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                    <button onClick={() => openViasocket()} className="btn btn-outline btn-sm mt-4"><Plus size={16} /> Add new Function</button>
                </div>
            </div>
        </div>
    );
};

export default EmbedList;