'use client'
import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Handle, Position, ReactFlowProvider, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCustomSelector } from '@/customHooks/customSelector';

export const runtime = 'edge';

// --- SVG Icons (No Changes) ---
const PlusIcon = ({ className = "text-gray-500" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
const TrashIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);
const SettingsIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);


// --- Custom Node Components ---
const AddNode = ({ id, data }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const handleButtonClick = (e) => { e.stopPropagation(); setIsDropdownOpen(prev => !prev); };
  const handleItemClick = (type) => {
    data.onFlowChange({ action: 'ADD_NODE', payload: { type, sourceNodeId: id } });
    setIsDropdownOpen(false);
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) { setIsDropdownOpen(false); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div ref={dropdownRef} className="relative group">
      <div onClick={handleButtonClick} className="bg-white hover:bg-gray-200 border-2 border-dashed border-gray-400 rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-all" title="Add a new step">
        <PlusIcon />
      </div>
      {isDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 z-[1000] bg-white border border-gray-200 rounded-lg shadow-xl w-48">
          <div className="py-1">
            <button onClick={() => handleItemClick('bridge')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm">🌉 Bridge</button>
            <button onClick={() => handleItemClick('switch')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm">🔀 Switch</button>
          </div>
        </div>
      )}
    </div>
  );
};
const BridgeNode = ({ id, data }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) { setIsDropdownOpen(false); } };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleSelect = (bridge) => { data.onSelectBridge(id, bridge); setIsDropdownOpen(false); };
    const handleConfigClick = (e) => { e.stopPropagation(); if (data.selectedBridge) { data.onOpenConfig(data.selectedBridge); } };
    return (
        <div className="bg-white border-2 border-blue-500 rounded-xl p-4 w-64 shadow-lg hover:shadow-xl transition-shadow duration-200 relative group" ref={dropdownRef}>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400" />
            <div className="absolute top-2 right-2 flex gap-1">
                {data.selectedBridge && ( <button onClick={handleConfigClick} className="p-1 bg-white rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Configure Bridge"><SettingsIcon /></button>)}
                <button onClick={() => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } })} className="p-1 bg-white rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Node"><TrashIcon /></button>
            </div>
            <div className="text-center cursor-pointer" onClick={() => setIsDropdownOpen(prev => !prev)}>
                <div className="font-bold text-gray-800 text-md mb-1">{data.selectedBridge ? data.selectedBridge.name : 'Select Bridge'}</div>
                {data.selectedBridge?.slugname && <div className="text-sm text-gray-500 italic">{data.selectedBridge.slugname}</div>}
                {!data.selectedBridge && <div className="text-xs text-blue-600 mt-1">Click to select a bridge</div>}
            </div>
            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 z-[1000] bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-h-60 overflow-y-auto">
                    <div className="py-1">
                        {Object.values(data.bridges).map(bridge => (<button key={bridge._id} onClick={() => handleSelect(bridge)} className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-200"><span className="font-medium text-gray-800 text-sm">{bridge.name}</span></button>))}
                    </div>
                </div>
            )}
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500" />
        </div>
    );
};

// ## MODIFICATION 1: Added a source handle to the SwitchNode
const SwitchNode = ({ id, data }) => (
  <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 w-64 shadow-lg relative group">
    <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400" />
    <button onClick={() => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } })} className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Node"><TrashIcon /></button>
    <div className="font-bold text-gray-800 text-md mb-2 text-center">🔀 Switch</div>
    <p className="text-center text-xs text-gray-500 mb-3">Add conditional branches to the flow.</p>
    <button onClick={() => data.onFlowChange({ action: 'ADD_CASE', payload: { switchNodeId: id } })} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm border-none rounded-md px-3 py-2 cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2">
      <PlusIcon className="text-white" /> Add Case
    </button>
    {/* THIS IS A CRITICAL FIX: A source handle is required for outgoing connections to cases. */}
    <Handle type="source" position={Position.Right} id="a" className="!w-3 !h-3 !bg-yellow-500" />
  </div>
);

