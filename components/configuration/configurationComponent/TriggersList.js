import { useCustomSelector } from "@/customHooks/customSelector";
import { updateTriggerDataReducer } from "@/store/reducer/bridgeReducer";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

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

export default function TriggersList({ params }) {
    const dispatch = useDispatch();
    const { triggerEmbedToken, triggerData } = useCustomSelector((state) => ({
        triggerEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.triggerEmbedToken,
        triggerData: state?.bridgeReducer?.org?.[params?.org_id]?.triggerData
    }));
    const [triggers, setTriggers] = useState([]);

    useEffect(() => {
        if (triggerData) {
            setTriggers(triggerData.filter(flow => flow?.metadata?.bridge_id === params?.id) || []);
        }
    }, [triggerData, params?.id]);

    function openTrigger(triggerId) {
        openViasocket(triggerId, {
            embedToken: triggerEmbedToken,
            meta: {
                type: 'trigger',
                bridge_id: params?.id
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
            <button tabIndex={0} className="btn btn-outline btn-sm mb-2" onClick={() => { openTrigger() }}><Plus size={16} />Connect Trigger</button>
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