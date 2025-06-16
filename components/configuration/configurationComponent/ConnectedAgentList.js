import React, { useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { Bot, Settings, Trash } from 'lucide-react';
import { closeModal, getStatusClass, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import AgentVariableModal from '@/components/modals/AgentVariableModal';
import RenderEmbed from './renderEmbed';


const ConnectedAgentList = ({ params }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const { connect_agents } = useCustomSelector((state) => {
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        return {
            connect_agents: versionData?.connected_agents || {}
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
        try {
            dispatch(
                updateBridgeVersionAction({
                    bridgeId: params?.id,
                    versionId: params?.version,
                    dataToSend: {
                        agents: {
                            connected_agents: {
                                [key]: null
                            }
                        }
                    }
                })
            );
            
            // Clear states
            setCurrentVariable(null);
            setSelectedBridge(null);
            
        } catch (error) {
            console.error('Error removing agent:', error);
            toast.error('Failed to remove agent');
        }
    }


    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents).map(([name, item]) => {
            return (<>
                <RenderEmbed
                    name={name}
                    item={item}
                    key={item?.bridge_id}
                    bridgeFunctions={[{
                        _id: item?.bridge_id,
                        function_name: name,
                        description: item?.description || "A description is required for proper functionality.",
                        status: "connected"
                    }]}
                    integrationData={{
                        [name]: {
                            title: name?.length > 10 ? `${name.slice(0, 15)}...` : name,
                            description: item?.description,
                            status: "active"
                        }
                    }}
                    getStatusClass={getStatusClass}
                    handleOpenModal={() => handleOpenAgentVariable(name, item)}
                    embedToken={params?.embedToken}
                    params={{ id: params?.id, version: params?.version }}
                />
                            <AgentVariableModal selectedBridge={selectedBridge} currentVariable={currentVariable} handleSaveAgent={handleSaveAgent}name={name} item={item} handleRemoveAgent={handleRemoveAgent}/>

                               </>
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
            <ConnectedAgentListSuggestion params={params} handleSelectAgents={handleSelectAgents} connect_agents={connect_agents} />
            <AgentDescriptionModal setDescription={setDescription} handleSaveAgent={handleSaveAgent} description={description} />
       </div>
    );
}

export default ConnectedAgentList