// ## MODIFICATION 2: Moved the target handle to the left for the CaseNode
const CaseNode = ({ id, data }) => (
  <div className="bg-purple-100 border-2 border-purple-400 rounded-xl p-4 w-64 shadow-md relative group">
    {/* THIS IS A CRITICAL FIX: The target handle must be on the left to connect from the switch. */}
    <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400" />
    <button onClick={() => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } })} className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete Node"><TrashIcon /></button>
    <div className="font-semibold text-gray-700 text-sm mb-2">Case {data.caseIndex + 1}</div>
    <input type="text" placeholder="Condition (e.g., 'Success')" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm nodrag mb-1" value={data.condition || ''} onChange={(e) => data.onUpdateCondition(id, e.target.value)} />
    <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-purple-500" />
  </div>
);

const nodeTypes = { addNode: AddNode, bridgeNode: BridgeNode, switchNode: SwitchNode, caseNode: CaseNode };

// --- Main App Logic Component ---
// --- Main App Logic Component (CORRECTED) ---
function Flow({params}) {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [configModal, setConfigModal] = useState({ isOpen: false, data: null });

  // Replace with your actual data fetching
  const {allBridgesMap} = useCustomSelector(state => ({allBridgesMap: state.bridgeReducer.org[params.org_id]?.orgs}));
  const bridges = allBridgesMap || {}; // Ensure bridges is an object

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)), []);

  // These callbacks are now stable and don't depend on outside state
  const selectBridgeForNode = useCallback((nodeId, bridge) => {
    setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, selectedBridge: bridge } } : n));
  }, []);
  
  const openConfigModal = useCallback((bridgeData) => {
    setConfigModal({ isOpen: true, data: bridgeData });
  }, []);

  const updateCaseCondition = useCallback((nodeId, condition) => {
    setNodes((nds) => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, condition } } : n));
  }, []);

  // ## THIS IS THE MAIN FIX ##
  // Refactored to use functional updates for setNodes/setEdges.
  // This makes the function stable and avoids stale state issues.
 // --- Flow component ---

// ... other functions ...

