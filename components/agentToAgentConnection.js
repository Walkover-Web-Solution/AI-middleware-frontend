'use client'

import { useState, useCallback, useEffect, useMemo, useRef, use } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Handle, Position, ReactFlowProvider, Controls, Background, BackgroundVariant, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, PlusIcon, Settings, Bot, X, CircleArrowOutUpRight } from 'lucide-react';
import { useCustomSelector } from '@/customHooks/customSelector';
import { usePathname, useRouter } from 'next/navigation';
import { serializeAgentFlow, BRIDGE_TYPES, useAgentLookup, normalizeConnectedRefs, shallowEqual, AgentSidebar, FlowControlPanel, AgentConfigSidebar, IntegrationGuide, } from '@/components/flowDataManager';
import { closeModal, getFromCookies, openModal, transformAgentVariableToToolCallFormat } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import CreateBridgeCards from './CreateBridgeCards';
import { createNewOrchestralFlowAction, updateOrchestralFlowAction } from '@/store/action/orchestralFlowAction';
import { useDispatch } from 'react-redux';
import FunctionParameterModal from './configuration/configurationComponent/functionParameterModal';
import { flushSync } from 'react-dom';
import DeleteModal from './UI/DeleteModal';
import { createNewOrchestralFlow, updateOrchestralFlow } from '@/config';
import Protected from './protected';

/* ========================= Helpers ========================= */
function hydrateNodes(rawNodes, ctx) {
  const {
    handleFlowChange,
    openSidebar,
    selectAgentForNode,
    handleBridgeTypeSelect,
    selectedBridgeType,
    hasMasterAgent,
    agents,
    onOpenConfigSidebar,
    openAgentVariableModal,
    requestDelete,
  } = ctx;

  return (rawNodes || [])?.map((node) => {
    const common = {
      onFlowChange: handleFlowChange,
      openSidebar,
      onSelectAgent: selectAgentForNode,
      agents,
      onOpenConfigSidebar,
      openAgentVariableModal,
      onRequestDelete: requestDelete,
    };
    const extra =
      node.type === 'bridgeNode'
        ? {
          onBridgeTypeSelect: handleBridgeTypeSelect,
          bridgeType: node?.data?.bridgeType ?? selectedBridgeType,
          hasMasterAgent,
        }
        : {};
    return { ...node, data: { ...(node.data || {}), ...common, ...extra } };
  });
}

