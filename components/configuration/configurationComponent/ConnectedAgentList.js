import React, { useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { SettingsIcon } from '@/components/Icons';
import { closeModal, openModal, transformAgentVariableToToolCallFormat } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import FunctionParameterModal from './functionParameterModal';

const ConnectedAgentList = ({ params }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const [agentTools, setAgentTools] = useState(null);
    let { connect_agents, shouldToolsShow, model, bridgeData } = useCustomSelector((state) => {
        const bridgeData = state?.bridgeReducer?.bridges;
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            bridgeData: bridgeData,
            connect_agents: versionData?.connected_agents || {},
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.configuration?.additional_parameters?.tools,
            model: modelName
        };
    });

    const handleSaveAgent = () => {
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
                                "bridge_id": selectedBridge?._id || selectedBridge?.bridge_id
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
        const formattedVariables = transformAgentVariableToToolCallFormat(bridgeData?.[name]?.agent_variables || {})
        setCurrentVariable({name:name,description: item?.description, fields: formattedVariables})
        setAgentTools({name:name,description: item?.description, fields: formattedVariables})
        openModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }

    const handleRemoveAgent = () => {
        dispatch(
            updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: params?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [selectedBridge?.name]: {
                                "description": selectedBridge?.description,
                                "bridge_id": selectedBridge?.bridge_id,
                                "variables_state": selectedBridge?.variables_state
                            }
                        }
                    }
                }
            })
        ).then(() => {
            closeModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL)
            setCurrentVariable(null)
            setSelectedBridge(null)
        })
    }

    const handleSaveAgentVariable = () => {
        try {
            dispatch(updateBridgeAction({
                bridgeId: params?.id,
                dataToSend: {
                    agent_variables: {fields:agentTools?.fields}
                }
            }))
            closeModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL)
            setCurrentVariable(null)
            setSelectedBridge(null)
        } catch (error) {
            toast?.error("Failed to save agent")
            console.error(error)
        }
    }


    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents).map(([name, item]) => {
            return (
                <div
                    key={item?.bridge_id}
                    id={item?.bridge_id}
                    className={`flex w-[250px] flex-col items-start rounded-md border md:flex-row cursor-pointer bg-base-100 relative ${item?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200`}
                >
                    <div
                        className="p-4 w-full h-full flex flex-col justify-between"

                    >
                        <div>
                            <div className="flex justify-between items-center">
                                <h1 className="text-base sm:text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap w-48 text-base-content flex items-center gap-2">
                                    <div className="tooltip" data-tip={name?.length > 10 ? name : ""}>
                                        <span>{name?.length > 10 ? `${name.slice(0, 15)}...` : name}</span>
                                    </div>
                                </h1>
                                {item?.description?.trim() === "" && <CircleAlertIcon color='red' size={16} />}
                            </div>
                            <p className="mt-3 text-xs sm:text-sm line-clamp-3">
                                {item?.description || "A description is required for proper functionality."}
                            </p>
                        </div>
                        <div className="mt-4">
                            <span className={`mr-2 inline-block rounded-full capitalize px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content bg-base-200`}>
                                {!item?.description ? "Description Required" : "Active"}
                            </span>
                        </div>
                    </div>
                        <div className="flex items-center justify-center absolute right-1 top-1">
                            <button className="btn bg-transparent shadow-none border-none outline-none hover:bg-base-200 pr-1" onClick={() => handleOpenAgentVariable(name, item)}>
                                <SettingsIcon size={18} />
                            </button>
                    </div>
                </div>
            );
        })
    ), [connect_agents]);
console.log(selectedBridge)
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
            <FunctionParameterModal
                name="Agent"
                Model_Name={MODAL_TYPE?.AGENT_VARIABLE_MODAL}
                params={params}
                function_details={currentVariable}
                functionName={currentVariable?.name}
                handleRemove={handleRemoveAgent}
                handleSave={handleSaveAgentVariable}
                toolData={agentTools}
                setToolData={setAgentTools}
                functionId={selectedBridge?.bridge_id}
            />
        </div>
    );
}

export default ConnectedAgentList