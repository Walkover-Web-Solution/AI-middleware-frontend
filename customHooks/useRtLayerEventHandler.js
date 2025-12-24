// hooks/useRtLayerEventHandler.js
'use client';
import { addThreadNMessageUsingRtLayer, addThreadUsingRtLayer } from "@/store/reducer/historyReducer";
import { handleRtLayerMessage, setChatTestCaseIdAction, addChatErrorMessage } from "@/store/action/chatAction";
import { useDispatch, useSelector } from "react-redux";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import WebSocketClient from 'rtlayer-client';
import { toast } from 'react-toastify';
import { didCurrentTabInitiateUpdate } from '@/utils/utility';
import { RefreshIcon } from "@/components/Icons";
import { buildLlmUrls } from '@/utils/attachmentUtils';

function useRtLayerEventHandler(channelIdentifier="") {
    const [client, setClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionError, setConnectionError] = useState(null);
    const dispatch = useDispatch();
    const pathName = usePathname();
    const listenerRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const streamingBufferRef = useRef({});
    const activeStreamingMessageIdRef = useRef(null);
    const pendingSkipCountRef = useRef(0);
    const messagesByChannel = useSelector(state => state.chatReducer?.messagesByChannel || {});
    
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
    if(channelIdentifier!=""){
      return channelIdentifier;
    }
    if (!bridgeId || !orgId) return null;
    return (orgId + bridgeId).replace(/ /g, "_");
  }, [bridgeId, orgId, channelIdentifier]);
  const chatChannelId = channelIdentifier || channelId;

  // Helper function to show toast notification
  const showAgentUpdatedToast = useCallback(() => {
    if (!toast.isActive('agent-updated')) {
      const RefreshButton = () => {
        const handleRefresh = () => {
          toast.dismiss('agent-updated');
          window.location.reload();
        };
        return (
          <div className="mt-2 flex justify-center">
            <button
              onClick={handleRefresh}
              className="btn btn-primary btn-sm"
            >
              <RefreshIcon size={16}/>
              Refresh Page
            </button>
          </div>
        );
      };
      toast.info(
        <div className="">
          <div className="">
            Agent has been updated. Please refresh to see changes.
          </div>
          <RefreshButton />
        </div>,
        {
          position: 'top-right',
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          toastId: 'agent-updated',
          style: { border: '1px solid #ccc' },

        }
      );
    }
  }, []);

  const findLatestLoadingMessageId = useCallback(() => {
    if (!chatChannelId) return null;
    const channelMessages = messagesByChannel?.[chatChannelId];
    if (!Array.isArray(channelMessages) || !channelMessages.length) return null;
    for (let i = channelMessages.length - 1; i >= 0; i--) {
      const msg = channelMessages[i];
      if (msg?.sender === 'assistant' && msg?.isLoading) {
        return msg.id;
      }
    }
    return null;
  }, [chatChannelId, messagesByChannel]);

  const handleStreamingPayload = useCallback((payload) => {
    if (!chatChannelId) return;
    const chunk = payload?.chunk || null;
    const delta = typeof chunk?.delta === 'string' ? chunk.delta : '';

    const channelMessages = messagesByChannel?.[chatChannelId] || [];
    let targetMessageId = null;
    if (chunk?.item_id) {
      const hasMatchingId = channelMessages.some(msg => msg.id === chunk.item_id);
      if (hasMatchingId) {
        targetMessageId = chunk.item_id;
      }
    }
    if (!targetMessageId) {
      targetMessageId = activeStreamingMessageIdRef.current || findLatestLoadingMessageId();
    }
    if (!targetMessageId) return;

    activeStreamingMessageIdRef.current = targetMessageId;

    if (chunk?.type === 'delta' && delta) {
      const previous = streamingBufferRef.current[targetMessageId] || '';
      const updated = previous + delta;
      streamingBufferRef.current[targetMessageId] = updated;
      dispatch(handleRtLayerStreamingUpdate(chatChannelId, targetMessageId, updated, false));
    }

    if (payload?.done) {
      const finalContent = streamingBufferRef.current[targetMessageId] || '';
      dispatch(handleRtLayerStreamingUpdate(chatChannelId, targetMessageId, finalContent, true));
      delete streamingBufferRef.current[targetMessageId];
      activeStreamingMessageIdRef.current = null;
      pendingSkipCountRef.current += 1;
    }
  }, [chatChannelId, dispatch, findLatestLoadingMessageId, messagesByChannel]);

  const shouldSkipFinalResponse = useCallback(() => {
    if (pendingSkipCountRef.current > 0) {
      pendingSkipCountRef.current -= 1;
      return true;
    }
    return false;
  }, []);

  // ---------- History data processor (socket messages) ----------
  const processHistoryData = useCallback((message) => {
    try {
      const parsedData = typeof message === 'string' ? JSON.parse(message) : message;
      const {
        streaming = false,
        response: responsePayload,
        success = true,
        error: rootError
      } = parsedData || {};

      if (rootError && chatChannelId) {
        dispatch(addChatErrorMessage(chatChannelId, rootError?.error || rootError?.message || 'Unable to process response'));
        return;
      }

      if (streaming) {
        handleStreamingPayload(parsedData);
        return;
      }

      const response = responsePayload || parsedData || {};
      const { Thread, Messages, type } = response || {};

      if (!success && !responsePayload) {
        console.error("No response found in data");
        return;
      }

      if (response?.error && chatChannelId) {
        dispatch(addChatErrorMessage(chatChannelId, response.error?.message || response.error));
        return;
      }
      
      if (type === 'agent_updated') {
        const agentId = response.version_id || response.bridge_id;
        const currentTabInitiated = didCurrentTabInitiateUpdate(String(agentId));
        if (currentTabInitiated) {
          return;
        } else {
          const isConfigPage = typeof pathName === 'string' && pathName.includes('/configure/');
          if (isConfigPage) {
            // showAgentUpdatedToast();
          }
        }
        return;
      }

      if (response.message_id) {
        if (shouldSkipFinalResponse()) {
          return;
        }
        const threadData = {
          thread_id: response.thread_id,
          sub_thread_id: response.sub_thread_id || response.thread_id,
          bridge_id: response.bridge_id
        };

        const llmUrls = buildLlmUrls(response.image_urls || [], []);

        const messageData = {
          id: response.message_id,
          user: response.user,
          llm_message: response.llm_message,
          chatbot_message: response.chatbot_message,
          updated_llm_message: response.updated_llm_message,
          error: response.error,
          tools_call_data: response.tools_call_data || [],
          llm_urls: llmUrls,
          urls: response.urls || [],
          user_feedback: response.user_feedback,
          version_id: response.version_id,
          org_id: response.org_id,
          bridge_id: response.bridge_id,
          prompt: response.prompt,
          AiConfig: response.AiConfig,
          fallback_model: response.fallback_model,
          model: response.model,
          status: response.status,
          tokens: response.tokens,
          variables: response.variables,
          latency: response.latency,
          firstAttemptError: response.firstAttemptError,
          finish_reason: response.finish_reason,
          parent_id: response.parent_id,
          child_id: response.child_id,
          fromRTLayer: true,
          created_at: new Date().toISOString()
        };

        if (threadData.thread_id) {
          dispatch(addThreadUsingRtLayer({ Thread: threadData }));
          const messageMap = {
            [response.message_id]: messageData
          };
          
          dispatch(addThreadNMessageUsingRtLayer({
            thread_id: threadData.thread_id, 
            sub_thread_id: threadData.sub_thread_id, 
            Messages: messageMap
          }));
        }
        return;
      }

      if (response.data) {
        if (shouldSkipFinalResponse()) {
          return;
        }
        if (response.data) {
          const rawImages = Array.isArray(response.data.images) ? response.data.images : [];
          const llmUrls = buildLlmUrls(rawImages, []);
          const messageData = {
            id: response.data.id || response.data.message_id,
            content: response.data.content,
            role: response.data.role || 'assistant',
            model: response.data.model,
            finish_reason: response.data.finish_reason,
            fallback: response.data.fall_back,
            firstAttemptError: response.data.firstAttemptError,
            images: rawImages,
            llm_urls: llmUrls,
            tools_data: response.data.tools_data || {},
            annotations: response.data.annotations,
            fromRTLayer: true,
            usage: parsedData.response?.usage
          };
          if (chatChannelId) {
            dispatch(handleRtLayerMessage(chatChannelId, messageData));
          }
        } else if (Messages && Array.isArray(Messages)) {
          if (chatChannelId) {
            Messages.forEach(msg => {
              msg.fromRTLayer = true;
              dispatch(handleRtLayerMessage(chatChannelId, msg));
            });
          }
        }
        return;
      }

      if (response.testcase_id && chatChannelId) {
        dispatch(setChatTestCaseIdAction(chatChannelId, response.testcase_id));
      }
   
      if (!Thread || !Messages) {
        return;
      }
      Object.keys(Messages).forEach(key => {
        Messages[key].fromRTLayer = true;
      });
      
      const cleanThread = {
        thread_id: Thread.thread_id,
        sub_thread_id: Thread.sub_thread_id,
        bridge_id: Thread.bridge_id
      };

      dispatch(addThreadUsingRtLayer({ Thread: cleanThread }));
      dispatch(addThreadNMessageUsingRtLayer({thread_id:cleanThread.thread_id, sub_thread_id:cleanThread.sub_thread_id, Messages}))
            
    } catch (error) {
      console.error("Error parsing message data:", error);
    }
  }, [chatChannelId, dispatch, handleStreamingPayload, pathName, shouldSkipFinalResponse, showAgentUpdatedToast]);
    
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
