import { useCustomSelector } from '@/customHooks/customSelector';
import { createOrRemoveActionBridge } from '@/store/action/chatBotAction';
import { TrashIcon } from '@/components/Icons';
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import ActionModel from './actionModel';
import { openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import InfoTooltip from '@/components/InfoTooltip';

function ActionList({ params }) {
    const { action, bridgeType } = useCustomSelector((state) => ({
        action: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version]?.actions,
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
                ...(type === 'sendDataToFrontend' && { variable: data })
            }
        };

        dispatch(createOrRemoveActionBridge({
            orgId: params?.org_id,
            bridgeId: params?.id,
            versionId: params?.version,
            type: "remove",
            dataToSend
        }));
    }, [dispatch, params]);

    return (
        <div className="form-control">
            <div className='flex items-start'>
                    <InfoTooltip tooltipContent="Action is a task or operation executed in response to a trigger or event, often used to perform a defined outcome such as sending or processing data." className='z-low-medium w-64 p-3 bg-gray-900 text-white text-primary-foreground
              rounded-md shadow-xl text-xs animate-in fade-in zoom-in
              border border-gray-700 space-y-2 pointer-events-auto
            '>
                        <label className="label font-medium whitespace-nowrap info">Action</label>
                    </InfoTooltip>
            </div>
            <div className='flex flex-wrap gap-4'>
                {action && Object.entries(action).sort().map(([key, value]) => (
                    <div
                        key={key}
                        className="flex w-[250px] mb-4 flex-col items-start rounded-md border hover:bg-base-200 md:flex-row cursor-pointer"
                        onClick={() => {
                            setSelectedKey(key);
                            openModal(MODAL_TYPE.ACTION_MODAL)
                        }}
                    >
                        <div className="p-4 w-full">
                            <div className='flex items-center justify-between'>
                                <h1 className="inline-flex items-center text-lg font-semibold text-base-content">
                                    {key}
                                </h1>
                                <div onClick={(e) => handleRemoveAction(key, value?.type, value?.description, value?.variable, e)} className='hover:scale-125 transition duration-100 ease-in-out'>
                                    <TrashIcon size={16} className='cursor-pointer text-error' />
                                </div>
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                Description: {value?.description}
                            </p>
                            {value?.variable && (
                                <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                    Structure: {value?.variable}
                                </p>
                            )}
                            {value?.type && (
                                <div className="mt-4">
                                    <span className="mr-2 inline-block rounded-full capitalize bg-base-300 text-base px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content">
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
    );
}
export default ActionList;