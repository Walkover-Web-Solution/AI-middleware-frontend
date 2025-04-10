import { useCustomSelector } from '@/customHooks/customSelector';
import { CircleAlert, Plus, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { GetFileTypeIcon, GetPreBuiltToolTypeIcon, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { truncate } from '@/components/historyPageComponents/assistFile';

const PrebuiltToolsList = ({ params }) => {
    const { prebuiltToolsData, toolsVersionData, service } = useCustomSelector((state) => ({
        prebuiltToolsData: state?.prebuiltToolsReducer?.prebuiltToolsData?.[params?.org_id],
        toolsVersionData: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.built_in_tools,
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.service,
    }));
    const dispatch = useDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || "");
    };

    const handleAddTool = (item) => {
        dispatch(updateBridgeVersionAction({
            versionId: params.version,
            dataToSend: { built_in_tools_data: { built_in_tools: item?.value, built_in_tools_operation: "1" } }
        }));
    };

    const handleDeleteTool = (item) => {
        dispatch(updateBridgeVersionAction({
            versionId: params.version,
            dataToSend: { built_in_tools_data: { built_in_tools: item?.value } }
        }));
    };



    const renderTools = useMemo(() => (
        (Array.isArray(toolsVersionData) ? toolsVersionData : [])?.map((toolId) => {
            const item = prebuiltToolsData?.find(tool => tool.value === toolId);
            return item ? (
                <div key={toolId} className="flex w-[250px] flex-col items-start rounded-md border cursor-pointer bg-base-100 hover:bg-base-200 relative">
                    <div className="p-4 w-full h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    {GetPreBuiltToolTypeIcon(item?.value, 16, 16)}
                                    <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content pr-5">
                                        {item?.name}
                                    </h1>
                                </div>
                                <div className="flex gap-2 absolute top-2 right-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteTool(item);
                                        }}
                                        className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-red-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    {!item?.description && <CircleAlert color='red' size={16} />}
                                </div>
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                {item?.description || "A description is required for proper functionality."}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null;
        })
    ), [toolsVersionData, prebuiltToolsData]);

    if (service !== 'openai_response') {
        return null;
    }

    return (
        <div>
            <hr className="my-0 p-0 mb-4" />
            <div className="label flex-col items-start p-0">
                <div className="flex flex-wrap gap-4 mb-4">
                    {renderTools}
                </div>
                <div className="dropdown dropdown-right">
                    <button tabIndex={0} className="btn btn-outline btn-sm mt-0">
                        <Plus size={16} />Add Prebuilt Tool
                    </button>
                    <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-[9999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
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
            </div>
        </div>
    );
};

export default PrebuiltToolsList;