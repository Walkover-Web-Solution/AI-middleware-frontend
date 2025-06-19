import React, { useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { BotIcon, SettingsIcon, TrashIcon } from '@/components/Icons';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import AgentVariableModal from '@/components/modals/AgentVariableModal';

const ConnectedAgentList = ({ params }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const { connect_agents, shouldToolsShow, model } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            connect_agents: versionData?.connected_agents || {},
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.configuration?.additional_parameters?.tools,
            model: modelName
        };
    });

    const handleSaveAgent = (updatedVariables = null) => {
        try {
            if (!description && !selectedBridge?.description) {
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
                                "description": description ? description : selectedBridge?.description,
                                "bridge_id": selectedBridge?._id || selectedBridge?.bridge_id,
                                "variables_state": updatedVariables ? updatedVariables : selectedBridge?.variables_state
                            }
                        },
                        agent_status: "1"
                    }
                }
            }))
            setDescription("");
            closeModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL);
            setCurrentVariable(null)
            setSelectedBridge(null)
        } catch (error) {
            toast?.error("Failed to save agent")
            console.error(error)
        }
    }
    const handleSelectAgents = (bridge) => {
        setSelectedBridge(bridge)
        openModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL)
    }

    const handleOpenAgentVariable = (name, item) => {
        setSelectedBridge({ name: name, ...item })
        setCurrentVariable(item?.variables_state)
        openModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }

    const handleRemoveAgent = (key, value) => {
        dispatch(
            updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: params?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [key]: {
                                "description": value?.description,
                                "bridge_id": value?.bridge_id,
                                "variables_state": value?.variables_state
                            }
                        }
                    }
                }
            })
        )
    }


    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents).map(([name, item]) => {
            return (
                <div
                    key={item?.bridge_id}
                    id={item?.bridge_id}
                    className={`flex w-[280px] flex-col items-start rounded-lg border-2 md:flex-row cursor-pointer bg-base-100 relative transition-all`}
                >
                    <div className="p-4 w-full h-full flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <h1 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content flex items-center gap-2">
                                    <BotIcon size={20} className="text-primary" />
                                    <div className="tooltip" data-tip={name?.length > 10 ? name : ""}>
                                        <span>{name?.length > 10 ? `${name.slice(0, 15)}...` : name}</span>
                                    </div>
                                </h1>
                                <div className="flex items-center gap-1">
                                    <button
                                        className="btn btn-ghost btn-sm p-1 hover:bg-red-50"
                                        onClick={() => handleOpenAgentVariable(name, item)}
                                    >
                                        {item?.variables_state && <SettingsIcon size={16} className="" />}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm p-1 hover:bg-red-50"
                                        onClick={() => handleRemoveAgent(name, item)}
                                    >
                                        <TrashIcon size={18} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-base-content/80 line-clamp-3">
                                {item?.description || "A description is required for proper functionality."}
                            </p>
                        </div>
                    </div>
                </div>
            );
        })
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
            <ConnectedAgentListSuggestion params={params} handleSelectAgents={handleSelectAgents} connect_agents={connect_agents} shouldToolsShow={shouldToolsShow} modelName={model} />
            <AgentDescriptionModal setDescription={setDescription} handleSaveAgent={handleSaveAgent} description={description} />
            <AgentVariableModal currentVariable={currentVariable} handleSaveAgent={handleSaveAgent} />
        </div>
    );
}

export default ConnectedAgentList