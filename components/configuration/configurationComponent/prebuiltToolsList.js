import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlertIcon, AddIcon, TrashIcon } from '@/components/Icons';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetPreBuiltToolTypeIcon } from '@/utils/utility';
import { truncate } from '@/components/historyPageComponents/assistFile';
import InfoTooltip from '@/components/InfoTooltip';

const PrebuiltToolsList = ({ params, searchParams }) => {
    const { prebuiltToolsData, toolsVersionData, service } = useCustomSelector((state) => ({
        prebuiltToolsData: state?.bridgeReducer?.prebuiltTools,
        toolsVersionData: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.built_in_tools,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service,
    }));
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };

    const handleAddTool = (item) => {
        dispatch(updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: { built_in_tools_data: { built_in_tools: item?.value, built_in_tools_operation: "1" } }
        }));
        // Close dropdown after selection
        setTimeout(() => {
            if (typeof document !== 'undefined') {
                document.activeElement?.blur?.();
            }
        }, 0);
    };

    const handleDeleteTool = (item) => {
        dispatch(updateBridgeVersionAction({
            versionId: searchParams?.version,
            dataToSend: { built_in_tools_data: { built_in_tools: item?.value } }
        }));
    };

    const renderTools = useMemo(() => (
        (Array.isArray(toolsVersionData) ? toolsVersionData : [])?.map((toolId) => {
            const item = prebuiltToolsData?.find(tool => tool.value === toolId);
            if (!item) return null;
            const missingDesc = !item?.description;
            return (
                <div
                    key={toolId}
                    className={`flex w-full mt-2 flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${missingDesc ? 'border-red-600' : ''} hover:bg-base-200 transition-colors duration-200`}
                >
                    <div className="p-2 w-full h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                {GetPreBuiltToolTypeIcon(item?.value, 16, 16)}
                                <span className="flex-1 min-w-0 text-[13px] sm:text-sm font-semibold text-base-content truncate">
                                    <div className="tooltip" data-tip={item?.name?.length > 24 ? item?.name : ''}>
                                        <span>{item?.name?.length > 24 ? `${item?.name.slice(0, 24)}...` : item?.name}</span>
                                        <span className={`shrink-0 inline-block rounded-full capitalize px-2 py-0 text-[10px] ml-2 font-medium border ${missingDesc ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                            {missingDesc ? 'Description Required' : 'Active'}
                                        </span>
                                    </div>
                                </span>
                                {missingDesc && <CircleAlertIcon color='red' size={16} />}
                            </div>
                            <p className="mt-1 text-[11px] sm:text-xs text-base-content/70 line-clamp-1">
                                {item?.description || 'A description is required for proper functionality.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center absolute right-1 top-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTool(item); }}
                            className="  shadow-none border-none outline-none pr-1 mt-3"
                            title="Remove"
                        >
                            <TrashIcon size={16} className=" hover:text-error" />
                        </button>
                    </div>
                </div>
            );
        })
    ), [toolsVersionData, prebuiltToolsData]);

    return (
        <div>
            <div className="label flex-col items-start p-0 w-full">
                <div className="dropdown dropdown-end w-full flex items-center">
                    <InfoTooltip tooltipContent={"This tool lets the AI fetch real-time info from the internet. It's useful for current events, fact-checking, and time-sensitive questions."}>
                        <p className="mb-2 label-text info">Prebuilt Tool</p>
                    </InfoTooltip>
                    <button
                        tabIndex={0}
                        className="ml-auto flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                    >
                        <AddIcon className="w-2 h-2" />
                        <span className="text-xs font-medium">Add</span>
                    </button>
                    <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high mt-48 px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                        <div className='flex flex-col gap-2 w-full'>
                            <li className="text-sm font-semibold disabled">Suggested Tools</li>
                            <input
                                type='text'
                                placeholder='Search Tools'
                                value={searchQuery}
                                onChange={handleInputChange}
                                className='input input-bordered w-full input-sm'
                            />
                            {(Array.isArray(prebuiltToolsData) ? prebuiltToolsData : [])
                                .filter(item =>
                                    item?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) &&
                                    !toolsVersionData?.includes(item?.value)
                                )
                                .map(item => (
                                    <li key={item?._id} onClick={() => handleAddTool(item)}>
                                        <div className="flex justify-between items-center w-full">
                                            <div className="flex items-center gap-2">
                                                {GetPreBuiltToolTypeIcon(item?.value, 16, 16)}
                                                {item?.name.length > 20 ? (
                                                    <div className="tooltip" data-tip={item?.name}>
                                                        {truncate(item?.name, 20)}
                                                    </div>
                                                ) : (
                                                    truncate(item?.name, 20)
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            }
                        </div>
                    </ul>
                </div>
                <div className="flex flex-col gap-2 w-full mb-2">
                    {renderTools}
                </div>
            </div>
        </div>
    );
};

export default PrebuiltToolsList;