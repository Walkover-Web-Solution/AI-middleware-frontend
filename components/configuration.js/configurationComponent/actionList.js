import { useCustomSelector } from '@/customSelector/customSelector';
import { createOrRemoveActionBridge } from '@/store/action/chatBotAction';
import { Trash } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ActionModel from './actionModel';

export default function ActionList({ params }) {
    const { action, bridgeType } = useCustomSelector((state) => ({
        action: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.actions,
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType
    }));

    const dispatch = useDispatch();
    const [selectedKey, setSelectedKey] = useState(null);

    const handleRemoveAction = useCallback((actionId, type, description, data, e) => {
        e.stopPropagation();
        const dataToSend = {
            actionId,
            actionJson: {
                description,
                type,
                ...(type === 'Frontend' && { data })
            }
        };

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id,
            bridgeId: params?.id,
            type: "remove",
            dataToSend
        }));
    }, [dispatch, params]);

    return (
        bridgeType === "chatbot" && (
            <div className="form-control">
                <p className='text-xl font-medium'>Action</p>
                <div className='flex flex-wrap gap-4'>
                    {action && Object.entries(action).sort().map(([key, value]) => (
                        <div
                            key={key}
                            className="flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer"
                            onClick={() => {
                                setSelectedKey(key);
                                document.getElementById('actionModel').showModal();
                            }}
                        >
                            <div className="p-4 w-full">
                                <div className='flex items-center justify-between'>
                                    <h1 className="inline-flex items-center text-lg font-semibold">
                                        {key}
                                    </h1>
                                    <div onClick={(e) => handleRemoveAction(key, value.type, value.description, value.data, e)} className='hover:scale-125 transition duration-100 ease-in-out'>
                                        <Trash size={16} className='cursor-pointer' />
                                    </div>
                                </div>
                                <p className="mt-3 text-xs sm:text-sm text-gray-600 line-clamp-3">
                                    Description: {value.description}
                                </p>
                                {value.data && (
                                    <p className="mt-3 text-xs sm:text-sm text-gray-600 line-clamp-3">
                                        Structure: {value.data}
                                    </p>
                                )}
                                {value.type && (
                                    <div className="mt-4">
                                        <span className="mr-2 inline-block rounded-full capitalize bg-white px-3 py-1 text-[10px] sm:text-xs font-semibold text-gray-900">
                                            {value.type}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <ActionModel params={params} actionId={selectedKey} setActionId={setSelectedKey} />
            </div>
        )
    );
}
