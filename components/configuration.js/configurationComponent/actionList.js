import { useCustomSelector } from '@/customSelector/customSelector';
import { X } from 'lucide-react';
import ActionModel from './actionModel';
import { useDispatch } from 'react-redux';
import { createOrRemoveActionBridge } from '@/store/action/chatBotAction';

export default function ActionList({ params }) {

    const { action, bridgeType } = useCustomSelector((state) => ({
        action: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.actions,
        bridgeType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridgeType
    }));

    const dispatch = useDispatch()


    const HandleRemoveAction = (actionId, type, description, data) => {
        const dataToSend = {
            actionId,
            actionJson: {
                description,
                type
            }
        };

        if (type === 'Frontend') {
            dataToSend.actionJson.data = data;
        }

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id, bridgeId: params?.id, type: "remove", dataToSend
        }));
        // Add your submit logic here
    };
    return (
        bridgeType === "chatbot" && (
            <div className="form-control">
                <p className='text-xl font-medium'>Action</p>
                <div className='flex flex-wrap gap-4'>
                    {action && Object.entries(action).sort().map(([key, value], index) => (
                        <div
                            key={index}
                            className="flex w-[250px] flex-col items-start rounded-md border md:flex-row "
                        >
                            <div className="p-4 w-full">
                                <div className='flex items-center justify-between'>
                                    <h1 className="inline-flex items-center text-lg font-semibold">
                                        {key}
                                    </h1>
                                    <div onClick={() => HandleRemoveAction(key, value.type, value.description, value.data)}>
                                        <X size={16} color="#ff0000" className='cursor-pointer' />
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
                <ActionModel params={params} />
            </div>
        )
    );

}