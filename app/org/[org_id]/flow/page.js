'use client'
import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, Handle, Position, ReactFlowProvider, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCustomSelector } from '@/customHooks/customSelector';
import { BotIcon } from '@/components/Icons';

export const runtime = 'edge';

// --- SVG Icons ---
const PlusIcon = ({ className = "text-white" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);
const TrashIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);
const SettingsIcon = ({ className = "w-4 h-4" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33-1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);
const IfElseIcon = ({className}) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 10L21 7L18 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 20V7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 14H3V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 17L3 14L6 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// --- Reusable Add Button Component ---
const InlineAddButton = ({ onItemClick, className = "" }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const handleButtonClick = (e) => { 
        e.stopPropagation(); 
        setIsDropdownOpen(p => !p); 
    };
    
    const handleItemClick = (type) => {
        onItemClick(type);
        setIsDropdownOpen(false);
    };
    
    useEffect(() => {
        const handleClickOutside = (e) => { 
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) 
                setIsDropdownOpen(false); 
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button 
                onClick={handleButtonClick} 
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all nodrag" 
                title="Add a new step"
            >
                <PlusIcon className="w-3 h-3" />
            </button>
            {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[1000] bg-white border border-gray-200 rounded-lg shadow-xl w-48">
                    <div className="py-1">
                        <button onClick={() => handleItemClick('agent')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm"><BotIcon/> agent</button>
                        <button onClick={() => handleItemClick('ifElse')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm"><IfElseIcon className="w-4 h-4 text-gray-600" /> IF/ELSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Simple AddNode for initial state
const AddNode = ({ id, data }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const handleButtonClick = (e) => { e.stopPropagation(); setIsDropdownOpen(p => !p); };
    const handleItemClick = (type) => {
        data.onFlowChange({ action: 'ADD_NODE', payload: { type, sourceNodeId: id } });
        setIsDropdownOpen(false);
    };
    useEffect(() => {
        const handleClickOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative group">
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !-ml-1 !bg-transparent !border-0" />
            <div onClick={handleButtonClick} className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-9 h-9 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg transition-all" title="Add a new step"><PlusIcon /></div>
            {isDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-[1000] bg-white border border-gray-200 rounded-lg shadow-xl w-48">
                    <div className="py-1">
                        <button onClick={() => handleItemClick('agent')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm"><BotIcon/> agent</button>
                        <button onClick={() => handleItemClick('ifElse')} className="w-full px-3 py-2 hover:bg-gray-100 flex gap-2 items-center text-sm"><IfElseIcon className="w-4 h-4 text-gray-600" /> IF/ELSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Modified agentNode with inline add button
const agentNode = ({ id, data }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (e) => { 
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) 
                setIsDropdownOpen(false); 
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    const handleSelect = (agent) => { 
        data.onSelectagent(id, agent); 
        setIsDropdownOpen(false); 
    };
    
    const handleConfigClick = (e) => { 
      console.log(data.selectedagent);
        e.stopPropagation(); 
        if (data.selectedagent) data.onOpenConfig(data.selectedagent); 
    };

    const handleAddClick = (type) => {
        data.onFlowChange({ action: 'ADD_NODE', payload: { type, sourceNodeId: id } });
    };

    return (
        <div className="bg-white border-2 border-blue-500 rounded-xl p-4 w-64 shadow-lg hover:shadow-xl transition-shadow duration-200 relative group" ref={dropdownRef}>
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400" />
            
            <div className="absolute top-2 right-2 flex gap-1">
                {data.selectedagent && (
                    <button 
                        onClick={handleConfigClick} 
                        className="p-1 bg-white rounded-full text-gray-400 hover:bg-blue-100 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                        title="Configure agent"
                    >
                        <SettingsIcon />
                    </button>
                )}
                <button 
                    onClick={() => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } })} 
                    className="p-1 bg-white rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                    title="Delete Node"
                >
                    <TrashIcon />
                </button>
            </div>
            
            <div className="text-center cursor-pointer flex items-center rounded-full">
                <div className="font-bold text-gray-800 text-md mb-1 rounded-full bg-base-300 px-2 py-1">
                    {data.selectedagent ? data.selectedagent.name : 'Select agent'}
                </div>
                {/* {data.selectedagent?.name && (
                    <div className="text-sm text-gray-500 italic">{data.selectedagent.name}</div>
                )} */}
               
                <div className="flex justify-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity absolute right-[-12px] z-very-high">
                <InlineAddButton onItemClick={handleAddClick} />
            </div>
            </div>

            <div className="text-xs text-blue-600 mt-1" onClick={() => setIsDropdownOpen(prev => !prev)}>{!data.selectedagent && "Click to select a agent"}</div>
            
            {/* Inline Add Button - shows on hover */}
            
            
            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 z-[1000] bg-white border border-gray-200 rounded-lg shadow-2xl w-full max-h-60 overflow-y-auto">
                    <div className="py-1">
                        {Object.values(data.agents).map(agent => (
                            <button 
                                key={agent._id} 
                                onClick={() => handleSelect(agent)} 
                                className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <span className="font-medium text-gray-800 text-sm">{agent.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-blue-500" />
        </div>
    );
};

// Modified IfElseNode with inline add buttons for both IF and ELSE
const IfElseNode = ({ id, data }) => {
    const [condition, setCondition] = useState(data.condition || '');

    const handleAddClick = (type, branch) => {
        data.onFlowChange({ 
            action: 'ADD_NODE', 
            payload: { type, sourceNodeId: id, branch } 
        });
    };

    const handleConditionChange = (e) => {
        const newCondition = e.target.value;
        setCondition(newCondition);
        // Update the node data with condition
        data.onFlowChange({
            action: 'UPDATE_NODE_DATA',
            payload: { nodeId: id, condition: newCondition }
        });
    };

    return (
        <div className="bg-[#2C2C2C] border-2 border-[#424242] rounded-xl shadow-lg w-72 text-white group">
            <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-gray-400 !-ml-4" />
            
            <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-500 p-2 rounded-lg">
                        <IfElseIcon className="w-6 h-6 text-white"/>
                    </div>
                    <div className="font-bold text-lg">IF/ELSE</div>
                    <button 
                        onClick={() => data.onFlowChange({ action: 'DELETE_NODE', payload: { nodeId: id } })} 
                        className="ml-auto p-1 text-gray-400 hover:text-red-400" 
                        title="Delete Node"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
                <input 
                    type="text" 
                    value={condition}
                    onChange={handleConditionChange}
                    placeholder="Condition (e.g., body.status === 'success')" 
                    className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#424242] rounded text-sm nodrag" 
                />
            </div>
            
            <div className="bg-[#212121] rounded-b-xl px-4 py-2 space-y-3">
                {/* IF Branch */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-300">IF</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <InlineAddButton onItemClick={(type) => handleAddClick(type, 'if')} />
                        </div>
                    </div>
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="if" 
                        className="!w-3 !h-3 !bg-green-500" 
                    />
                </div>
                
                {/* ELSE Branch */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-300">ELSE</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <InlineAddButton onItemClick={(type) => handleAddClick(type, 'else')} />
                        </div>
                    </div>
                    <Handle 
                        type="source" 
                        position={Position.Right} 
                        id="else" 
                        className="!w-3 !h-3 !bg-red-500" 
                    />
                </div>
            </div>
        </div>
    );
};

// Updated nodeTypes object
const nodeTypes = {
    addNode: AddNode,
    agentNode: agentNode,
    ifElseNode: IfElseNode,
};

// --- Main App Logic Component ---
function Flow({params}) {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    
    const {allagentsMap} = useCustomSelector(state => ({
        allagentsMap: state.bridgeReducer.org[params.org_id]?.orgs
    }));
    const agents = allagentsMap || {};

    // Console output every 20 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const finalData = {
                timestamp: new Date().toISOString(),
                totalNodes: nodes.length,
                totalEdges: edges.length,
                nodes: nodes.map(node => ({
                    id: node.id,
                    type: node.type,
                    position: node.position,
                    data: {
                        selectedagent: node.data?.selectedagent?.name || null,
                        agentId: node.data?.selectedagent?._id || null,
                        condition: node.data?.condition || null
                    }
                })),
                edges: edges.map(edge => ({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    sourceHandle: edge.sourceHandle || null,
                    type: edge.type
                })),
                flowStructure: buildFlowStructure(nodes, edges)
            };
            
            console.log('=== FLOW DATA OUTPUT ===');
            console.log(JSON.stringify(finalData, null, 2));
            console.log('========================');
        }, 20000); // 20 seconds

        return () => clearInterval(interval);
    }, [nodes, edges]);

    // Helper function to build flow structure
    const buildFlowStructure = (nodes, edges) => {
        const structure = {};
        
        nodes.forEach(node => {
            if (node.type !== 'addNode') {
                structure[node.id] = {
                    type: node.type,
                    agentName: node.data?.selectedagent?.name || null,
                    agentId: node.data?.selectedagent?._id || null,
                    children: {
                        if: [],
                        else: [],
                        next: []
                    }
                };
            }
        });

        edges.forEach(edge => {
            const sourceNode = structure[edge.source];
            if (sourceNode && structure[edge.target]) {
                if (edge.sourceHandle === 'if') {
                    sourceNode.children.if.push(edge.target);
                } else if (edge.sourceHandle === 'else') {
                    sourceNode.children.else.push(edge.target);
                } else {
                    sourceNode.children.next.push(edge.target);
                }
            }
        });

        return structure;
    };

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
    const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep' }, eds)), []);

    const selectagentForNode = useCallback((nodeId, agent) => {
        setNodes((nds) => nds.map(n => 
            n.id === nodeId ? { ...n, data: { ...n.data, selectedagent: agent } } : n
        ));
    }, []);
    
    const openConfigModal = useCallback((agentData) => { 
        console.log(agentData);
        /* Modal logic here */ 
    }, []);

    // Updated handleFlowChange to handle inline additions
    const handleFlowChange = useCallback((change) => {
        const { action, payload } = change;
        const timestamp = Date.now();

        if (action === 'ADD_NODE') {
            const { type, sourceNodeId, branch } = payload;
            const newNodeId = `${type}-${timestamp}`;
            
            setNodes((currentNodes) => {
                const sourceNode = currentNodes.find(n => n.id === sourceNodeId);
                if (!sourceNode) return currentNodes;
                
                let newNode;
                const basePosition = {
                    x: sourceNode.position.x + 350,
                    y: branch === 'else' ? sourceNode.position.y + 80 : 
                       branch === 'if' ? sourceNode.position.y - 40 : 
                       sourceNode.position.y
                };

                if (type === 'agent') {
                    newNode = {
                        id: newNodeId,
                        type: 'agentNode',
                        position: basePosition,
                        data: {
                            onFlowChange: handleFlowChange,
                            onSelectagent: selectagentForNode,
                            onOpenConfig: openConfigModal,
                            agents,
                            selectedagent: null
                        }
                    };
                } else if (type === 'ifElse') {
                    newNode = {
                        id: newNodeId,
                        type: 'ifElseNode',
                        position: basePosition,
                        data: { 
                            onFlowChange: handleFlowChange,
                            condition: ''
                        }
                    };
                }

                return [...currentNodes, newNode];
            });

            // Add edge from source to new node
            setEdges((currentEdges) => {
                const sourceHandle = branch || undefined;
                const newEdge = {
                    id: `e-${sourceNodeId}-${newNodeId}-${timestamp}`,
                    source: sourceNodeId,
                    target: newNodeId,
                    sourceHandle,
                    type: 'smoothstep'
                };
                return [...currentEdges, newEdge];
            });
        }

        if (action === 'UPDATE_NODE_DATA') {
            const { nodeId, condition } = payload;
            setNodes((currentNodes) => 
                currentNodes.map(node => 
                    node.id === nodeId 
                        ? { ...node, data: { ...node.data, condition } }
                        : node
                )
            );
        }

        if (action === 'DELETE_NODE') {
            const { nodeId } = payload;
            setNodes(currentNodes => {
                const getDescendants = (startNodeId, allEdges) => {
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
                const idsToDelete = getDescendants(nodeId, edges);
                setEdges(currentEdges => currentEdges.filter(e => 
                    !idsToDelete.has(e.source) && !idsToDelete.has(e.target)
                ));
                return currentNodes.filter(n => !idsToDelete.has(n.id));
            });
        }
    }, [selectagentForNode, openConfigModal, agents, edges]);

    useEffect(() => {
        // Start with a single AddNode
        if (nodes.length === 0) {
            setNodes([{
                id: 'start-node',
                type: 'addNode',
                position: { x: 50, y: 200 },
                data: { onFlowChange: handleFlowChange }
            }]);
        }
    }, [nodes.length, handleFlowChange]);

    return (
        <div className="w-full h-full bg-gray-100">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
            >
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