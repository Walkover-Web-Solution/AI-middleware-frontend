import React, { useCallback, useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import isEqual, { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { AddIcon, CircleAlertIcon, EllipsisVerticalIcon, SettingsIcon, TrashIcon } from '@/components/Icons';
import { closeModal, openModal, transformAgentVariableToToolCallFormat } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import FunctionParameterModal from './functionParameterModal';
import { useRouter } from 'next/navigation';
import InfoTooltip from '@/components/InfoTooltip';
import DeleteModal from '@/components/UI/DeleteModal';

const ConnectedAgentList = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const [agentTools, setAgentTools] = useState(null);
    const [variablesPath, setVariablesPath] = useState({});
    const router = useRouter();
    let { connect_agents, shouldToolsShow, model, bridgeData, variables_path, bridges } = useCustomSelector((state) => {
        const bridges = state?.bridgeReducer?.org?.[params?.org_id]?.orgs || []
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
            bridges: state?.bridgeReducer?.allBridgesMap

        };
    });
    const handleSaveAgent = (overrideBridge = null, bridgeData) => {
        try {
            const sb = overrideBridge ? overrideBridge : selectedBridge
            if ((!description && !sb?.bridge_summary && !sb?.connected_agent_details?.description)) {
                toast?.error("Description Required")
                return;
            }
            const bridgeItem = bridgeData?.find((bridge) => { if (bridge?._id === sb?._id) { return bridge } });
            dispatch(updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [sb?.name]: {
                                "bridge_id": sb?._id || sb?.bridge_id
                            }
                        },
                        agent_status: "1"
                    }
                }
            }))
            dispatch(updateBridgeAction({
                bridgeId: sb?._id || sb?.bridge_id,
                dataToSend: {
                    connected_agent_details: {
                        ...bridgeItem?.connected_agent_details,
                        description: description ? description : sb?.bridge_summary ? sb?.bridge_summary : sb?.connected_agent_details?.description
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
    const handleSelectAgents = (bridge, bridgeData) => {
        setSelectedBridge(bridge)
        if (!bridge?.connected_agent_details?.description && !bridge?.bridge_summary) {
            openModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL)
            return;
        }
        handleSaveAgent(bridge, bridgeData)
    }
    const handleOpenDeleteModal = (name, item) => {
        setSelectedBridge({ name: name, ...item })
        openModal(MODAL_TYPE?.DELETE_AGENT_MODAL)
    }
    const handleOpenAgentVariable = useCallback((name, item) => {
        const bridgeItem = bridgeData?.find((bridge) => { if (bridge?._id === item?.bridge_id) { return bridge } });
        setSelectedBridge({ name: name, ...item });
        const agent_variables = bridgeItem?.connected_agent_details?.agent_variables || {};
        const description = bridgeItem?.connected_agent_details?.description || item?.description || "";
        const { fields, required_params } = agent_variables;
        setCurrentVariable({ name: item?.bridge_id, description: description, fields: fields, required_params: required_params });
        setAgentTools({ name: item?.bridge_id, description: description, fields: fields, required_params: required_params, thread_id: item?.thread_id || false, version_id: item?.version_id || '' });
        openModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }, [bridgeData, openModal, setSelectedBridge, setCurrentVariable, setAgentTools]);

    const handleRemoveAgent = (item,name) => {
        dispatch(
            updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                dataToSend: {
                    agents: {
                        connected_agents: {
                            [name]: {
                                "bridge_id": item?.bridge_id
                            }
                        }
                    }
                }
            })
        ).then(() => {
            closeModal(MODAL_TYPE?.DELETE_AGENT_MODAL)
            setCurrentVariable(null)
            setSelectedBridge(null)
        })
    }

    const handleSaveAgentVariable = () => {
        try {
            const dataToSend = {
                agents: {
                    connected_agents: {
                        [selectedBridge?.name]: {
                            "bridge_id": selectedBridge?._id || selectedBridge?.bridge_id,
                            "thread_id": agentTools?.thread_id ? agentTools?.thread_id : false,
                        }
                    },
                    agent_status: "1"
                }
            }
            if(agentTools?.version_id){
                dataToSend.agents.connected_agents[selectedBridge?.name].version_id = agentTools?.version_id
            }
            // on Save the bridge and thread id in version only
            dispatch(updateBridgeVersionAction({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                dataToSend
            }))
            dispatch(updateBridgeAction({
                bridgeId: selectedBridge?._id || selectedBridge?.bridge_id,
                dataToSend: {
                    connected_agent_details:{
                        agent_variables : {
                            fields: agentTools?.fields,
                            required_params: agentTools?.required_params
                        },
                        description: agentTools?.description
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
        const bridge = bridgeData?.find((bd) => bd?._id === item?.bridge_id)
        if (bridge) {
            const isCmdOrCtrlClicked = (window.event && (window.event.ctrlKey || window.event.metaKey));
            if (isCmdOrCtrlClicked) {
                window.open(`/org/${params?.org_id}/agents/configure/${bridge?._id}?version=${bridge?.published_version_id}`, "_blank");
            } else {
            router.push(`/org/${params?.org_id}/agents/configure/${bridge?._id}?version=${bridge?.published_version_id}`)
        }
    }
    }


    const renderEmbed = useMemo(() => (
        connect_agents && Object.entries(connect_agents).map(([name, item]) => {
            const bridge = bridgeData?.find((bd) => bd?._id === item?.bridge_id)
            return (
                <div
                    key={item?.bridge_id}
                    id={item?.bridge_id}
                    className={`group flex w-full flex-col items-start rounded-md border border-base-300 md:flex-row cursor-pointer bg-base-100 relative ${(!bridge?.connected_agent_details?.description && !item.description) ? "border-red-600" : ""} hover:bg-base-200 transition-colors duration-200`}
                >
                    <div
                        className="p-2 w-full h-full flex flex-col justify-between"
                        onClick={() => handleAgentClicked(item)}
                    >
                        <div>
                            <div className="flex items-center gap-2">
                                
                                <span className="flex-1 min-w-0  text-[9px]  md:text-[12px] lg:text-[13px] font-bold truncate">
                                    <div className="tooltip" data-tip={name?.length > 24 ? name : ""}>
                                        <span>{ bridge?.name}</span>
                                        <span className={`shrink-0 inline-block rounded-full capitalize px-2 py-0 text-[10px] ml-2 font-medium border ${(!bridge?.connected_agent_details?.description && !item.description) ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                    {(!bridge?.connected_agent_details?.description && !item.description) ? "Description Required" : "Active"}
                                </span>
                                    </div>
                                </span>
                            </div>
                            <div className="w-full flex justify-between flex-row">
                                <p className="mt-1 text-[11px] sm:text-xs text-base-content/70 line-clamp-1">
                                    {bridge?.connected_agent_details?.description || item.description ||  "A description is required for proper functionality."}
                                </p>
                                
                            </div>
                        </div>
                    </div>
                    
                    {/* Action buttons that appear on hover */}
                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAgentVariable(name, item);
                            }}
                            className="btn btn-ghost btn-xs p-1 hover:bg-base-300"
                            title="Config"
                        >
                            <SettingsIcon size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(name,item);
                            }}
                            className="btn btn-ghost btn-xs p-1 hover:bg-red-100 hover:text-error"
                            title="Remove"
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                </div>
            );
        })
    ), [connect_agents, bridgeData]);

    return (
        <div>
            <div className="label p-0 flex-col items-start mb-0">
             
                    <>
                        <div className="dropdown dropdown-right w-full flex items-center">
                            {Object?.entries(connect_agents)?.length > 0 ? (
                         <>
                            <InfoTooltip tooltipContent="To handle different or complex tasks, one agent can use other agents.">
                                <p className="label-text mb-2 font-medium whitespace-nowrap info">Agents</p>
                            </InfoTooltip>
                            <button
                                tabIndex={0}
                                className="ml-4 flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                            >
                                <AddIcon className="w-2 h-2" />
                                <span className="text-xs">Add</span>
                            </button>
                        </>
                            ):(
                                <InfoTooltip tooltipContent="To handle different or complex tasks, one agent can use other agents.">
                                <button
                                    tabIndex={0}
                                    className=" flex items-center gap-1 px-3 py-1 mt-2 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-lg active:scale-95 transition-all duration-150 mb-2"
                                >
                                    <AddIcon className="w-2 h-2" />
                                    <p className="label-text text-sm whitespace-nowrap">Agent</p>
                                </button>
                                </InfoTooltip>
                            )}
                            <ConnectedAgentListSuggestion 
                                params={params} 
                                handleSelectAgents={handleSelectAgents} 
                                connect_agents={connect_agents} 
                                shouldToolsShow={shouldToolsShow} 
                                modelName={model} 
                                bridges={bridgeData} 
                                bridgeData={bridgeData}
                            />
                        </div>
                        <div className="flex flex-col gap-2 w-full ">
                            {renderEmbed}
                        </div>
                    </>
               
            </div>
            <AgentDescriptionModal setDescription={setDescription} handleSaveAgent={handleSaveAgent} description={description} />
            <DeleteModal
                onConfirm={handleRemoveAgent}
                item={selectedBridge}
                name={bridgeData?.find(bridge => bridge._id === selectedBridge?.bridge_id)?.name}
                title="Are you sure?"
                description={"This action Remove the selected Agent from the Agent."}
                buttonTitle="Remove Agent"
                modalType={`${MODAL_TYPE.DELETE_AGENT_MODAL}`}
            />
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
                params={params}
                searchParams={searchParams}
                tool_name={bridgeData?.find(bridge => bridge._id === selectedBridge?.bridge_id)?.name}
            />
        </div>
    );
}

export default ConnectedAgentList