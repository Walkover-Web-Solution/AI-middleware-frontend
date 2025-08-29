
import {
  Upload, Save, TestTube, Play, ChevronRight, Loader2, Plus, X, Search, Bot, PlusIcon, Settings, Zap, MessageSquare, Globe,
  File,
  FileSlidersIcon
} from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from "react";
import AgentDescriptionModal from "./modals/AgentDescriptionModal";
import { closeModal, openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';
import Chat from './configuration/chat';
import Link from 'next/link';
import GenericTable from './table/table';
import CopyButton from './copyButton/copyButton';

/* ---------------------------------------------
   Shared SlideOver (overlay + slide animation)
---------------------------------------------- */
function SlideOver({
  isOpen,
  onClose,
  widthClass = 'w-[360px] max-w-[85vw]',
  children,
  header,
  className = '',
  bodyClassName = '',
  overlayZ = 'z-[99998]',
  panelZ = 'z-[99999]',
  backDropBlur = true,
}) {
  // close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 ${overlayZ} ${backDropBlur ? 'backdrop-blur-sm bg-black/40' : ''}  transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Panel */}
      <aside
        data-state={isOpen ? 'open' : 'closed'}
        className={`fixed top-0 right-0 h-full ${widthClass} bg-base-100 border border-base-content/50 ${panelZ}
          transform-gpu transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
        style={{ transition: 'transform 300ms ease-in-out' }} // fallback if utilities get purged
        role="dialog"
        aria-modal="true"
      >
        {header}
        <div className={`h-full overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
      </aside>
    </>
  );
}

/* -------------------------------------------------------
   Serialization: React Flow -> Agent Structure
-------------------------------------------------------- */
export function serializeAgentFlow(nodes, edges, metadata = {}) {
  try {
    const agentNodes = nodes.filter(
      node => node.type === 'agentNode' && node.data?.selectedAgent
    );
    if (agentNodes.length === 0) throw new Error('No agent nodes found in the flow');

    const childrenMap = new Map();
    const parentsMap = new Map();
    agentNodes.forEach(node => {
      childrenMap.set(node.id, []);
      parentsMap.set(node.id, []);
    });

    edges.forEach(edge => {
      const sourceNode = agentNodes.find(n => n.id === edge.source);
      const targetNode = agentNodes.find(n => n.id === edge.target);
      if (sourceNode && targetNode) {
        childrenMap.get(edge.source).push(edge.target);
        parentsMap.get(edge.target).push(edge.source);
      }
    });

    const masterNode =
      agentNodes.find(node => node.data?.isFirstAgent) ||
      agentNodes.find(node => (parentsMap.get(node.id) || []).length === 0) ||
      agentNodes[0];

    if (!masterNode) throw new Error('Could not determine master agent');

    const agents = {};
    agentNodes.forEach(node => {
      const sel = node.data.selectedAgent;
      const nodeId = node.id;

      const parentAgents = (parentsMap.get(nodeId) || [])
        .map(pid => {
          const p = agentNodes.find(n => n.id === pid);
          const s = p?.data?.selectedAgent;
          return s?._id || s?.id || s?.bridge_id || s?.name;
        })
        .filter(Boolean);

      const childAgents = (childrenMap.get(nodeId) || [])
        .map(cid => {
          const c = agentNodes.find(n => n.id === cid);
          const s = c?.data?.selectedAgent;
          return s?._id || s?.id || s?.bridge_id || s?.name;
        })
        .filter(Boolean);

      const agentKey = sel._id || sel.id || sel.bridge_id || sel.name || `agent_${Date.now()}`;
      agents[agentKey] = {
        name: sel.name,
        description: sel.description || `Agent: ${sel.name}`,
        parentAgents,
        childAgents,
        thread_id: sel.thread_id ? sel.thread_id : false,
        variables_path: sel.variables_path ? sel.variables_path : {},
        variables: sel.variables ? sel.variables : {},
        agent_variables: sel.agent_variables ? sel.agent_variables : {},
      };
    });

    const result = {
      agents,
      master_agent:
        masterNode?.id ||
        masterNode?.data?.selectedAgent?.id ||
        masterNode?.data?.selectedAgent?.bridge_id ||
        masterNode?.data?.selectedAgent?.name ||
        Object.keys(agents)[0],
      status: metadata.status || 'draft',
      flow_name: metadata.name || 'Untitled Flow',
      flow_description: metadata.description || '',
      bridge_type: metadata.bridge_type || null,
    };

    return result;
  } catch (error) {
    console.error('Error serializing agent flow:', error);
    throw new Error(`Serialization failed: ${error.message}`);
  }
}

export function validateAgentFlow(serializedFlow) {
  const errors = [];
  if (!serializedFlow.agents || Object.keys(serializedFlow.agents).length === 0) {
    errors.push('No agents found in serialized flow');
  }
  if (!serializedFlow.master_agent) {
    errors.push('No master agent specified');
  } else if (!serializedFlow.agents[serializedFlow.master_agent]) {
    errors.push('Master agent not found in agents list');
  }

  Object.entries(serializedFlow.agents || {}).forEach(([agentKey, agent]) => {
    if (!agent.name) errors.push(`Agent ${agentKey} missing name`);
    if (agent.connected_agents) {
      agent.connected_agents.forEach((connectedAgent, index) => {
        if (!connectedAgent.bridge_id && !connectedAgent.name) {
          errors.push(`Agent ${agentKey} has invalid connected agent at index ${index}`);
        }
      });
    }
  });

  return { isValid: errors.length === 0, errors };
}

/* -------------------------------------------------------
   Agent Structure -> React Flow {nodes, edges}
-------------------------------------------------------- */
export function createNodesFromAgentDoc(doc) {
  if (!doc || !doc.agents || Object.keys(doc.agents).length === 0) {
    throw new Error('No agents found in data');
  }

  const nodes = [];
  const edges = [];

  const HORIZONTAL_SPACING = 280;
  const VERTICAL_SPACING = 200;
  const BASE_Y = 400;

  nodes.push({
    id: 'bridge-node-root',
    type: 'bridgeNode',
    position: { x: 80, y: BASE_Y },
    data: {
      bridgeType: doc.bridge_type || 'api',
      hasMasterAgent: !!doc.master_agent,
    },
  });

  const agents = doc.agents;
  const masterAgentKey = doc.master_agent;

  const graph = new Map();
  Object.entries(agents).forEach(([id, a]) => {
    graph.set(id, { name: a.name, description: a.description, children: a.childAgents, variables: a.variables, thread_id:a.thread_id || [] });
  });

  const levels = new Map();
  const q = [[masterAgentKey, 0]];
  levels.set(masterAgentKey, 0);

  while (q.length) {
    const [current, level] = q.shift();
    const node = graph.get(current);
    if (!node) continue;
    for (const child of node.children) {
      if (!levels.has(child)) {
        levels.set(child, level + 1);
        q.push([child, level + 1]);
      }
    }
  }

  const levelCounts = {};
  for (const lvl of levels.values()) levelCounts[lvl] = (levelCounts[lvl] || 0) + 1;

  const levelPositions = {};
  Object.entries(levelCounts).forEach(([lvlStr, count]) => {
    const lvl = parseInt(lvlStr, 10);
    levelPositions[lvl] = [];
    if (count === 1) {
      levelPositions[lvl].push(BASE_Y);
    } else {
      const total = (count - 1) * VERTICAL_SPACING;
      const startY = BASE_Y - total / 2;
      for (let i = 0; i < count; i++) levelPositions[lvl].push(startY + i * VERTICAL_SPACING);
    }
  });

  const levelCounters = {};

  Object.entries(agents).forEach(([id, a]) => {
    const level = levels.get(id) ?? 0;
    const idx = levelCounters[level] || 0;
    levelCounters[level] = idx + 1;
    const y = (levelPositions[level] && levelPositions[level][idx]) ?? BASE_Y;

    nodes.push({
      id,
      type: 'agentNode',
      position: { x: 80 + level * HORIZONTAL_SPACING, y },
      data: {
        selectedAgent: { _id: id, name: a.name, description: a.description },
        isFirstAgent: id === masterAgentKey,
        isLast: (a.childAgents || []).length === 0,
        thread_id: a.thread_id,
        variables: a.variables,
      },
    });
  });

  if (masterAgentKey) {
    edges.push({
      id: `edge-root-${masterAgentKey}`,
      source: 'bridge-node-root',
      target: masterAgentKey,
      type: 'smoothstep',
      style: { animated: true },
    });
  }

  Object.entries(agents).forEach(([id, a]) => {
    (a.childAgents || []).forEach((child) => {
      edges.push({
        id: `edge-${id}-${child}`,
        source: id,
        target: child,
        type: 'smoothstep',
        style: { animated: true },
      });
    });
  });

  return { nodes, edges };
}

/* -------------------------------------------------------
   Packing Helpers
-------------------------------------------------------- */
export function packFlow(flow) {
  return encodeURIComponent(btoa(JSON.stringify(flow)));
}
export function unpackFlow(packed) {
  try { return JSON.parse(atob(decodeURIComponent(packed))); }
  catch { return null; }
}

/* -------------------------------------------------------
   Validation for agent data (extra)
-------------------------------------------------------- */
export function validateAgentStructure(agentData) {
  const errors = [];
  try {
    if (!agentData || typeof agentData !== 'object') {
      errors.push('Agent data must be a valid object');
      return { isValid: false, errors };
    }
    if (!agentData.agents || typeof agentData.agents !== 'object') {
      errors.push('agents field is required and must be an object');
    }
    if (!agentData.master_agent || typeof agentData.master_agent !== 'string') {
      errors.push('master_agent field is required and must be a string');
    }
    if (!agentData.status || !['draft', 'publish'].includes(agentData.status)) {
      errors.push('status field is required and must be either "draft" or "publish"');
    }

    if (agentData.agents) {
      const agentKeys = Object.keys(agentData.agents);
      if (agentKeys.length === 0) errors.push('At least one agent is required');

      if (agentData.master_agent && !agentData.agents[agentData.master_agent]) {
        errors.push(`Master agent '${agentData.master_agent}' not found in agents`);
      }

      const checkCircular = (currentKey, visited = new Set()) => {
        if (visited.has(currentKey)) return true;
        visited.add(currentKey);
        const currentAgent = agentData.agents[currentKey];
        if (currentAgent && currentAgent.childAgents) {
          return currentAgent.childAgents.some(childKey =>
            agentData.agents[childKey] && checkCircular(childKey, new Set(visited))
          );
        }
        return false;
      };

      agentKeys.forEach(key => {
        const a = agentData.agents[key];
        if (!a.name || typeof a.name !== 'string') {
          errors.push(`Agent '${key}' must have a valid name`);
        }
        if (a.parentAgents && !Array.isArray(a.parentAgents)) {
          errors.push(`Agent '${key}' parentAgents must be an array`);
        }
        if (a.childAgents && !Array.isArray(a.childAgents)) {
          errors.push(`Agent '${key}' childAgents must be an array`);
        }
        if (checkCircular(key)) {
          errors.push(`Circular reference detected involving agent '${key}'`);
        }
      });
    }
  } catch (error) {
    errors.push(`Validation error: ${error.message}`);
  }

  return { isValid: errors.length === 0, errors };
}

/* -------------------------------------------------------
   Stats for agent flow
-------------------------------------------------------- */
export function getAgentFlowStats(agentData) {
  try {
    if (!agentData.agents) return null;

    const keys = Object.keys(agentData.agents);
    const totalAgents = keys.length;

    let maxDepth = 0;
    const visited = new Set();

    const dfs = (key, depth) => {
      if (visited.has(key)) return;
      visited.add(key);
      maxDepth = Math.max(maxDepth, depth);
      const a = agentData.agents[key];
      (a?.childAgents || []).forEach(child => {
        if (agentData.agents[child]) dfs(child, depth + 1);
      });
    };

    if (agentData.master_agent && agentData.agents[agentData.master_agent]) {
      dfs(agentData.master_agent, 0);
    }

    let totalConnections = 0;
    keys.forEach(k => {
      totalConnections += (agentData.agents[k].childAgents || []).length;
    });

    const leafAgents = keys.filter(k => !(agentData.agents[k].childAgents || []).length);
    const rootAgents = keys.filter(k => !(agentData.agents[k].parentAgents || []).length);

    return {
      totalAgents,
      maxDepth: maxDepth + 1,
      totalConnections,
      leafAgents: leafAgents.length,
      rootAgents: rootAgents.length,
      masterAgent: agentData.master_agent,
      status: agentData.status,
      flowComplexity: Math.round((totalConnections / Math.max(totalAgents - 1, 1)) * 100) / 100
    };
  } catch (error) {
    console.error('Error calculating agent flow stats:', error);
    return null;
  }
}

/* -------------------------------------------------------
   Bridge type configs
-------------------------------------------------------- */
export const BRIDGE_TYPES = {
  api: {
    name: 'API',
    icon: Globe,
    color: 'from-blue-500 to-blue-600',
    description: 'Connect via API endpoints',
  },
  chatbot: {
    name: 'Chatbot',
    icon: MessageSquare,
    color: 'from-green-500 to-green-600',
    description: 'Interactive chat interface',
  },
  trigger: {
    name: 'Trigger',
    icon: Zap,
    color: 'from-purple-500 to-purple-600',
    description: 'Event-based triggers',
  },
};

/* -------------------------------------------------------
   Misc utilities
-------------------------------------------------------- */
export function useAgentLookup(agentsObj) {
  return useMemo(() => {
    const byId = new Map();
    const byName = new Map();
    for (const [key, a] of Object.entries(agentsObj || {})) {
      const idKey = a?.bridge_id ?? key;
      if (idKey) byId.set(String(idKey), a);
      if (a?.name) {
        const k = String(a.name).toLowerCase();
        if (!byName.has(k)) byName.set(k, a);
      }
    }
    const resolve = (ref) => {
      if (!ref) return null;
      if (typeof ref === 'object') return byId.get(String(ref.bridge_id)) || ref;
      const str = String(ref);
      return byId.get(str) || byName.get(str.toLowerCase()) || null;
    };
    return { byId, byName, resolve };
  }, [agentsObj]);
}

export function normalizeConnectedRefs(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return Object.values(value);
  return [value];
}

export function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (a[k] !== b[k]) return false;
  return true;
}

