import { getOrCreateNotificationAuthKey } from "@/config/index";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateTriggerDataReducer } from "@/store/reducer/bridgeReducer";
import { AddIcon } from "@/components/Icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InfoTooltip from "@/components/InfoTooltip";

function getStatusClass(status) {
    switch (status?.toString().trim().toLowerCase()) {
        case 'drafted':
            return ' text-yellow-700 bg-yellow-100';
        case 'paused':
        case 'deleted':
            return 'text-red-700 bg-red-100';
        case 'active':
        case 'published':
            return 'text-green-700 bg-green-100';
        case 'rejected':
            return 'text-gray-700 bg-gray-100';
        // Add more cases as needed
        default:
            return 'bg-gray-100';
    }
};

export default function TriggersList({ params, isEmbedUser}) {
    const dispatch = useDispatch();
    const { triggerEmbedToken, triggerData } = useCustomSelector((state) => ({
        triggerEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.triggerEmbedToken,
        triggerData: state?.bridgeReducer?.org?.[params?.org_id]?.triggerData
    }));
    const [triggers, setTriggers] = useState([]);
    const [authkey, setAuthkey] = useState('')

    async function getAndSetAuthKey() {
        const keytoset = await getOrCreateNotificationAuthKey('gtwy_bridge_trigger')
        if (keytoset) setAuthkey(keytoset?.authkey)
    }
    useEffect(() => {
        if (triggerData) {
            const filteredTriggers = triggerData.filter(flow => flow?.metadata?.bridge_id === params?.id) || []
            setTriggers(filteredTriggers);
            if (!filteredTriggers?.length && window?.openViasocket && authkey) openTrigger()
        }
        if (!isEmbedUser) getAndSetAuthKey()
    }, [params?.org_id, authkey]);

    function openTrigger(triggerId) {
        openViasocket(triggerId, {
            embedToken: triggerEmbedToken,
            meta: {
                type: 'trigger',
                bridge_id: params?.id,
            },
            configurationJson: {
                "row4qwo5ot1l": {
                    "key": "Talk_to_Bridge",
                    "inputValues": {
                        "bridge": params?.id,
                        "_bridge": params?.id,
                        "message": `\${JSON.stringify(context.req.body)}`,
                        "_message": `\${JSON.stringify(context.req.body)}`,
                    },
                    "authValues": {
                        "pauth_key": authkey
                    }
                }
            }
        })
    }

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, [params?.id]);

    async function handleMessage(e) {
        const newTrigger = e?.data
        if (e.data?.metadata?.type !== 'trigger') return;

        setTriggers(prevTriggers => {
            const existingIndex = prevTriggers.findIndex(trigger => trigger.id === newTrigger.id);

            if (existingIndex !== -1) {
                // Update existing trigger
                const updatedTriggers = [...prevTriggers];
                updatedTriggers[existingIndex] = { ...prevTriggers[existingIndex], ...newTrigger };
                return updatedTriggers;
            } else {
                // Add new trigger to the beginning
                dispatch(updateTriggerDataReducer({ dataToSend: newTrigger, orgId: params?.org_id }));
                return [newTrigger, ...prevTriggers];
            }
        });
    }

    return (
        <div className="w-full">
            <div className="flex items-start flex-col gap-2">
                <div className='flex gap-5 ml-1  items-start just'>
                    {triggers?.length > 0 ? (
                        <div className="flex items-center gap-1 flex-row mb-2">
                            <InfoTooltip tooltipContent="A trigger is an event or condition that initiates an automated process or workflow.">
                            <p className="label-text info font-medium  whitespace-nowrap">Trigger</p>
                            </InfoTooltip>
                            <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 ml-4" onClick={() => { openTrigger() }}>
                                <AddIcon className="w-2 h-2" />
                                <span className="text-xs font-medium">Add</span>
                            </button>
                        </div>
                    ) : (
                        <InfoTooltip tooltipContent="A trigger is an event or condition that initiates an automated process or workflow.">
                            <button tabIndex={0} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2" onClick={() => { openTrigger() }}>
                                <AddIcon size={16} />Trigger
                            </button>
                        </InfoTooltip>
                    )}
                </div>
                
                </div>
            <div className="flex flex-wrap gap-4">
                {triggers?.length ? (triggers?.filter(trigger => trigger?.status !== 'deleted')?.length ? (triggers?.filter(trigger => trigger?.status !== 'deleted')?.map(trigger => {
                    return (
                        <div key={trigger?.id} onClick={() => { openTrigger(trigger?.id) }}
                            className="group flex h-full p-2 w-full flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative hover:bg-base-200 transition-colors duration-200">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 min-w-0 text-[9px] sm:text-[5px] md:text-[12px] lg:text-[13px] font-bold truncate">
                                    <p className="overflow-hidden text-ellipsis whitespace-normal break-words">
                                        {trigger?.title}
                                    </p>
                                </div>
                                <div className="">
                                <span className={`shrink-0 inline-block rounded-full mb-2 capitalize px-2 py-0 text-[10px]  font-medium  ${getStatusClass(trigger?.status)}`}>
                                        {trigger?.status || "Draft"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })) : null) : null}
            </div>
        </div>
    )
}