const handleFlowChange = useCallback((change) => {
  const { action, payload } = change;

  if (action === 'ADD_NODE') {
    // This part remains the same
    const { type, sourceNodeId } = payload;
    const newNodeId = `${type}-${Date.now()}`;

    setNodes((currentNodes) => {
      const sourceNode = currentNodes.find(n => n.id === sourceNodeId);
      if (!sourceNode) return currentNodes;

      let newNode;
      let newAddNode = null;
      
      if (type === 'bridge') {
        newNode = { id: newNodeId, type: 'bridgeNode', position: sourceNode.position, data: { onFlowChange: handleFlowChange, onSelectBridge: selectBridgeForNode, onOpenConfig: openConfigModal, bridges, selectedBridge: null } };
        newAddNode = { id: `add-${newNodeId}`, type: 'addNode', position: { x: sourceNode.position.x + 300, y: sourceNode.position.y + 15 }, data: { onFlowChange: handleFlowChange } };
      } else { // type === 'switch'
        newNode = { id: newNodeId, type: 'switchNode', position: sourceNode.position, data: { onFlowChange: handleFlowChange } };
      }
      
      const nodesWithoutSource = currentNodes.filter(n => n.id !== sourceNodeId);
      return newAddNode ? [...nodesWithoutSource, newNode, newAddNode] : [...nodesWithoutSource, newNode];
    });

    setEdges((currentEdges) => {
      const previousEdge = currentEdges.find(e => e.target === sourceNodeId);
      const filteredEdges = currentEdges.filter(e => e.target !== sourceNodeId);
      const newEdges = [];

      if (previousEdge) {
        newEdges.push({ id: `e-${previousEdge.source}-${newNodeId}`, source: previousEdge.source, target: newNodeId, type: 'smoothstep' });
      }
      if (type === 'bridge') {
        newEdges.push({ id: `e-${newNodeId}-add-${newNodeId}`, source: newNodeId, target: `add-${newNodeId}`, type: 'smoothstep' });
      }
      
      return [...filteredEdges, ...newEdges];
    });
  }

  if (action === 'ADD_CASE') {
    const { switchNodeId } = payload;
    const timestamp = Date.now();
    const newCaseId = `case-${switchNodeId}-${timestamp}`;
    // const newAddNodeId = `add-${newCaseId}`; // अब इसकी जरूरत नहीं

    setNodes((nds) => {
      const switchNode = nds.find(n => n.id === switchNodeId);
      if (!switchNode) return nds;

      const existingCases = nds.filter(n => n.type === 'caseNode' && n.data?.parentSwitchId === switchNodeId);
      const yOffset = 120;
      
      const newCaseNode = {
        id: newCaseId,
        type: 'caseNode',
        position: {
          x: switchNode.position.x + 350,
          y: switchNode.position.y + (existingCases.length * yOffset) - (existingCases.length > 0 ? (yOffset / 2 * (existingCases.length - 1)) : 0)
        },
        data: { caseIndex: existingCases.length, parentSwitchId: switchNodeId, condition: '', onFlowChange: handleFlowChange, onUpdateCondition: updateCaseCondition }
      };
      
      // ## CHANGE: addNodeForCase को हटा दिया गया है ##
      // const addNodeForCase = { ... };

      return [...nds, newCaseNode]; // सिर्फ केस नोड को जोड़ा जा रहा है
    });

    setEdges((eds) => [
      ...eds,
      // ## CHANGE: सिर्फ स्विच से केस तक का एज बनाया जा रहा है ##
      { id: `e-${switchNodeId}-${newCaseId}`, source: switchNodeId, sourceHandle: 'a', target: newCaseId, type: 'smoothstep' },
      // { id: `e-${newCaseId}-${newAddNodeId}`, ... } // यह एज हटा दिया गया है
    ]);
  }

  if (action === 'DELETE_NODE') {
     // This part remains the same
    const { nodeId } = payload;
    setNodes(currentNodes => {
      setEdges(currentEdges => {
        const getDescendants = (startNodeId) => {
            const descendants = new Set([startNodeId]);
            const queue = [startNodeId];
            while (queue.length > 0) {
                const currentNodeId = queue.shift();
                const childrenEdges = currentEdges.filter(edge => edge.source === currentNodeId);
                for (const edge of childrenEdges) {
                    if (!descendants.has(edge.target)) {
                        descendants.add(edge.target);
                        queue.push(edge.target);
                    }
                }
            }
            return descendants;
        };
        const idsToDelete = getDescendants(nodeId);
        return currentEdges.filter(e => !idsToDelete.has(e.source) && !idsToDelete.has(e.target));
      });
      
       const getDescendantsForNodes = (startNodeId, allNodes, allEdges) => {
          const descendants = new Set([startNodeId]);
          const queue = [startNodeId];
          while (queue.length > 0) {
              const currentNodeId = queue.shift();
              const childrenEdges = allEdges.filter(edge => edge.source === currentNodeId);
              for (const edge of childrenEdges) {
                  if (!descendants.has(edge.target)) {
                      descendants.add(edge.target);
                      queue.push(edge.target);
                  }
              }
          }
          return descendants;
      };
      const idsToDelete = getDescendantsForNodes(nodeId, currentNodes, edges);
      return currentNodes.filter(n => !idsToDelete.has(n.id));
    });
  }
}, [selectBridgeForNode, openConfigModal, updateCaseCondition, bridges, edges]);

// ... rest of the Flow component

  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([{ id: 'start-node', type: 'addNode', position: { x: 50, y: 200 }, data: { onFlowChange: handleFlowChange } }]);
    }
  }, [nodes.length, handleFlowChange]);

  return (
    <div className="w-full h-full bg-gray-100">
        {configModal.isOpen && (
           <div className="fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-[2000] flex justify-center items-center" onClick={() => setConfigModal({ isOpen: false, data: null })}>
            <div className="w-4/5 max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b"><h2 className="m-0 text-xl font-semibold">Bridge Configuration: {configModal.data.name}</h2></div>
                <div className="flex-1 overflow-y-auto p-6"><pre className="m-0 whitespace-pre-wrap font-mono text-sm">{JSON.stringify(configModal.data, null, 2)}</pre></div>
                <div className="p-6 border-t flex justify-end"><button onClick={() => setConfigModal({ isOpen: false, data: null })} className="bg-gray-600 hover:bg-gray-700 text-white rounded-md px-5 py-2">Close</button></div>
            </div>
           </div>
        )}
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} fitView proOptions={{ hideAttribution: true }}>
            <Background variant="dots" gap={24} size={1} />
            <Controls showInteractive={false} />
        </ReactFlow>
    </div>
  );
}

// --- App Wrapper ---
export default function App({params}) {
  return (
    <ReactFlowProvider>
      <Flow params={params} />
    </ReactFlowProvider>
  );
}