import React, { useMemo } from 'react';
import { CircleAlert, Plus } from 'lucide-react';
import { useCustomSelector } from '@/customSelector/customSelector';

const EmbedList = ({ params }) => {

    const { integrationData, bridge } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData?.flows,
        bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],

    }))

    const renderEmbed = useMemo(() => (
        integrationData && integrationData
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => a.title.localeCompare(b.title)) // Sort alphabetically based on title
            .map((value) => (
                <div key={value?.id} className='w-[250px] cursor-pointer' onClick={() => openViasocket(value?.id)}>
                    <div className={`rounded-md border ${value.description.trim() === "" ? "border-red-600" : ""}`}>
                        <div className="p-4">
                            <div className="flex justify-between items-center">
                                <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full">
                                    {value.title}
                                </h1>
                                {value.description.trim() === "" && <CircleAlert color='red' size={16} />}
                            </div>
                            <p className="mt-3 text-xs sm:text-sm text-gray-600 line-clamp-3">
                                {value.description ? value.description : "A description is required for proper functionality."}
                            </p>
                            <div className="mt-4">
                                <span className="mr-2 inline-block rounded-full capitalize bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-900">
                                    {value.description.trim() === "" ? "Description Required" : value.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))
    ), [integrationData]);

    return (bridge?.configuration?.tools &&
        <div>
            <div className="form-control w-full">
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