import React, { useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Bot, Trash } from 'lucide-react';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';

const ConnectedAgentList = ({ params }) => {
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null)
    const { connect_agents } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        return {
            connect_agents: versionData?.connected_agents || {}
        };
    });

    const dispatch = useDispatch();

    const handleSaveAgent = () => {
        if (!description) {
            toast?.error("Description Required")
            return;
        }
        dispatch(updateBridgeVersionAction({
            bridgeId: params?.id,
            versionId: params?.version,
            dataToSend: {
                agents: {
                    connected_agents: {
                        [selectedBridge?.name]: {
                            "description": description,
                            "bridge_id": selectedBridge?._id
                        }
                    },
                    agent_status: "1"
                }
            }
        }))
        setDescription("");
        closeModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL);
    }
    const handleSelectAgents = (bridge) => {
        setSelectedBridge(bridge)
        openModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL)
    }

    const handleRemoveAgent = (key, value) => {
        dispatch(updateBridgeVersionAction({
            bridgeId: params?.id,
            versionId: params?.version,
            dataToSend: {
                agents: {
                    connected_agents: {
                        [key]: {
                            "description": value?.description,
                            "bridge_id": value?.bridge_id
                        }
                    }
                }
            }
        }))
    }

    const renderEmbed = useMemo(() => (
        connect_agents && Array.isArray(connect_agents) ? connect_agents.map((item) => {
            const key = Object.keys(item)?.[0];
            const value = item?.[key];
            return (
                <div
                    key={value?.bridge_id}
                    id={value?.bridge_id}
                    className={`flex w-[280px] flex-col items-start rounded-lg border-2 md:flex-row cursor-pointer bg-base-100 relative transition-all`}
                >
                    <div className="p-4 w-full h-full flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <h1 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content flex items-center gap-2">
                                    <Bot size={18} className="text-primary" />
                                    {key}
                                </h1>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn btn-ghost btn-sm p-1 hover:bg-red-50"
                                        onClick={() => handleRemoveAgent(key, value)}
                                    >
                                        <Trash size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-base-content/80 line-clamp-3">
                                {value?.description || "A description is required for proper functionality."}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        ) : null
    ), [connect_agents]);
    return (
        <div>
            <div className="label flex-col items-start mb-2">
                {
                    <div className="flex flex-wrap gap-4">
                        {renderEmbed}
                    </div>
                }
            </div>
            <ConnectedAgentListSuggestion params={params} handleSelectAgents={handleSelectAgents} connect_agents={connect_agents} />
            <AgentDescriptionModal setDescription={setDescription} handleSaveAgent={handleSaveAgent} description={description} />
        </div>
    );
}

export default ConnectedAgentList