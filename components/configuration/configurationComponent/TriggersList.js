import { getOrCreateNotificationAuthKey } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateTriggerDataReducer } from "@/store/reducer/bridgeReducer";
import { AddIcon } from "@/components/Icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InfoTooltip from "@/components/InfoTooltip";

function getStatusClass(status) {
    switch (status?.toString().trim().toLowerCase()) {
        case 'drafted':
            return 'bg-yellow-100';
        case 'paused':
        case 'deleted':
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

export default function TriggersList({ params, isEmbedUser }) {
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
            if (!filteredTriggers?.length && openViasocket && authkey) openTrigger()
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
                <div className='flex gap-5  items-start just'>
                    <InfoTooltip tooltipContent="A trigger is an event or condition that initiates an automated process or workflow.">
                        <p className="label-text font-medium whitespace-nowrap info">Trigger Configuration</p>
                    </InfoTooltip>
                </div>
                <button tabIndex={0} className="btn btn-outline btn-sm mb-2" onClick={() => { openTrigger() }}>
                <AddIcon size={16} />Connect Trigger
                </button>
                </div>
            <div className="flex flex-wrap gap-4">
                {triggers?.length ? (triggers?.map(trigger => {
                    return (
                        <div key={trigger?.id} onClick={() => { openTrigger(trigger?.id) }}
                            className="flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer bg-base-100 relative hover:bg-base-200">
                            <div className="p-2 w-full h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <h1 className="text-base sm:text-md font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-full text-base-content">
                                            {trigger?.title}
                                        </h1>
                                    </div>
                                    {/* <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                        {trigger?.description || "No description provided."}
                                        </p> */}
                                </div>
                                <div className="mt-2">
                                    <span className={`mr-2 inline-block rounded-full capitalize px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(trigger?.status)}`}>
                                        {trigger?.status || "Draft"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })) : null}
            </div>
            <div className="divider my-1"></div>
        </div>
    )
}