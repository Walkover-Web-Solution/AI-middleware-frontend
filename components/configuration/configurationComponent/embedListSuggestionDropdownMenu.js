import { useCustomSelector } from '@/customSelector/customSelector';
import { getStatusClass } from '@/utils/utility';
import { Plus } from 'lucide-react';
import React, { useMemo } from 'react';

function EmbedListSuggestionDropdownMenu({ params, name, hideCreateFunction = false, onSelect = () => { }, connectedFunctions = [] }) {
    const { integrationData, function_data } = useCustomSelector((state) => ({
        integrationData: state?.bridgeReducer?.org?.[params?.org_id]?.integrationData,
        function_data: state?.bridgeReducer?.org?.[params?.org_id]?.functionData,
    }))

    const handleItemClick = (id) => {
        onSelect(id); // Assuming onSelect is a function you've defined elsewhere
    };
    const renderEmbedSuggestions = useMemo(() => (
        function_data && (Object.values(function_data))
            // .filter(value => !bridge_pre_tools?.includes(value?._id))
            // .filter(value => !(connectedFunctions || [])?.includes(value?._id))
            .filter(value => {
                const title = integrationData[value?.endpoint]?.title || integrationData[value?.function_name]?.title;
                return title !== undefined && !(connectedFunctions || [])?.includes(value?._id);
            })
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
                const status = integrationData?.[functionName]?.status;
                const title = integrationData?.[functionName]?.title || 'Untitled';

                return (
                    <li key={value?._id} onClick={() => handleItemClick(value?._id)}>
                        <div className="flex justify-between items-center w-full">
                            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                {title}
                            </p>
                            <div>
                                <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(status)}`}>
                                    {value?.description?.trim() === "" ? "Ongoing" : status}
                                </span>
                            </div>
                        </div>
                    </li>
                )
            }
            )
    ), [integrationData, function_data, getStatusClass, connectedFunctions]);

    return (
        <div className="dropdown dropdown-right">
            <button tabIndex={0}
                className="btn btn-outline btn-sm mt-4"><Plus size={16} />{name || "Connect function"}</button>
            <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-[9999999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-0">
                <div className='flex flex-col gap-2 w-full'>
                    <li className="text-sm font-semibold disabled">Suggested Functions</li>
                    {renderEmbedSuggestions}
                    {!hideCreateFunction && <li className="mt-2 border-t w-full sticky bottom-0 bg-white py-2" onClick={() => openViasocket()}>
                        <div>
                            <Plus size={16} /><p className='font-semibold'>Add new Function</p>
                        </div>
                    </li>}
                </div>
            </ul>
        </div>
    )
}

export default EmbedListSuggestionDropdownMenu