/* ========================= Nodes ========================= */
function BridgeNode({ data }) {
  const handleBridgeClick = () => {
    const hasAgentNodes = (data?.nodes || []).some((n) => n.type === 'agentNode');
    if (!data?.bridgeType || !hasAgentNodes || !data?.hasMasterAgent) {
      data.openSidebar?.({
        mode: 'add',
        sourceNodeId: 'bridge-node-root',
        isFirstAgent: true,
        title: 'Select Master Agent',
        bridgeType: data?.bridgeType || '',
      });
      return;
    }

    // Otherwise behave as before
    const hasMaster = data.hasMasterAgent;
    if (!hasMaster) {
      data.openSidebar?.({
        mode: 'add',
        sourceNodeId: 'bridge-node-root',
        isFirstAgent: true,
        title: 'Select Master Agent',
        bridgeType: data.bridgeType,
      });
    } else {
      openModal(MODAL_TYPE.BRIDGE_TYPE_MODAL);
    }
  };

  const bridgeConfig = BRIDGE_TYPES[data?.bridgeType];
  const Icon = bridgeConfig?.icon || Plus;

  return (
    <div className="flex flex-col items-center">
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0 !w-4 !h-4"
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      />

      <button
        onClick={handleBridgeClick}
        className={`text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 nodrag relative overflow-hidden ${bridgeConfig
            ? `bg-gradient-to-r ${bridgeConfig.color} hover:opacity-90`
            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
          }`}
        title={
          bridgeConfig
            ? `${bridgeConfig.name} Bridge - Click to ${data?.hasMasterAgent ? 'change' : 'add agent'}`
            : 'Select Bridge Type'
        }
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
        <Icon className="w-8 h-8 relative z-10 mb-1" />
        {bridgeConfig && <span className="text-xs font-medium relative z-10">{bridgeConfig.name}</span>}
        {!data?.hasMasterAgent && !bridgeConfig && <span className="text-xs font-medium relative z-10">Start</span>}
      </button>

      <span className="mt-3 text-sm font-medium text-base-content">
        {bridgeConfig ? `${bridgeConfig.name} Bridge` : 'Select Bridge Type'}
      </span>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-transparent !border-0 !w-4 !h-4"
        style={{ top: '40%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
}

function AgentNode({ id, data }) {
  const pathname = usePathname();
  const orgId = useMemo(() => pathname.split('?')[0].split('/')[2], [pathname]);

  const { allFunction, allAgent } = useCustomSelector((state) => ({
    allFunction: state.bridgeReducer.org?.[orgId]?.functionData || {},
    allAgent: state.bridgeReducer.org?.[orgId]?.orgs || {},
  }));

  const handleRelabel = () => data.openSidebar({ mode: 'select', nodeId: id, title: 'Change agent' });
  const handleAdd = () => data.openSidebar({ mode: 'add', sourceNodeId: id, title: 'Add next agent' });
  const handleOpenConfig = () => data.onOpenConfigSidebar(id);

  const handleUpdateVariable = () => {
    data.openAgentVariableModal({
      selectedAgent: {
        ...data.selectedAgent,
        variables: { ...(data.selectedAgent?.variables || data.variables) },
        isMasterAgent: data.isFirstAgent,
      },
    });
  };

  const handleDeleteData = () => {
    const selectedAgent = data.selectedAgent || { name: 'Unknown Agent' };
    data.onRequestDelete(id, selectedAgent);
  };

  const functions = useMemo(() => {
    const selected = allAgent.find((a) => a._id === data.selectedAgent?._id);
    if (!selected?.function_ids || !allFunction) return [];
    return selected.function_ids.map((fid) => allFunction[fid]).filter(Boolean);
  }, [allAgent, data.selectedAgent, allFunction]);

  const isMasterAgent = data.isFirstAgent;

  return (
    <div className="w-full h-full flex flex-col items-center">
      <div className="relative flex flex-col items-center group">
        <div className="relative flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteData();
            }}
            className="absolute -top-6 -left-4 w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-base-100 shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-30 flex items-center justify-center"
            title="Delete agent"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div
            className={`relative border-2 rounded-full shadow-xl hover:shadow-2xl p-6 z-20 transition-all duration-300 hover:scale-105 group-hover:shadow-blue-100 cursor-pointer ${isMasterAgent
                ? 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-400 hover:border-amber-500'
                : 'bg-gradient-to-br from-white to-slate-50 border-slate-300 hover:border-blue-400'
              }`}
            onClick={handleUpdateVariable}
          >
            <Handle
              type="target"
              position={Position.Left}
              className="!w-4 !h-8 !bg-white !border-2 !border-gray-400 !z-[-1] -ml-5"
              style={{ top: '50%', transform: 'translateY(-50%)', borderRadius: '9999px 0 0 9999px' }}
            />

            <div className="flex items-center justify-center">
              <div
                className={`text-base-primary rounded-full p-4 shadow-inner relative ${isMasterAgent ? 'bg-gradient-to-br from-amber-100 to-amber-200' : 'bg-gradient-to-br from-primary/50 to-primary/70'
                  }`}
              >
                <div className="flex items-center justify-center">
                  <span className={`text-base-100 text-xs font-bold group-hover:hidden ${isMasterAgent ? 'uppercase' : ''}`}>
                    {data?.selectedAgent?.name?.substring(0, 2)?.toUpperCase() || (
                      <Bot className="w-8 h-8 text-base-100" />
                    )}
                  </span>
                  <Settings className="w-6 h-6 text-base-100 hidden group-hover:block transition-all duration-200 hover:scale-110" />
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAdd();
              }}
              className="hidden absolute top-1/2 -translate-y-1/2 -right-5 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-emerald-700 place-items-center hover:transition-transform group-hover:block group-hover:rotate-90 group-hover:transition-transform group-hover:duration-200 group-hover:delay-100"
              title="Add next step"
            >
              <PlusIcon className="w-6 h-6" />
            </button>

            <Handle
              type="source"
              position={Position.Right}
              className="!w-4 !h-8 !bg-white !border-2 !border-gray-400 !z-[-1] -mr-5"
              style={{ top: '50%', transform: 'translateY(-50%)', borderRadius: '0 9999px 9999px 0' }}
            />
          </div>
        </div>

        <div className="mt-4 text-center">
          <div
            className={`px-4 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold cursor-pointer transition-all duration-300 rounded-xl shadow-sm hover:shadow-md border ${isMasterAgent
                ? 'text-amber-800 hover:text-amber-900 bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 hover:border-amber-300'
                : 'text-base-content hover:text-base-content '
              }`}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenConfig();
            }}
          >
            {isMasterAgent && <span className="text-xs font-bold text-amber-600 mr-1">[MASTER]</span>}
            <div className="tooltip tooltip-bottom" data-tip={data.selectedAgent?.name ?? 'Click to select'}>
              {data.selectedAgent?.name?.substring(0, 15) ?? 'Click to select'}
              {data.selectedAgent?.name?.length > 20 && (
                <span className="ml-1 text-xs font-light">...</span>
              )}
            </div>
            <div className="tooltip tooltip-right" data-tip="Configure Agent">
              <CircleArrowOutUpRight className="text-base-content" size={16} />
            </div>
          </div>

          {functions.length > 0 && (
            <div className="inline-flex items-center mt-2 px-2 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 rounded-full border border-orange-300 shadow-sm">
              <Settings className="w-3 h-3 mr-1" />
              {functions.length} function{functions.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { bridgeNode: BridgeNode, agentNode: AgentNode };

/* ========================= Edges ========================= */
function MakeStyleEdge(props) {
  const { sourceX, sourceY, targetX, targetY, selected, style = {} } = props;

  const xDistance = Math.abs(sourceX - targetX);
  const controlPointX1 = sourceX + xDistance * 0.5;
  const controlPointX2 = targetX - xDistance * 0.5;

  const edgePath = `M${sourceX},${sourceY} C ${controlPointX1},${sourceY} ${controlPointX2},${targetY} ${targetX},${targetY}`;
  const isActive = style.animated || selected;

  return (
    <g>
      <path
        d={edgePath}
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="8 6"
        strokeLinecap="round"
        opacity={isActive ? 0.9 : 0.7}
        className="transition-opacity duration-300"
      >
        <animate attributeName="stroke-dashoffset" values="0;-14;0" dur="2s" repeatCount="indefinite" />
      </path>

      <circle cx={sourceX} cy={sourceY} r="4" fill="#10b981" opacity="0.3" className="animate-pulse" />
      <circle cx={targetX} cy={targetY} r="4" fill="#10b981" opacity="0.3" className="animate-pulse" style={{ animationDelay: '1s' }} />
    </g>
  );
}

const edgeTypes = { default: MakeStyleEdge, smoothstep: MakeStyleEdge, step: MakeStyleEdge, fancy: MakeStyleEdge };
const defaultEdgeOptions = { type: 'default', style: { animated: true } };

/* ========================= Flow ======================== */
function Flow({ params, orchestralData, name, description, createdFlow, setIsLoading, isDrafted, discardedData, isEmbedUser }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const initialEdges = useMemo(() => orchestralData?.edges ?? [], [orchestralData]);
  const initialNodes = useMemo(() => {
    const seed = orchestralData?.nodes ?? (Array.isArray(orchestralData) ? orchestralData : []) ?? [];
    return seed.map((node) => ({ ...node, data: { ...(node.data || {}), onFlowChange: null, openSidebar: null } }));
  }, [orchestralData]);

  const [edges, setEdges] = useState(initialEdges);
  const [nodes, setNodes] = useState(initialNodes);

  // Keep stable refs for debounced save
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  useEffect(() => void (nodesRef.current = nodes), [nodes]);
  useEffect(() => void (edgesRef.current = edges), [edges]);

  useEffect(() => {
    const existingScript = document.getElementById('gtwy-user-script');
    if (existingScript) existingScript.remove();

    if (params?.org_id) {
      const scriptId = 'gtwy-user-script';
      const scriptURl =
        process.env.NEXT_PUBLIC_ENV !== 'PROD'
          ? `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy_dev.js`
          : `${process.env.NEXT_PUBLIC_FRONTEND_URL}/gtwy.js`;
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = scriptURl;
      script.setAttribute('skipLoadGtwy', true);
      script.setAttribute('token', sessionStorage.getItem('proxy_token') || getFromCookies('proxy_token'));
      script.setAttribute('org_id', params?.org_id);
      script.setAttribute('customIframeId', 'gtwyEmbedInterface');
      script.setAttribute('gtwy_user', true);
      script.setAttribute('parentId', 'gtwy');
      script.setAttribute('hideHeader', true);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById('gtwy-user-script');
      if (script) {
        script.remove();
        sessionStorage.removeItem('orchestralUser');
      }
    };
  }, [params]);

  const [shouldLayout, setShouldLayout] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [masterAgent, setMasterAgent] = useState(null);
  const [isDiscard, setIsDiscard] = useState(false);
  const [isVariableModified, setIsVariableModified] = useState(false);

  const { agents } = useCustomSelector((state) => ({ agents: state.bridgeReducer.org[params.org_id]?.orgs || [] }));

  const [configSidebar, setConfigSidebar] = useState({ isOpen: false, nodeId: null, agent: null });
  const [integrationGuide, setIntegrationGuide] = useState({ isOpen: false, params: params });

  const [selectedAgent, setSelectedAgent] = useState(null);
  const [toolData, setToolData] = useState(null);
  const [variablesPath, setVariablesPath] = useState({});
  const [currentVariable, setCurrentVariable] = useState({});

  const [selectedBridgeType, setSelectedBridgeType] = useState(() => {
    const bridgeNode =
      (orchestralData?.nodes || []).find?.((n) => n.type === 'bridgeNode') ||
      (Array.isArray(orchestralData) ? orchestralData.find((n) => n.type === 'bridgeNode') : null);
    return bridgeNode?.data?.bridgeType || '';
  });

  const [pendingDelete, setPendingDelete] = useState(null);

  const openConfigSidebar = useCallback(
    (nodeId) => {
      const node = nodes.find((n) => n.id === nodeId);
      const agent = agents.find((a) => a._id === (node?.data?.selectedAgent?._id || nodeId));
      if (typeof window !== 'undefined' && window.GtwyEmbed) {
        window.GtwyEmbed.sendDataToGtwy({ agent_id: agent?._id });
        setTimeout(() => {
          window.openGtwy?.({ agent_id: selectedAgent?._id });
        }, 2000);
      }
      setConfigSidebar({ isOpen: true, nodeId, agent });
    },
    [nodes, agents, selectedAgent]
  );

  const requestDelete = useCallback((nodeId, selectedAgent) => {
    setPendingDelete({ id: nodeId, selectedAgent });
    openModal(MODAL_TYPE.DELETE_MODAL);
  }, []);

  const confirmDelete = useCallback(() => {
    setPendingDelete((current) => {
      if (!current?.id) return current;
      handleFlowChange({ action: 'DELETE_NODE', payload: { nodeId: current.id } });
      return null;
    });
    closeModal(MODAL_TYPE.DELETE_MODAL);
  }, []);

  // Debounced save (stable)
  const saveTimeoutRef = useRef(null);
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      if (currentNodes.length > 0) {
        try {
          const currentFlowData = serializeAgentFlow(currentNodes, currentEdges, {
            name: name || 'Flow',
            description: description || '',
            bridge_type: selectedBridgeType,
            status: 'draft',
          });

          const existingData = orchestralData || {};

          const saveStructure = {
            agents: nodes.length === 1 ? currentFlowData?.agents : serializeAgentFlow(existingData.nodes, existingData.edges, {
              name: existingData.flow_name || 'Flow',
              description: existingData.flow_description || '',
              bridge_type: existingData.bridge_type,
              status: existingData.status || 'draft',
            })?.agents,
            flow_name: name || 'Flow',
            flow_description: description || '',
            bridge_type: selectedBridgeType,
            status: existingData.status || 'draft',
            data: currentFlowData,
            org_id: params.org_id,
            master_agent: currentFlowData.master_agent,
            master_agent_name: name || 'Flow',
          };

          if (params.orchestralId) {
            await updateOrchestralFlow(saveStructure, params.orchestralId);
          } else {
            const response = await createNewOrchestralFlow(saveStructure);
            if (response.data?.data?.orchestrator_id && !params.orchestralId) {
              window.history.replaceState(
                null,
                '',
                `/org/${params.org_id}/orchestratal_model/${response.data.data.orchestrator_id}`
              );
            }
          }
        } catch (error) {
          console.error('Save failed:', error);
        }
      }
    }, 300);
  }, [selectedBridgeType, name, description, params.orchestralId, params.org_id, orchestralData]);

  const openAgentVariableModal = useCallback(
    (payload) => {
      const sel = payload?.selectedAgent;
      if (!sel?._id) return;

      const agent = agents.find((a) => a._id === sel._id);
      const normalized =
        sel?.variables && Object.keys(sel.variables || {}).length > 0
          ? sel.variables
          : transformAgentVariableToToolCallFormat(agent?.agent_variables || {});

      const base = {
        name: sel?.name || '',
        description: sel?.description || '',
        fields: normalized.fields || {},
        required_params: normalized.required_params || [],
      };

      setNodes((currentNodes) => {
        setEdges((currentEdges) => {
          const currentNode = currentNodes.find((node) => node.data?.selectedAgent?._id === sel._id);
          const incomingEdge = currentNode ? currentEdges.find((edge) => edge.target === currentNode.id) : null;
          const parentNode = incomingEdge ? currentNodes.find((node) => node.id === incomingEdge.source) : null;

          const parentVariablesPath = parentNode?.data?.selectedAgent?.variables_path || {};
          flushSync(() => {
            setCurrentVariable(base);
            setSelectedAgent(sel);
            setToolData({ ...base, thread_id: !!sel?.thread_id });
            setVariablesPath({ ...(parentVariablesPath[sel._id] || parentVariablesPath || {}) });
          });

          openModal(MODAL_TYPE.ORCHESTRAL_AGENT_PARAMETER_MODAL);
          return currentEdges;
        });
        return currentNodes;
      });
    },
    [agents]
  );

  const closeConfigSidebar = useCallback(() => setConfigSidebar({ isOpen: false, nodeId: null, agent: null }), []);

  const handleSaveAgentParameters = useCallback(() => {
    const nodeToUpdate = nodes.find((node) => node.type === 'agentNode' && node.data?.selectedAgent?._id === selectedAgent?._id);
    if (!nodeToUpdate) return;

    const incomingEdge = edges.find((edge) => edge.target === nodeToUpdate.id);
    const parentNode = incomingEdge ? nodes.find((node) => node.id === incomingEdge.source) : null;

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === nodeToUpdate.id) {
          return {
            ...node,
            data: {
              ...node.data,
              selectedAgent: {
                ...node.data.selectedAgent,
                description: toolData?.description,
                variables: toolData,
                thread_id: toolData?.thread_id ? toolData?.thread_id : false,
                variables_path: variablesPath || {},
              },
            },
          };
        }

        if (parentNode && node.id === parentNode.id && selectedAgent?._id) {
          const currentVariablesPath = node.data?.selectedAgent?.variables_path || {};
          return {
            ...node,
            data: {
              ...node.data,
              selectedAgent: {
                ...node.data.selectedAgent,
                variables_path: {
                  ...currentVariablesPath,
                  [selectedAgent._id]: variablesPath || {},
                },
              },
            },
          };
        }

        return node;
      })
    );

    setIsModified(true);
    setIsVariableModified(true);
  }, [nodes, edges, selectedAgent, variablesPath, toolData]);

  useEffect(() => {
    setIsModified(
      isDrafted ||
      (!(orchestralData.length > 0)
        ? nodes.length !== orchestralData?.nodes?.length || edges.length !== orchestralData?.edges?.length
        : nodes.length > 0)
    );
  }, [nodes, edges, isDrafted, orchestralData]);

  const [sidebar, setSidebar] = useState({
    isOpen: false,
    mode: null,
    title: '',
    sourceNodeId: null,
    isFirstAgent: false,
    nodeId: null,
    bridgeType: null,
  });
  const [lastSidebarContext, setLastSidebarContext] = useState(null);

  const openSidebar = useCallback((ctx) => {
    const newSidebarState = { ...ctx, isOpen: true };
    setSidebar((s) => ({ ...s, ...newSidebarState }));
    setLastSidebarContext(newSidebarState);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebar({
      isOpen: false,
      mode: null,
      title: '',
      sourceNodeId: null,
      isFirstAgent: false,
      nodeId: null,
      bridgeType: null,
    });
  }, []);

  const { resolve: resolveAgent } = useAgentLookup(agents);

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', data: {} }, eds)), []);

  /* Initial hydration (once) */
  useEffect(() => {
    setNodes((current) =>
      hydrateNodes(current, {
        handleFlowChange,
        openSidebar,
        selectAgentForNode,
        handleBridgeTypeSelect,
        selectedBridgeType,
        hasMasterAgent: current.some((n) => n.type === 'agentNode' && n.data?.isFirstAgent),
        agents,
        onOpenConfigSidebar: openConfigSidebar,
        openAgentVariableModal,
        requestDelete,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDiscard = useCallback(() => {
    setNodes(() => {
      const seed = discardedData?.nodes ?? (Array.isArray(discardedData) ? discardedData : []) ?? [];
      return seed.map((node) => ({ ...node, data: { ...(node.data || {}), onFlowChange: null, openSidebar: null } }));
    });
    setEdges(() => discardedData?.edges ?? []);
    setSelectedBridgeType(() => {
      const bridgeNode =
        (discardedData?.nodes || []).find?.((n) => n.type === 'bridgeNode') ||
        (Array.isArray(discardedData) ? discardedData.find((n) => n.type === 'bridgeNode') : null);
      return bridgeNode?.data?.bridgeType || '';
    });
    setIsDiscard((v) => !v);
    setIsVariableModified(false);
  }, [discardedData]);

  /* Load/replace flow runtime */
  useEffect(() => {
    const dataSource = orchestralData?.data || orchestralData;
    const nodesToLoad = dataSource?.nodes || [];
    const edgesToLoad = dataSource?.edges || [];

    if (nodesToLoad.length > 0 || edgesToLoad.length > 0) {
      setNodes(() =>
        hydrateNodes(nodesToLoad, {
          handleFlowChange,
          openSidebar,
          selectAgentForNode,
          handleBridgeTypeSelect,
          selectedBridgeType,
          hasMasterAgent: nodesToLoad.some((n) => n.type === 'agentNode' && n.data?.isFirstAgent),
          agents,
          onOpenConfigSidebar: openConfigSidebar,
          openAgentVariableModal,
          requestDelete,
        })
      );
      setEdges(edgesToLoad);
      setShouldLayout(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orchestralData, isDiscard]);

  const selectAgentForNode = useCallback((nodeId, agent) => {
    setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, selectedAgent: agent } } : n)));
  }, []);

  const handleBridgeTypeSelect = useCallback(
    (bridgeType) => {
      setSelectedBridgeType(bridgeType);
      setNodes((nds) => nds.map((n) => (n.type === 'bridgeNode' ? { ...n, data: { ...n.data, bridgeType } } : n)));
      closeModal(MODAL_TYPE.BRIDGE_TYPE_MODAL);

      const hasMaster = nodes.some((n) => n.type === 'agentNode' && n.data?.isFirstAgent);
      if (!hasMaster) {
        const bridgeNode = nodes.find((n) => n.type === 'bridgeNode');
        const bridgeNodeId = bridgeNode ? bridgeNode.id : 'bridge-node-root';
        openSidebar({ mode: 'add', sourceNodeId: bridgeNodeId, isFirstAgent: true, title: 'Select Master Agent', bridgeType });
      }
    },
    [nodes, openSidebar]
  );

  /* Ensure one bridge node baseline */
  useEffect(() => {
    if (nodes.length === 0 && Object.keys(agents).length > 0) {
      setNodes([
        {
          id: 'bridge-node-root',
          type: 'bridgeNode',
          position: { x: 80, y: 200 },
          data: {
            onFlowChange: handleFlowChange,
            agents,
            openSidebar,
            onBridgeTypeSelect: handleBridgeTypeSelect,
            bridgeType: selectedBridgeType,
            hasMasterAgent: false,
          },
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, selectedBridgeType]);

  /* Keep node data fresh */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const common = { agents, openSidebar };
        const extra = node.type === 'bridgeNode' ? { onBridgeTypeSelect: handleBridgeTypeSelect, bridgeType: selectedBridgeType, masterAgent } : {};
        const nextData = { ...node.data, ...common, ...extra };
        if (shallowEqual(node.data, nextData)) return node;
        return { ...node, data: nextData };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents, selectedBridgeType, masterAgent]);

  /* Mark last nodes by edges */
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'agentNode') return n;
        const hasOutgoing = edges.some((e) => e.source === n.id);
        const isLast = !hasOutgoing;
        if (n.data?.isLast === isLast) return n;
        return { ...n, data: { ...n.data, isLast } };
      })
    );
  }, [edges]);

  /* Auto layout */
  const applyAutoLayout = useCallback(() => {
    const HORIZONTAL_SPACING = 280;
    const VERTICAL_SPACING = 200;
    const BASE_Y = 400;

    const bridgeNode = nodes.find((n) => n.type === 'bridgeNode');
    if (!bridgeNode || nodes.length <= 1) return;

    const getLayoutedNodes = (nodesToLayout, edgesToLayout) => {
      const graph = new Map(nodesToLayout.map((n) => [n.id, []]));
      edgesToLayout.forEach((e) => {
        if (graph.has(e.source)) graph.get(e.source).push(e.target);
      });

      const nodeLevels = new Map();
      const nodeOrder = new Map();
      const queue = [[bridgeNode.id, 0]];
      const visited = new Set([bridgeNode.id]);
      nodeLevels.set(bridgeNode.id, 0);
      nodeOrder.set(bridgeNode.id, 0);

      const levelCounts = new Map([[0, 1]]);

      while (queue.length > 0) {
        const [currId, level] = queue.shift();
        const children = graph.get(currId) || [];
        children.forEach((childId) => {
          if (!visited.has(childId)) {
            visited.add(childId);
            const childLevel = level + 1;
            const currentLevelCount = levelCounts.get(childLevel) || 0;
            nodeLevels.set(childId, childLevel);
            nodeOrder.set(childId, currentLevelCount);
            levelCounts.set(childLevel, currentLevelCount + 1);
            queue.push([childId, childLevel]);
          }
        });
      }

      const newNodes = [];
      nodesToLayout.forEach((node) => {
        const level = nodeLevels.get(node.id);
        const order = nodeOrder.get(node.id);
        const levelNodeCount = levelCounts.get(level) || 1;

        if (level !== undefined && order !== undefined) {
          const x = level * HORIZONTAL_SPACING + 80;
          let y;
          if (levelNodeCount === 1) {
            y = BASE_Y;
          } else {
            const total = (levelNodeCount - 1) * VERTICAL_SPACING;
            const startY = BASE_Y - total / 2;
            y = startY + order * VERTICAL_SPACING;
          }
          newNodes.push({ ...node, position: { x, y }, style: { ...node.style, transition: 'all 0.8s cubic-bezier(0.4,0,0.2,1)' } });
        }
      });
      return newNodes;
    };

    setNodes(getLayoutedNodes(nodes, edges));
  }, [nodes, edges]);

  useEffect(() => {
    if (shouldLayout && nodes.length > 1) {
      const t = setTimeout(() => {
        applyAutoLayout();
        setShouldLayout(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [shouldLayout, applyAutoLayout, nodes.length]);

  /* Save flow */
  const handleSaveAgentStructure = useCallback(
    async (metadata) => {
      try {
        !metadata.createdFlow && metadata.setIsLoading(true);
        const firstAgentNode = nodes.find((n) => n.type === 'agentNode' && n.data?.isFirstAgent && n.data?.selectedAgent);
        const masterAgentData = firstAgentNode?.data?.selectedAgent;
        if (!masterAgentData) {
          alert('Please select a master agent first');
          return;
        }

        const currentFlowData = serializeAgentFlow(nodes, edges, {
          ...metadata,
          org_id: params.org_id,
          bridge_type: selectedBridgeType,
          master_agent: masterAgentData?._id || masterAgentData.bridge_id || masterAgentData.name,
          master_agent_name: masterAgentData.name,
        });

        const agentStructure = {
          flow_name: metadata.name || 'Draft Flow',
          flow_description: metadata.description || '',
          bridge_type: selectedBridgeType,
          status: 'publish',
          agents: currentFlowData?.agents,
          data: currentFlowData,
          org_id: params.org_id,
          master_agent: masterAgentData?._id || masterAgentData.bridge_id || masterAgentData.name,
          master_agent_name: masterAgentData.name,
        };

        const id = await dispatch(
          metadata.createdFlow
            ? updateOrchestralFlowAction(agentStructure, params.org_id, params.orchestralId)
            : createNewOrchestralFlowAction(agentStructure, params.org_id)
        ).then((response) => response.data.id);
        setIsVariableModified(false);
        if (id && !metadata.createdFlow) router.push(`/org/${params.org_id}/orchestratal_model/${id}`);
      } catch (error) {
        console.error('Error saving agent structure:', error);
      }
    },
    [nodes, edges, params.org_id, selectedBridgeType, dispatch, router, params.orchestralId]
  );

  /* Subgraph / add nodes */
  const createFanoutSubgraph = useCallback(
    (sourceNodeId, rootAgent, childRefs, isFirstAgent = false, visitedAgents = new Set()) => {
      const rootAgentKey = rootAgent?._id || rootAgent?.bridge_id || rootAgent?.name;
      if (!rootAgentKey || visitedAgents.has(rootAgentKey)) return;

      const newVisitedAgents = new Set(visitedAgents);
      newVisitedAgents.add(rootAgentKey);

      const rootNodeId = rootAgentKey;
      if (isFirstAgent) setMasterAgent(rootAgent);

      let rootPos = isFirstAgent ? { x: 360, y: 400 } : { x: 530, y: 400 };

      setNodes((current) => {
        const sourceNode = current.find((n) => n.id === sourceNodeId);
        if (sourceNode && !isFirstAgent) {
          rootPos = { x: sourceNode.position.x + 250, y: sourceNode.position.y };
        }

        const newRoot = {
          id: rootNodeId,
          type: 'agentNode',
          position: rootPos,
          data: {
            onFlowChange: handleFlowChange,
            onSelectAgent: selectAgentForNode,
            agents,
            selectedAgent: {
              ...agents.find?.((bridge) => bridge._id === rootAgentKey),
              description: rootAgent.description,
              thread_id: rootAgent.thread_id,
              variables: rootAgent.variables,
            },
            isFirstAgent: !!isFirstAgent,
            openSidebar,
            isLast: true,
            onOpenConfigSidebar: openConfigSidebar,
            openAgentVariableModal,
            onRequestDelete: requestDelete,
          },
          style: { transition: 'all 0.4s ease-in-out' },
        };
        return [...current, newRoot];
      });

      setEdges((eds) => addEdge({ id: `e-${sourceNodeId}-${rootNodeId}`, source: sourceNodeId, target: rootNodeId, type: 'smoothstep', data: {} }, eds));

      const unique = new Set();
      const immediateChildren = normalizeConnectedRefs(childRefs)
        .map((ref) => resolveAgent(ref))
        .filter((a) => {
          if (!a) return false;
          const key = a.bridge_id || a.name;
          if (newVisitedAgents.has(key) || unique.has(key)) return false;
          unique.add(key);
          return true;
        });

      if (immediateChildren.length > 0) {
        setNodes((nds) => nds.map((n) => (n.id === rootNodeId ? { ...n, data: { ...n.data, isLast: false } } : n)));

        immediateChildren.forEach((child, i) => {
          const childBridge = { ...agents.find?.((bridge) => bridge._id === child.bridge_id), description: child.description };
          const childConnectedRefs = normalizeConnectedRefs(childBridge?.connected_agents || []);
          setTimeout(() => {
            createFanoutSubgraph(rootNodeId, childBridge, childConnectedRefs, false, newVisitedAgents);
          }, 100 * i);
        });
      }

      setTimeout(() => setShouldLayout(true), 200);
      setTimeout(() => debouncedSave(), 100);
    },
    [agents, selectAgentForNode, openSidebar, resolveAgent, openConfigSidebar]
  );

  const handleFlowChange = useCallback(
    (change) => {
      const { action, payload } = change;

      if (action === 'ADD_NODE') {
        const { sourceNodeId, agent, isFirstAgent } = payload;
        const childrenRefs = normalizeConnectedRefs(agent.connected_agents);
        const nodeId = agent._id || agent.id || agent.bridge_id || agent.name;

        if (childrenRefs.length > 0) {
          createFanoutSubgraph(sourceNodeId, agent, childrenRefs, isFirstAgent, new Set());
        } else {
          const newNodeId = nodeId;
          if (isFirstAgent) setMasterAgent(agent);
          setNodes((currentNodes) => {
            const sourceNode = currentNodes.find((n) => n.id === sourceNodeId);
            if (!sourceNode) return currentNodes;
            const sourcePosition = sourceNode.position;
            const newPosition = isFirstAgent ? { x: sourcePosition.x + 280, y: sourcePosition.y } : { x: sourcePosition.x + 250, y: sourcePosition.y };
            const newNode = {
              id: newNodeId,
              type: 'agentNode',
              position: newPosition,
              data: {
                onFlowChange: handleFlowChange,
                onSelectAgent: selectAgentForNode,
                selectedAgent: agent,
                isFirstAgent: !!isFirstAgent,
                openSidebar,
                isLast: true,
                onOpenConfigSidebar: openConfigSidebar,
                openAgentVariableModal,
                onRequestDelete: requestDelete,
              },
              style: { transition: 'all 0.4s ease-in-out' },
            };
            return [...currentNodes, newNode];
          });

          setEdges((currentEdges) => addEdge({ id: `e-${sourceNodeId}-${newNodeId}`, source: sourceNodeId, target: newNodeId, type: 'smoothstep', data: {} }, currentEdges));

          setTimeout(() => setShouldLayout(true), 100);
          setTimeout(() => debouncedSave(), 100);
        }
      }

      if (action === 'DELETE_NODE') {
        const { nodeId } = payload;
        const nodeToDelete = nodes.find((n) => n.id === nodeId);
        if (nodeToDelete?.data?.isFirstAgent) setMasterAgent(null);
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
        setTimeout(() => setShouldLayout(true), 100);
        setTimeout(() => debouncedSave(), 100);
      }
    },
    [createFanoutSubgraph, nodes, openConfigSidebar, selectAgentForNode, openSidebar]
  );

  const fitViewOptions = useMemo(() => ({ padding: 0.2, duration: 800, includeHiddenNodes: false }), []);

  const openIntegrationGuide = () => setIntegrationGuide({ isOpen: true, params });
  const closeIntegrationGuide = () => setIntegrationGuide({ isOpen: false, params });

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      <FlowControlPanel
        onSaveAgent={handleSaveAgentStructure}
        onDiscard={handleDiscard}
        bridgeType={selectedBridgeType}
        name={name}
        description={description}
        createdFlow={createdFlow}
        isModified={isModified}
        setIsLoading={setIsLoading}
        params={params}
        isVariableModified={isVariableModified}
        openIntegrationGuide={openIntegrationGuide}
        closeIntegrationGuide={closeIntegrationGuide}
        isEmbedUser={isEmbedUser}
      />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        fitView
        fitViewOptions={fitViewOptions}
        colorMode={getFromCookies('theme')}
      >
        <Controls showInteractive={false} className="!bg-white/80 !backdrop-blur-md !border-white/60 !shadow-lg !rounded-xl" />
        <Background variant={BackgroundVariant.Dots} gap={32} size={1.5} color="#e2e8f0" className="opacity-60" />
      </ReactFlow>

      <CreateBridgeCards handleBridgeTypeSelection={handleBridgeTypeSelect} selectedBridgeTypeCard={selectedBridgeType} isModal />

      <AgentSidebar
        isOpen={sidebar.isOpen}
        title={sidebar.title}
        agents={agents}
        onClose={closeSidebar}
        onChoose={(agent) => {
          const contextToUse = sidebar.mode ? sidebar : lastSidebarContext;
          if (contextToUse?.mode === 'add') {
            handleFlowChange({ action: 'ADD_NODE', payload: { sourceNodeId: contextToUse.sourceNodeId, agent, isFirstAgent: contextToUse.isFirstAgent } });
          } else if (contextToUse?.mode === 'select') {
            selectAgentForNode(contextToUse.nodeId, agent);
          }
          closeSidebar();
        }}
        nodes={nodes}
        params={params}
      />

      <AgentConfigSidebar isOpen={configSidebar.isOpen} onClose={closeConfigSidebar} agent={configSidebar.agent} instanceId="agent-configuration-sidebar" />
      <IntegrationGuide isOpen={integrationGuide.isOpen} onClose={closeIntegrationGuide} params={params} />

      <DeleteModal
        onConfirm={confirmDelete}
        item={pendingDelete?.selectedAgent}
        title="Remove Agent"
        description={`Are you sure you want to remove ${agents.find((agent) => agent._id === pendingDelete?.id)?.name || 'this agent'}? It will also remove its child agents. This action cannot be undone.`}
        key={pendingDelete?.selectedAgent?._id || 'no-agent'}
      />

      <FunctionParameterModal
        key={selectedAgent?._id || 'no-agent'}
        name="orchestralAgent"
        Model_Name={MODAL_TYPE.ORCHESTRAL_AGENT_PARAMETER_MODAL}
        function_details={currentVariable || {}}
        functionName={selectedAgent?.name || ''}
        functionId={selectedAgent?._id || ''}
        toolData={toolData || {}}
        setToolData={setToolData || (() => { })}
        variablesPath={variablesPath || []}
        setVariablesPath={setVariablesPath || (() => { })}
        variables_path={{ [selectedAgent?.name || '']: variablesPath || [] }}
        handleSave={handleSaveAgentParameters || (() => { })}
        handleRemove={() => { }}
        isMasterAgent={selectedAgent?.isMasterAgent}
      />
    </div>
  );
}

/* ========================= Wrapper ========================= */
const AgentToAgentConnection = ({ params, orchestralData = [], name, description, createdFlow = false, setIsLoading, isDrafted = false, discardedData, isEmbedUser }) => {
  return (
    <ReactFlowProvider>
      <Flow
        params={params}
        orchestralData={orchestralData}
        name={name}
        description={description}
        createdFlow={createdFlow}
        setIsLoading={setIsLoading}
        isDrafted={isDrafted}
        discardedData={discardedData}
        isEmbedUser={isEmbedUser}
      />
    </ReactFlowProvider>
  );
}
export default Protected(AgentToAgentConnection);