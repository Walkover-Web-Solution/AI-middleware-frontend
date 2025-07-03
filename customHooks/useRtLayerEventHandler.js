// hooks/useRtLayerEventHandler.js
'use client';
import { addThreadNMessageUsingRtLayer, addThreadUsingRtLayer } from "@/store/reducer/historyReducer";
import { useDispatch } from "react-redux";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import WebSocketClient from 'rtlayer-client';

function useRtLayerEventHandler() {
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const dispatch = useDispatch();
    const pathName = usePathname();
    const listenerRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    
    // Extract path parameters with error handling
    const { bridgeId, orgId } = useMemo(() => {
        try {
            const path = pathName.split('?')[0].split('/');
            return {
                bridgeId: path[5],
                orgId: path[2]
            };
        } catch (error) {
            console.error("Error parsing path parameters:", error);
            return { bridgeId: null, orgId: null };
        }
    }, [pathName]);
    
    // Memoize channel ID to prevent unnecessary recalculations
    const channelId = useMemo(() => {
        if (!bridgeId || !orgId) return null;
        return (orgId + bridgeId).replace(/ /g, "_");
    }, [bridgeId, orgId]);
    
    // History data processor function
    const processHistoryData = useCallback((message) => {
        try {
            // If message is a string, parse it first
            const parsedData = typeof message === 'string' ? JSON.parse(message) : message;
            
            // Extract response data with better error handling
            const { response } = parsedData;
            
            if (!response) {
                console.error("No response found in data");
                return { success: false, error: "No response found" };
            }
            
            const { Thread, Messages } = response;
            
            // Validate required data
            if (!Thread) {
                console.error("Missing Thread or Message data");
            }
            if(!Messages)
            {
                console.error("Missing Message")
            }
            Object.keys(Messages).forEach(key => {
                Messages[key].fromRTLayer = true;
            });
          // Clean the data to reduce serialization overhead
            const cleanThread = {
                thread_id: Thread.thread_id,
                sub_thread_id: Thread.sub_thread_id,
                bridge_id: Thread.bridge_id
            };

            console.log('dlkjf',Messages);
            // Dispatch actions to Redux store
            dispatch(addThreadUsingRtLayer({ Thread: cleanThread }));
            dispatch(addThreadNMessageUsingRtLayer({Messages}))
            
        } catch (error) {
            console.error("Error parsing message data:", error);
        }
    }, [dispatch]);
    
    // WebSocket client initialization with retry logic
    const initializeWebSocketClient = useCallback(async () => {
        try {
            // Clear any existing reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            
            const newClient = WebSocketClient("lyvSfW7uPPolwax0BHMC", "DprvynUwAdFwkE91V5Jj");
            
            // Add connection event handlers
            if (newClient && typeof newClient.on === 'function') {
                newClient.on('connect', () => {
                    setIsConnected(true);
                    setConnectionError(null);
                });
                
                newClient.on('disconnect', () => {
                    setIsConnected(false);
                });
                
                newClient.on('error', (error) => {
                    setConnectionError(error.message || 'Connection error');
                    setIsConnected(false);
                });
            }
            
            setClient(newClient);
            setIsConnected(true);
            setConnectionError(null);
            
            return newClient;
        } catch (error) {
            console.error("Failed to initialize WebSocket client:", error);
            setConnectionError(error.message);
            setIsConnected(false);
            
            // Auto-retry connection after 5 seconds
            reconnectTimeoutRef.current = setTimeout(() => {
                initializeWebSocketClient();
            }, 5000);
            
            return null;
        }
    }, []);
    
    // Initialize WebSocket client
    useEffect(() => {
        let mounted = true;
        
        if (!client && mounted) {
            initializeWebSocketClient();
        }
        
        // Cleanup function
        return () => {
            mounted = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [client, initializeWebSocketClient]);
    
    // Set up event listener
    useEffect(() => {
        if (!client || !channelId) {
            return;
        }
        
        try {
            // Remove existing listener if any
            if (listenerRef.current && typeof listenerRef.current.remove === 'function') {
                listenerRef.current.remove();
            }
            
            // Create new listener
            const listener = client.on(channelId, (message) => {
                processHistoryData(message);
            });
            
            listenerRef.current = listener;
            
            // Cleanup function
            return () => {
                if (listenerRef.current && typeof listenerRef.current.remove === 'function') {
                    listenerRef.current.remove();
                    listenerRef.current = null;
                }
            };
            
        } catch (error) {
            console.error("Error setting up WebSocket listener:", error);
            setConnectionError(error.message);
        }
    }, [client, channelId, processHistoryData]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Clear any pending reconnect timeout
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            
            // Remove listener
            if (listenerRef.current && typeof listenerRef.current.remove === 'function') {
                listenerRef.current.remove();
            }
            
            // Close client connection
            if (client && typeof client.close === 'function') {
                client.close();
            }
        };
    }, [client]);
    
    // Manual reconnect function
    const reconnect = useCallback(() => {
        if (client && typeof client.close === 'function') {
            client.close();
        }
        setClient(null);
        setIsConnected(false);
        setConnectionError(null);
        
        // Initialize new client
        setTimeout(() => {
            initializeWebSocketClient();
        }, 100);
    }, [client, initializeWebSocketClient]);
    
    // Return connection status and methods for external use
    return {
        client,
        isConnected,
        connectionError,
        reconnect,
        channelId,
        processHistoryData, // Expose for manual processing if needed
        bridgeId,
        orgId
    };
}

export default useRtLayerEventHandler;
