import { getOrCreateNotificationAuthKey } from "@/config/index";
import { useCustomSelector } from "@/customHooks/customSelector";
import { updateTriggerDataReducer } from "@/store/reducer/bridgeReducer";
import { AddIcon } from "@/components/Icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InfoTooltip from "@/components/InfoTooltip";
import { CircleQuestionMark, Zap } from 'lucide-react';

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

export default function TriggersList({ params, isEmbedUser }) {
    const dispatch = useDispatch();
    const { triggerEmbedToken, triggerData, isViewer } = useCustomSelector((state) => ({
        triggerEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.triggerEmbedToken,
        triggerData: state?.bridgeReducer?.org?.[params?.org_id]?.triggerData,
        isViewer: state?.userDetailsReducer?.organizations?.[params?.org_id]?.role_name === 'Viewer' || false
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
        if (!isEmbedUser && !isViewer) getAndSetAuthKey()
    }, [params?.org_id, authkey, isEmbedUser, isViewer]);

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

    const activeTriggers = triggers?.filter(trigger => trigger?.status !== 'deleted') || [];

    return (
        <div>
            <div className="w-full gap-2 flex flex-col cursor-default">
                <div className="dropdown dropdown-left w-full flex items-center">
                    <div className='flex justify-between w-full'>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-primary p-1.5 rounded-md">
                                    <Zap size={16} className="text-primary-content" />
                                </div>
                                <div>
                                    <p className="text-sm whitespace-nowrap">Triggers</p>
                                    <p className="text-xs text-gray-500">Automate workflows with events</p>
                                </div>
                            </div>
                            <InfoTooltip tooltipContent="A trigger is an event or condition that initiates an automated process or workflow.">
                                <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                            </InfoTooltip>
                        </div>
                        <button
                            onClick={() => openTrigger()}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none text-primary-content p-1.5 h-8 w-8 bg-primary hover:bg-primary/70"
                            disabled={isViewer}
                        >
                            <AddIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                    {/* Render trigger cards */}
                    {activeTriggers.length > 0 && (
                        <div className="grid gap-2 w-full">
                            {activeTriggers.map(trigger => (
                                <div
                                    key={trigger?.id}
                                    onClick={() => openTrigger(trigger?.id)}
                                    className="group flex items-center rounded-md border border-base-300 cursor-pointer bg-base-200 relative min-h-[44px] w-full overflow-hidden hover:bg-base-300 transition-colors duration-200"
                                >
                                    <div className="p-2 flex-1 flex items-center">
                                        <div className="flex items-center gap-2 w-full">
                                            <Zap size={16} className="shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-normal block truncate">
                                                    {trigger?.title}
                                                </span>
                                            </div>
                                            <span className={`shrink-0 inline-block rounded-full capitalize px-2 py-0.5 text-[10px] font-medium ${getStatusClass(trigger?.status)}`}>
                                                {trigger?.status || "Draft"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}