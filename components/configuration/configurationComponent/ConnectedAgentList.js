import React, { useCallback, useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import isEqual, { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { CircleAlertIcon, SettingsIcon } from '@/components/Icons';
import { closeModal, openModal, transformAgentVariableToToolCallFormat } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import FunctionParameterModal from './functionParameterModal';
import { useRouter } from 'next/navigation';
import InfoTooltip from '@/components/InfoTooltip';

const ConnectedAgentList = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const [agentTools, setAgentTools] = useState(null);
    const [variablesPath, setVariablesPath] = useState({});
    const router = useRouter();
    let { connect_agents, shouldToolsShow, model, bridgeData, variables_path } = useCustomSelector((state) => {
        const bridges = state?.bridgeReducer?.org?.[params?.org_id]?.orgs || {}
        const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
        const modelReducer = state?.modelReducer?.serviceModels;
        const serviceName = versionData?.service;
        const modelTypeName = versionData?.configuration?.type?.toLowerCase();
        const modelName = versionData?.configuration?.model;
        return {
            bridgeData: bridges,
            connect_agents: versionData?.connected_agents || {},
            shouldToolsShow: modelReducer?.[serviceName]?.[modelTypeName]?.[modelName]?.validationConfig?.tools,
            model: modelName,
            variables_path: versionData?.variables_path || {},
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
                versionId: searchParams?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [selectedBridge?.name]: {
                                "description": description ? description : selectedBridge?.description,
                                "bridge_id": selectedBridge?._id || selectedBridge?.bridge_id,
                                "agent_variables": selectedBridge?.agent_variables,
                                "variables": { fields: agentTools?.fields, required_params: agentTools?.required_params }
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

    const handleOpenAgentVariable = useCallback((name, item) => {
        setSelectedBridge({ name: name, ...item })
        const {fields, required_params} =(item?.variables && Object.keys(item?.variables)?.length>0) ? item?.variables : transformAgentVariableToToolCallFormat(item?.agent_variables || {})
        setCurrentVariable({ name: item?.bridge_id, description: item?.description, fields: fields, required_params: required_params })
        setAgentTools({ name: item?.bridge_id, description: item?.description, fields: fields, required_params: required_params, thread_id: item?.thread_id?item?.thread_id:false })
        openModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }, [bridgeData, openModal, setSelectedBridge, setCurrentVariable, setAgentTools, transformAgentVariableToToolCallFormat])

    const handleRemoveAgent = () => {
        dispatch(
            updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [selectedBridge?.name]: {
                                "description": selectedBridge?.description,
                                "bridge_id": selectedBridge?.bridge_id,
                                "agent_variables": selectedBridge?.agent_variables,
                                "variables": { fields: agentTools?.fields, required_params: agentTools?.required_params }
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
            dispatch(updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [selectedBridge?.name]: {
                                "description": agentTools?.description ? agentTools?.description : selectedBridge?.description,
                                "bridge_id": selectedBridge?._id || selectedBridge?.bridge_id,
                                "agent_variables": selectedBridge?.agent_variables,
                                "variables": { fields: agentTools?.fields, required_params: agentTools?.required_params },
                                "thread_id": agentTools?.thread_id ? agentTools?.thread_id : false
                            }
                        },
                        agent_status: "1"
                    }
                }
            }))
            if (!isEqual(variablesPath, variables_path[selectedBridge?.bridge_id])) {
                dispatch(
                    updateBridgeVersionAction({
                        bridgeId: params.id,
                        versionId: searchParams?.version,
                        dataToSend: { variables_path: { [selectedBridge?.bridge_id]: variablesPath } },
                    })
                );
            }
            closeModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL)
            setCurrentVariable(null)
            setSelectedBridge(null)
        } catch (error) {
            toast?.error("Failed to save agent")
            console.error(error)
        }
    }

    const handleAgentClicked = (item) => {
        const bridge = bridgeData?.find((bridge) => bridge?._id === item?.bridge_id)
        if (bridge) {
            router.push(`/org/${params?.org_id}/agents/configure/${bridge?._id}?version=${bridge?.published_version_id}`)
        }
    }


    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents).map(([name, item]) => {
            return (
                <div
                    key={item?.bridge_id}
                    id={item?.bridge_id}
                    className={`flex w-[250px] flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${item?.description?.trim() === "" ? "border-red-600" : ""} hover:bg-base-200`}
                >
                    <div
                        className="p-4 w-full h-full flex flex-col justify-between"
                        onClick={() => handleAgentClicked(item)}
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
                            <span className={`mr-2 inline-block rounded-full capitalize px-3 py-1 text-[10px] sm:text-xs font-semibold text-black bg-green-100`}>
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
    ), [connect_agents, bridgeData]);

    return (
        <div>
            <div className="label flex-col items-start mb-2">
                {shouldToolsShow && Object.keys(connect_agents).length > 0 && (
                    <>
                        <InfoTooltip tooltipContent="To handle different or complex tasks, one agent can use other agents.">
                            <p className="label-text mb-2 font-medium whitespace-nowrap info">Agents</p>
                        </InfoTooltip>
                        <div className="flex flex-wrap gap-4">
                            {renderEmbed}
                        </div>
                    </>
                )}
        
            </div>
            <ConnectedAgentListSuggestion params={params} handleSelectAgents={handleSelectAgents} connect_agents={connect_agents} shouldToolsShow={shouldToolsShow} modelName={model} bridges={bridgeData} />
            <AgentDescriptionModal setDescription={setDescription} handleSaveAgent={handleSaveAgent} description={description} />
            <FunctionParameterModal
                name="Agent"
                Model_Name={MODAL_TYPE?.AGENT_VARIABLE_MODAL}
                function_details={currentVariable}
                functionName={currentVariable?.name}
                handleRemove={handleRemoveAgent}
                handleSave={handleSaveAgentVariable}
                toolData={agentTools}
                setToolData={setAgentTools}
                functionId={selectedBridge?.bridge_id}
                variablesPath={variablesPath}
                setVariablesPath={setVariablesPath}
                variables_path={variables_path}
            />
        </div>
    );
}

export default ConnectedAgentList