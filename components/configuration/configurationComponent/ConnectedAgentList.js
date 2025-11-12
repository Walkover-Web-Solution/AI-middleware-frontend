import React, { useCallback, useMemo, useState } from 'react'
import ConnectedAgentListSuggestion from './ConnectAgentListSuggestion';
import { useDispatch } from 'react-redux';
import isEqual, { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeAction, updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { AddIcon, SettingsIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import { toast } from 'react-toastify';
import AgentDescriptionModal from '@/components/modals/AgentDescriptionModal';
import FunctionParameterModal from './functionParameterModal';
import { useRouter } from 'next/navigation';
import InfoTooltip from '@/components/InfoTooltip';
import DeleteModal from '@/components/UI/DeleteModal';
import useDeleteOperation from '@/customHooks/useDeleteOperation';
import { CircleQuestionMark } from 'lucide-react';
import { BotIcon } from 'lucide-react';
import useExpandableList from '@/customHooks/useExpandableList';

const ConnectedAgentList = ({ params, searchParams }) => {
    const dispatch = useDispatch();
    const [description, setDescription] = useState("");
    const [selectedBridge, setSelectedBridge] = useState(null);
    const [currentVariable, setCurrentVariable] = useState(null);
    const [agentTools, setAgentTools] = useState(null);
    const [variablesPath, setVariablesPath] = useState({});
    const { isDeleting, executeDelete } = useDeleteOperation(MODAL_TYPE?.DELETE_AGENT_MODAL);
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
        setCurrentVariable({ name: item?.bridge_id, description: description, fields: fields, required_params: required_params, thread_id: item?.thread_id || false, version_id: item?.version_id || '' });
        setAgentTools({ name: item?.bridge_id, description: description, fields: fields, required_params: required_params, thread_id: item?.thread_id || false, version_id: item?.version_id || '' });
        openModal(MODAL_TYPE?.AGENT_VARIABLE_MODAL);
    }, [bridgeData, openModal, setSelectedBridge, setCurrentVariable, setAgentTools]);

    const handleRemoveAgent = async (item, name) => {
        await executeDelete(async () => {
            await dispatch(
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
            );
            setCurrentVariable(null);
            setSelectedBridge(null);
            toast.success('Agent removed successfully');
        });
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
            if (agentTools?.version_id) {
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
                    connected_agent_details: {
                        agent_variables: {
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


    // Convert connect_agents object to array for expandable list
    const agentEntries = useMemo(() => {
        return connect_agents ? Object.entries(connect_agents) : [];
    }, [connect_agents]);

    // Use expandable list hook
    const { displayItems, isExpanded, toggleExpanded, shouldShowToggle, hiddenItemsCount } = useExpandableList(agentEntries, 1);

    const renderEmbed = useMemo(() => {
        const agentItems = displayItems.map(([name, item]) => {
            const bridge = bridgeData?.find((bd) => bd?._id === item?.bridge_id)
            return (
                <div
                    key={item?.bridge_id}
                    id={item?.bridge_id}
                    className={`group flex items-center rounded-md border border-base-300 cursor-pointer bg-base-200 relative min-h-[44px] w-full overflow-hidden ${(!bridge?.connected_agent_details?.description && !item.description) ? "border-red-600" : ""} hover:bg-base-300 transition-colors duration-200`}
                >
                    <div
                        className="p-2 flex-1 flex items-center"
                        onClick={() => handleAgentClicked(item)}
                    >
                        <div className="flex items-center gap-2 w-full">
                            <BotIcon size={16} className="shrink-0" />
                            {name?.length > 24 ? (
                                <div className="tooltip tooltip-top min-w-0" data-tip={name}>
                                    <span className="min-w-0 text-sm truncate">
                                        <span className="text-sm font-normal block w-full">{name}</span>
                                    </span>
                                </div>
                            ) : (
                                <span className="min-w-0 text-sm truncate">
                                    <span className="text-sm font-normal block w-full">{name}</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Action buttons that appear on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 pr-2 flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenAgentVariable(name, item);
                            }}
                            className="btn btn-ghost btn-sm p-1 hover:bg-base-300"
                            title="Config"
                        >
                            <SettingsIcon size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDeleteModal(name, item);
                            }}
                            className="btn btn-ghost btn-sm p-1 hover:bg-red-100 hover:text-error"
                            title="Remove"
                        >
                            <TrashIcon size={16} />
                        </button>
                    </div>
                </div>
            );
        });

        return (
            <div className="w-full">
                <div className={`grid gap-2 w-full ${displayItems.length === 1 ? 'grid-cols-2' : 'grid-cols-1'}`} style={{
                    gridTemplateColumns: displayItems.length === 1 ? 'repeat(2, minmax(250px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))'
                }}>
                    {agentItems}
                    {/* Add empty div for spacing when only one item */}
                    {displayItems.length === 1 && <div></div>}
                </div>
                
                {/* Show/Hide toggle button */}
                {shouldShowToggle && (
                    <div className="flex justify-center mt-3">
                        <button
                            onClick={toggleExpanded}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-base-content/70 hover:text-base-content bg-base-100 hover:bg-base-200 rounded-lg border border-base-300 transition-all duration-200"
                        >
                            {isExpanded ? (
                                <>
                                    <ChevronUpIcon size={16} />
                                    <span>Show Less</span>
                                </>
                            ) : (
                                <>
                                    <ChevronDownIcon size={16} />
                                    <span>Show {hiddenItemsCount} More</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    }, [displayItems, bridgeData, shouldShowToggle, isExpanded, toggleExpanded, hiddenItemsCount, handleAgentClicked, handleOpenAgentVariable, handleOpenDeleteModal]);

    return (
        <div>
            <div className="w-full max-w-md gap-2 flex flex-col px-2 py-2 cursor-default">

                <>
                    <div className="dropdown dropdown-right w-full flex items-center">
                        {Object?.entries(connect_agents)?.length > 0 ? (
                            <>
                                <div className="flex items-center gap-1 mb-2">
                                    <p className="font-medium whitespace-nowrap">Agents</p>
                                    <InfoTooltip tooltipContent="To handle different or complex tasks, one agent can use other agents.">
                                        <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                                    </InfoTooltip>
                                </div>
                                <button
                                    tabIndex={0}
                                    className="ml-4 flex items-center gap-1 px-3 py-1 rounded-lg bg-base-200 text-base-content text-sm font-medium shadow hover:shadow-md active:scale-95 transition-all duration-150 mb-2"
                                >
                                    <AddIcon className="w-2 h-2" />
                                    <span className="text-xs">Add</span>
                                </button>
                            </>
                        ) : (
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
                name={selectedBridge?.name}
                title="Are you sure?"
                description={"This action Remove the selected Agent from the Agent."}
                buttonTitle="Remove Agent"
                modalType={`${MODAL_TYPE.DELETE_AGENT_MODAL}`}
                loading={isDeleting}
                isAsync={true}
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