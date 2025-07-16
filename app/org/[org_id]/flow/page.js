'use client'
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCustomSelector } from '@/customHooks/customSelector';

export default function App() {
  const { allBridgesMap } = useCustomSelector(state => ({
    allBridgesMap: state.bridgeReducer.allBridgesMap
  }));

  const bridges = useMemo(() => {
    return Object.values(allBridgesMap || {});
  }, [allBridgesMap]);

  // Track which bridges are added to the flow
  const [addedBridges, setAddedBridges] = useState(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBridge, setSelectedBridge] = useState(null); // For configuration view
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Convert added bridges to ReactFlow nodes
  const bridgeNodes = useMemo(() => {
    return bridges
      .filter(bridge => addedBridges.has(bridge._id))
      .map((bridge, index) => ({
        id: bridge._id || `bridge-${index}`,
        position: { 
          x: index * 250, // Horizontal spacing
          y: Math.floor(Math.random() * 200) + 100 // Random vertical position with some offset
        },
        data: { 
          label: bridge.name || bridge.slugname || `Bridge ${index + 1}`,
          bridge: bridge
        },
        type: 'default'
      }));
  }, [bridges, addedBridges]);

  // Generate edges connecting nodes from left to right
  const bridgeEdges = useMemo(() => {
    const sortedNodes = [...bridgeNodes].sort((a, b) => a.position.x - b.position.x);
    const edges = [];
    
    for (let i = 0; i < sortedNodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        source: sortedNodes[i].id,
        target: sortedNodes[i + 1].id,
        type: 'smoothstep',
        sourceHandle: 'right',
        targetHandle: 'left'
      });
    }
    return edges;
  }, [bridgeNodes]);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Update nodes and edges when bridge data changes
  useEffect(() => {
    setNodes(bridgeNodes);
    setEdges(bridgeEdges);
  }, [bridgeNodes, bridgeEdges]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  
  const onConnect = useCallback(
    (params) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  // Handle node click to show configuration
  const onNodeClick = useCallback((event, node) => {
    const bridge = bridges.find(b => b._id === node.id);
    if (bridge) {
      setSelectedBridge(bridge);
      setIsConfigModalOpen(true);
    }
  }, [bridges]);

  // Handle adding a bridge to the flow
  const handleAddBridge = (bridge) => {
    setAddedBridges(prev => new Set([...prev, bridge._id]));
    setIsDrawerOpen(false);
  };

  // Handle removing a bridge from the flow
  const handleRemoveBridge = (bridgeId) => {
    setAddedBridges(prev => {
      const newSet = new Set(prev);
      newSet.delete(bridgeId);
      return newSet;
    });
    // Also remove the node and related edges
    setNodes(prevNodes => prevNodes.filter(node => node.id !== bridgeId));
    setEdges(prevEdges => prevEdges.filter(edge => 
      edge.source !== bridgeId && edge.target !== bridgeId
    ));
  };

  // Close configuration modal
  const handleCloseConfig = () => {
    setIsConfigModalOpen(false);
    setSelectedBridge(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Add Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
      >
        + Add Bridge
      </button>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1500,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
          onClick={() => setIsDrawerOpen(false)}
        >
          {/* Drawer Content */}
          <div
            style={{
              width: '400px',
              height: '100vh',
              backgroundColor: 'white',
              boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                Available Bridges
              </h2>
              <button
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            {/* Bridge List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px'
            }}>
              {bridges.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                  No bridges available
                </p>
              ) : (
                bridges.map((bridge) => (
                  <div
                    key={bridge._id}
                    style={{
                      backgroundColor: addedBridges.has(bridge._id) ? '#f0f8ff' : '#f8f9fa',
                      border: `1px solid ${addedBridges.has(bridge._id) ? '#007bff' : '#e0e0e0'}`,
                      borderRadius: '8px',
                      padding: '16px',
                      marginBottom: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!addedBridges.has(bridge._id)) {
                        e.target.style.backgroundColor = '#f5f5f5';
                        e.target.style.borderColor = '#ccc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!addedBridges.has(bridge._id)) {
                        e.target.style.backgroundColor = '#f8f9fa';
                        e.target.style.borderColor = '#e0e0e0';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          {bridge.name || 'Unnamed Bridge'}
                        </h3>
                        {bridge.slugname && (
                          <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            color: '#666',
                            fontStyle: 'italic'
                          }}>
                            {bridge.slugname}
                          </p>
                        )}
                        {bridge.prompt && (
                          <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: '#888',
                            maxHeight: '40px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {bridge.prompt.length > 100 
                              ? `${bridge.prompt.substring(0, 100)}...` 
                              : bridge.prompt
                            }
                          </p>
                        )}
                      </div>
                      <div style={{ marginLeft: '16px', display: 'flex', gap: '8px' }}>
                        {/* View Config Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBridge(bridge);
                            setIsConfigModalOpen(true);
                          }}
                          style={{
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Config
                        </button>
                        
                        {addedBridges.has(bridge._id) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBridge(bridge._id);
                            }}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Remove
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddBridge(bridge);
                            }}
                            style={{
                              backgroundColor: '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {isConfigModalOpen && selectedBridge && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={handleCloseConfig}
        >
          <div
            style={{
              width: '80%',
              maxWidth: '800px',
              maxHeight: '90vh',
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              animation: 'modalSlideIn 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#333' }}>
                Bridge Configuration
              </h2>
              <button
                onClick={handleCloseConfig}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: '#666',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px'
            }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  Basic Information
                </h3>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                      Name
                    </label>
                    <div style={{
                      padding: '12px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      {selectedBridge.name || 'Unnamed Bridge'}
                    </div>
                  </div>
                  
                  {selectedBridge.slugname && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                        Slug Name
                      </label>
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}>
                        {selectedBridge.slugname}
                      </div>
                    </div>
                  )}
                  
                  {selectedBridge._id && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#555' }}>
                        Bridge ID
                      </label>
                      <div style={{
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'monospace'
                      }}>
                        {selectedBridge._id}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedBridge.prompt && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                    Prompt Configuration
                  </h3>
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedBridge.prompt}
                  </div>
                </div>
              )}

              {/* Additional configuration fields */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                  Additional Configuration
                </h3>
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedBridge, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={handleCloseConfig}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              
              {!addedBridges.has(selectedBridge._id) && (
                <button
                  onClick={() => {
                    handleAddBridge(selectedBridge);
                    handleCloseConfig();
                  }}
                  style={{
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Add to Flow
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ReactFlow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      />

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes modalSlideIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}