/* -------------------------------------------------------
   Agent Picker Sidebar (uses SlideOver)
-------------------------------------------------------- */
export function AgentSidebar({ isOpen, title, agents, onClose, nodes, onChoose }) {
  const [q, setQ] = useState('');
  const [description, setDescription] = useState('');
  const [selectAgent, setSelectAgent] = useState(null);

  useEffect(() => { if (isOpen) setQ(''); }, [isOpen]);

  const usedAgentIds = useMemo(() => {
    return new Set(
      (nodes || [])
        .filter((n) => n.type === 'agentNode' && n.data?.selectedAgent)
        .map((n) => n.data.selectedAgent.bridge_id || n.data.selectedAgent.name)
    );
  }, [nodes]);

  const list = useMemo(() => {
    return Object.entries(agents || {})
      .map(([origKey, a]) => ({ ...a, __key: origKey }))
      .filter((a) => {
        const key = a.bridge_id || a.name;
        const matchesSearch = (a?.name || '').toLowerCase().includes(q.toLowerCase());
        const notUsed = !usedAgentIds.has(key);
        const hasPublishedVersion = a.published_version_id;
        const doesNotHavePausedStatus = a.bridge_status !== 1;
        const doesNotHaveArchivedStatus = a.status !== 0;
        return matchesSearch && notUsed && hasPublishedVersion && doesNotHavePausedStatus && doesNotHaveArchivedStatus;
      });
  }, [agents, q, usedAgentIds,agents,nodes]);

  const handleSelectAgent = (agent) => {
    setSelectAgent(agent);
    openModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL);
  };

  const handleAddAgent = () => {
    selectAgent.description = description;
    onChoose?.(selectAgent);
    closeModal(MODAL_TYPE?.AGENT_DESCRIPTION_MODAL);
    setDescription('');
    setSelectAgent(null);
  };

  return (
    <>
      <SlideOver
        isOpen={isOpen}
        onClose={onClose}
        header={
          <div className="p-5 border-b border-base-200 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-base-content/60">SELECT AGENT</p>
              <h2 className="text-lg font-semibold text-base-content">{title}</h2>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm rounded-full" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        }
        bodyClassName="pb-6"
      >
        <div className="p-4">
          <label className="input input-bordered flex items-center gap-2">
            <Search className="w-4 h-4 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search agents..."
              className="grow"
            />
          </label>
        </div>

        <div className="px-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {list.length === 0 ? (
            <div className="px-4 py-16 text-center text-base-content/60 text-sm">
              {q ? `No agents for "${q}"` : 'No agents available'}
            </div>
          ) : (
            <ul className="space-y-1">
              {list.map((agent, idx) => (
                <li key={(agent.bridge_id || agent.__key || `${agent.name}-${idx}`).toString()}>
                  <button
                    onClick={() => handleSelectAgent(agent)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-base-200/60"
                  >
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-medium">{agent.name || agent.__key}</div>
                      <div className="text-xs text-base-content/60">
                        {Array.isArray(agent.connected_agents) || typeof agent.connected_agents === 'object'
                          ? `Connected to: ${normalizeConnectedRefs(agent.connected_agents)
                            .map((c) => (typeof c === 'object' ? c.name : String(c)))
                            .join(', ')}`
                          : 'AI Assistant'}
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AgentDescriptionModal
          setDescription={setDescription}
          handleSaveAgent={handleAddAgent}
          description={description}
          isAgentToAgentConnect={false}
        />
      </SlideOver>
    </>
  );
}

/* -------------------------------------------------------
   Flow Control Panel (uses SlideOver for Chat)
-------------------------------------------------------- */
export function FlowControlPanel({
  onSaveAgent,
  onDiscard, // ← optional: pass a handler to discard changes
  bridgeType = 'default',
  name,
  description,
  createdFlow,
  isModified,
  setIsLoading,
  params,
  isVariableModified,
  openIntegrationGuide,
  closeIntegrationGuide,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [saveData, setSaveData] = useState({
    name: name || '',
    description: description || '',
    status: 'publish',
  });
  console.log(isVariableModified);
  const handlePublish = () => {
    if (!saveData.name.trim()) {
      alert('Please enter a flow name');
      return;
    }
    onSaveAgent?.({
      ...saveData,
      saveType: 'agent',
      bridgeType,
      publishedAt: saveData.status === 'published' ? new Date().toISOString() : null,
      createdFlow,
      setIsLoading
    });
    setIsOpen(false);
  };

  const handleDiscard = () => {
    const ok = confirm('Discard all unsaved changes?');
    if (!ok) return;

    // Prefer a parent-provided discard handler if available
    if (typeof onDiscard === 'function') {
      onDiscard();
      return;
    }

    // Fallback: reset local state and hard refresh to ensure full revert
    setIsChatOpen(false);
    setSaveData({
      name: name || '',
      description: description || '',
      status: 'publish',
    });
    // Force a reload to revert any upstream editor state
    // window.location.reload();
  };

  const handleChange = (e) => {
    setSaveData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuickTestKeyDown = (e) => {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim();
      setUserMessage(val);
      if (!val) return;
      setIsChatOpen(true);
      e.currentTarget.value = '';
    }
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsChatOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative z-[9990]">
      {/* Top-right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Discard button: show only when createdFlow && isModified */}

        <button
            className="btn btn-outline"
            onClick={openIntegrationGuide}
            title="Integration Guide"
          >
           <FileSlidersIcon/> Integration Guide
          </button>

        {createdFlow && (isModified || isVariableModified) && (
          <button
            className="btn btn-outline btn-error"
            onClick={handleDiscard}
            title="Discard unsaved changes"
          >
            Discard
          </button>
        )}

        {/* Publish/Update button */}
        <button
          className="btn btn-primary bg-primary shadow-lg text-base-content"
          onClick={() => setIsOpen(true)}
          disabled={!isModified && !isVariableModified}
          title="Publish Flow"
        >
          <span className="text-white">
            {createdFlow ? <Upload className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
          </span>
          <span className="text-white">
            {createdFlow ? 'Update Flow' : 'Publish Flow'}
          </span>
        </button>
      </div>

      {/* Quick Test Input with highlight ring */}
      {!isModified && !isChatOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2">
          <div className="relative">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full ring-2 ring-primary animate-pulse"></div>

            {/* Main content */}
            <div className="relative flex items-center gap-2 bg-base-100/95 backdrop-blur-md border border-base-200 rounded-full px-4 py-3 shadow-lg">
              <TestTube className="h-5 w-5 text-primary" />
              <input
                type="text"
                placeholder="Test the model..."
                className="bg-transparent outline-none text-sm w-64 focus:w-80 transition-all"
                onKeyDown={handleQuickTestKeyDown}
              />
              <div className="text-xs text-base-content/60 border-l pl-3">Press Enter</div>
            </div>
          </div>
        </div>
      )}

      {/* Save/Publish Modal (DaisyUI Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9970] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="card bg-base-100 w-full max-w-md shadow-2xl border border-base-200">
            <div className="card-body">
              <h3 className="card-title">
                {createdFlow ? <Save className="mr-2 h-5 w-5 opacity-70" /> : <Upload className="mr-2 h-5 w-5 opacity-70" />}
                {createdFlow ? 'Update Agent Flow' : 'Save Agent Flow'}
              </h3>

              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">
                    Flow Name <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={saveData.name}
                  onChange={handleChange}
                  placeholder="Enter flow name..."
                  className="input input-bordered w-full"
                />
              </div>

              <div className="form-control mt-2">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  name="description"
                  value={saveData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Enter flow description..."
                  className="textarea textarea-bordered w-full resize-none"
                />
              </div>

              <div className="card-actions justify-end mt-4">
                <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handlePublish}>
                  {createdFlow ? <Upload className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                  {createdFlow ? 'Update Flow' : 'Publish Flow'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat SlideOver */}
      <SlideOver
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        widthClass="w-full sm:w-[460px] md:w-[520px] mt-14 rounded-lg"
        overlayZ="z-[9968]"
        panelZ="z-[9969]"
        backDropBlur={false}
        header={
          <div className="px-5 py-1 border-b border-base-content/30 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              <h4 className="text-base font-semibold">Test Your Model</h4>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="btn btn-ghost btn-circle btn-sm"
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        }
        bodyClassName="min-h-0"
      >
        <div className="flex-1 min-h-0 rounded-b-lg">
          <Chat params={params} userMessage={userMessage} isOrchestralModel={true} />
        </div>
      </SlideOver>
    </div>
  );
}


/* -------------------------------------------------------
   Agent Config Sidebar (uses SlideOver)
-------------------------------------------------------- */
export function AgentConfigSidebar({ isOpen, onClose, agent }) {
  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[380px] max-w-[80vw]"
      header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-xl font-semibold">Agent Configuration</h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm" aria-label="Close sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>
      }
      bodyClassName="p-6 space-y-4 pb-20"
    >
      {/* Basic Info */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm">Basic Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">ID:</span> {agent?._id}</div>
            <div><span className="font-medium">Name:</span> {agent?.name}</div>
            <div><span className="font-medium">Slug:</span> {agent?.slugName}</div>
            <div><span className="font-medium">Service:</span> {agent?.service}</div>
            <div><span className="font-medium">Bridge Type:</span> {agent?.bridgeType}</div>
            <div><span className="font-medium">Status:</span> {agent?.status === 1 ? 'Active' : 'Inactive'}</div>
            <div><span className="font-medium">Total Tokens:</span> {agent?.total_tokens?.toLocaleString() || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm">Configuration</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Model:</span> {agent?.configuration?.model}</div>
            <div className="space-y-1">
              <span className="font-medium">Prompt:</span>
              <pre className="bg-base-100 p-3 rounded border border-base-300 text-xs whitespace-pre-wrap">
                {agent?.configuration?.prompt}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Versions */}
      {agent?.versions && agent?.versions?.length > 0 && (
        <div className="card bg-base-200">
          <div className="card-body">
            <h3 className="card-title text-sm">Versions</h3>
            <div className="space-y-2">
              {agent?.versions?.map((version, index) => (
                <div key={version} className="text-sm">
                  <span className="font-medium">Version {index + 1}:</span> {version}
                  {version === agent.published_version_id && (
                    <span className="badge badge-success badge-sm ml-2">Published</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agent Variables */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm">Agent Variables</h3>
          {agent?.agent_variables && Object.keys(agent?.agent_variables).length > 0 ? (
            <div className="space-y-1 text-sm">
              {Object.entries(agent?.agent_variables).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm opacity-70">No variables configured</div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title text-sm">Additional Information</h3>
          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Organization ID:</span> {agent?.org_id}</div>
            <div><span className="font-medium">Published Version:</span> {agent?.published_version_id}</div>
            <div><span className="font-medium">Function IDs:</span> {agent?.function_ids || 'None'}</div>
          </div>
        </div>
      </div>
    </SlideOver>
  );
}

export function IntegrationGuide({ isOpen, onClose, params }) {
  const headers = ['Parameter', 'Type', 'Description', 'Required']

  const data = [
    ['pauthkey', 'string', 'The key used to authenticate the request.', 'true'],
    ['orchestrator_id', 'string', 'The orchestrator ID of the flow.', 'true'],
    ['user', 'string', 'The user question.', 'true'],
  ]

  const orchestratorApi = (p) =>
    (
      `curl --location '${process.env.NEXT_PUBLIC_PYTHON_SERVER_WITH_PROXY_URL}/api/v2/model/chat/completion' \\\n` +
      `--header 'pauthkey: YOUR_GENERATED_PAUTHKEY' \\\n` +
      `--header 'Content-Type: application/json' \\\n` +
      `--data '{\\n` +
      `    "orchestrator_id": "${p?.orchestralId ?? 'YOUR_ORCHESTRATOR_ID'}",\\n` +
      `    "user": "YOUR_USER_QUESTION"\\n` +
      `}'`
    )

  const orchestratorFormat = `
    "success": true,
    "response": {
         "data": {
            "id": "chatcmpl-785654654v4ew54656",
            "content": "Response from the AI",
            "model": "Your selected model",
            "role": "assistant",
            "finish_reason": "stop"
         },
         "usage": {
            "input_tokens": 269,
            "output_tokens": 10,
            "total_tokens": 279
         }
    }
  }`

  const Section = ({ title, caption, children }) => (
    <div className="flex items-start flex-col justify-center gap-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      {caption && <p className="text-xs text-gray-600">{caption}</p>}
      {children}
    </div>
  )

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[780px] max-w-[50vw]"
      header={
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h2 className="text-xl font-semibold">Integration Guide</h2>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm" aria-label="Close sidebar">
            <X className="w-4 h-4" />
          </button>
        </div>
      }
      bodyClassName="p-6 space-y-4 pb-20"
    >
      {/* Step 1 */}
      <div className="card bg-base-200">
        <div className="card-body space-y-2">
          <Section title="Step 1" caption={
            <>
              Create <code className="px-1 py-0.5 rounded bg-base-100 border">pauthkey</code>
            </>
          } />
          <p className="text-sm">
            Follow the on-screen instructions to create a new API key. Ignore if already created.
          </p>
          <Link
            href={`/org/${params?.org_id}/pauthkey`}
            target="_blank"
            className="link link-primary text-sm"
          >
            Create pauthkey
          </Link>
        </div>
      </div>

      {/* Step 2 */}
      <div className="card bg-base-200">
        <div className="card-body space-y-3">
          <Section title="Step 2" caption="Use the Chat Completion Orchestrator API" />
          <div className="mockup-code relative">
            <CopyButton data={orchestratorApi(params)} />
            <pre className="break-words whitespace-pre-wrap ml-4">
              <code>{orchestratorApi(params)}</code>
            </pre>
          </div>
          <GenericTable headers={headers} data={data} />
          <p className="text-sm">
            Ensure your backend is ready to receive the asynchronous result on the configured webhook URL (if your orchestration sends callbacks).
          </p>
        </div>
      </div>

      {/* Response Format */}
      <div className="card bg-base-200">
        <div className="card-body space-y-3">
          <Section title="Response Format" />
          <div className="mockup-code relative">
            <CopyButton data={orchestratorFormat} />
            <pre className="break-words whitespace-pre-wrap ml-4">
              <code>{orchestratorFormat}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Helpful Info */}
      <div className="card bg-base-200">
        <div className="card-body text-sm space-y-2">
          <h3 className="card-title text-sm">Notes</h3>
          <ul className="list-disc ml-5 space-y-1">
            <li><span className="font-medium">Auth:</span> Pass <code className="px-1 py-0.5 bg-base-100 border rounded">pauthkey</code> in the header.</li>
            <li><span className="font-medium">IDs:</span> <code className="px-1 py-0.5 bg-base-100 border rounded">orchestrator_id</code> refers to the published flow you want to invoke.</li>
            <li><span className="font-medium">User input:</span> Send the end-user question in the <code className="px-1 py-0.5 bg-base-100 border rounded">user</code> field.</li>
          </ul>
        </div>
      </div>
    </SlideOver>
  )
}
