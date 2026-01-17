"use client"
import React, { useCallback, useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation';
import { setEmbedUserDetailsAction, clearEmbedThemeDetailsAction } from '@/store/action/appInfoAction';
import { useDispatch } from 'react-redux';
import { createBridgeAction, getAllBridgesAction, updateBridgeAction} from '@/store/action/bridgeAction';
import { generateRandomID, sendDataToParent, toBoolean } from '@/utils/utility';
import { useCustomSelector } from '@/customHooks/customSelector';
import { isPending } from '@/store/reducer/bridgeReducer';
import ServiceInitializer from '@/components/organization/ServiceInitializer';
import { ThemeManager } from '@/customHooks/useThemeManager';
import defaultUserTheme from '@/public/themes/default-user-theme.json';

const Layout = ({ children }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgentName, setCurrentAgentName] = useState(null);
  const [processedAgentName, setProcessedAgentName] = useState(null);
  const [openGtwyReceived, setOpenGtwyReceived] = useState(false);

  // Memoize URL params parsing to avoid unnecessary re-parsing
  const urlParamsObj = useMemo(() => {
    const interfaceDetailsParam = searchParams.get('interfaceDetails');
    const decodedParam = interfaceDetailsParam ? interfaceDetailsParam : null;
    return decodedParam ? JSON.parse(decodedParam) : {};
  }, [searchParams]);

  const { allBridges, embedThemeConfig } = useCustomSelector((state) => ({
    allBridges: state.bridgeReducer?.orgs?.[urlParamsObj.org_id]?.orgs || [],
    embedThemeConfig: state.appInfoReducer?.embedUserDetails?.theme_config || null,
  }));
  const resolvedEmbedTheme = useMemo(() => embedThemeConfig || defaultUserTheme, [embedThemeConfig]);
    // Reset embed theme config to ensure fresh state for new embeds
  const resetEmbedThemeConfig = useCallback(() => {
    dispatch(clearEmbedThemeDetailsAction());
  }, [dispatch]);
  useEffect(() => {
    if (!embedThemeConfig || embedThemeConfig.length === 0) {
      dispatch(setEmbedUserDetailsAction({ theme_config: defaultUserTheme }));
    }
  }, [dispatch, embedThemeConfig]);
  
  // Reset theme config when component mounts


  // Listen for openGtwy event from parent
  useEffect(() => {
    window.parent.postMessage({ type: 'gtwyLoaded', data: 'gtwyLoaded' }, '*');
  }, []);

  useEffect(()=>{
    resetEmbedThemeConfig();
  },[])

  const createNewAgent = useCallback((agent_name, orgId, agent_purpose) => {
    // Reset theme config when creating a new agent
    const dataToSend = agent_purpose ? {purpose: agent_purpose.trim()} : {
      service: 'openai',
      model: 'gpt-4o',
      name: agent_name.trim(),
      slugName: generateRandomID(),
      bridgeType: 'api',
      type: 'chat',
    };
    dispatch(isPending())
    dispatch(
      createBridgeAction({ dataToSend, orgid: orgId }, response => {
        const createdAgent = response?.data?.agent;
        if (createdAgent) {
          const targetVersion = createdAgent?.published_version_id || createdAgent?.versions?.[0];
          sendDataToParent(
            'drafted',
            {
              name: createdAgent.name,
              agent_id: createdAgent._id,
            },
            'Agent created Successfully'
          );
          if (targetVersion) {
            router.push(`/org/${orgId}/agents/configure/${createdAgent._id}?version=${targetVersion}`);
          }
        }
        setIsLoading(false);
        setProcessedAgentName(agent_name);
      })
    ).catch(() => {
      setIsLoading(false);
      setProcessedAgentName(agent_name);
    });
  }, [dispatch, router]);

  const navigateToExistingAgent = useCallback((agent, orgId) => {
    // Reset theme config when navigating to a different agent
    const version = agent?.published_version_id || agent?.versions?.[0];
    if(agent?._id && orgId && version){
      router.push(
        `/org/${orgId}/agents/configure/${agent._id}?version=${version}`
      );
    }
    setIsLoading(false);
    setProcessedAgentName(agent.name);
  }, [router]);

  const handleAgentNavigation = useCallback(async (agentName, orgId) => {
    if (!agentName || !orgId || processedAgentName === agentName || !openGtwyReceived) {
      if (processedAgentName === agentName) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const trimmedAgentName = agentName.trim();

    // First check if agent exists in current store
    if (allBridges && allBridges.length > 0) {
      const agentInStore = allBridges.find(
        (agent) => agent?.name?.trim() === trimmedAgentName
      );
      if (agentInStore) {
        navigateToExistingAgent(agentInStore, orgId);
        return;
      }
    }

    // Only fetch bridges if not already present in store and openGtwy event received
    try {
      let bridges = allBridges;
      if (!allBridges || allBridges.length === 0) {
        await dispatch(getAllBridgesAction((data) => {
          bridges = data;
        }));
      }

      const existingAgent = bridges?.find(
        (agent) => agent?.name?.trim() === trimmedAgentName
      );

      if (existingAgent) {
        navigateToExistingAgent(existingAgent, orgId);
      } else {
        createNewAgent(agentName, orgId);
      }
    } catch (error) {
      console.error('Error fetching bridges, falling back to create a new agent:', error);
      createNewAgent(agentName, orgId);
    }
  }, [processedAgentName, dispatch, createNewAgent, navigateToExistingAgent, allBridges, openGtwyReceived]);

  // Initialize tokens and setup immediately (without waiting for openGtwy)
  useEffect(() => {
    const initializeTokens = () => {
      // Reset theme config on initialization
      if ((urlParamsObj.org_id && urlParamsObj.token && (urlParamsObj.folder_id||urlParamsObj.gtwy_user)) || urlParamsObj?.hideHomeButton) {
        // Clear previous embed user details to prevent theme persistence
        dispatch(clearEmbedThemeDetailsAction());

        if (urlParamsObj.token) {
          dispatch(setEmbedUserDetailsAction({ isEmbedUser: true, hideHomeButton: urlParamsObj?.hideHomeButton }));
          sessionStorage.setItem('local_token', urlParamsObj.token);
          sessionStorage.setItem('gtwy_org_id', urlParamsObj?.org_id);
          sessionStorage.setItem('gtwy_folder_id', urlParamsObj?.folder_id);
          urlParamsObj?.folder_id && sessionStorage.setItem('embedUser', true);
        }

        if (urlParamsObj.config) {
          Object.entries(urlParamsObj.config).forEach(([key, value]) => {
            if (value === undefined) return;
            if (key === "apikey_object_id") {
              dispatch(setEmbedUserDetailsAction({ [key]: value }));
              return;
            }
            if (key === "theme_config") {
              let parsedTheme = value;
              if (typeof value === "string") {
                try {
                  parsedTheme = JSON.parse(value);
                } catch (err) {
                  console.error("Invalid theme_config JSON in embed params", err);
                }
              }
              dispatch(setEmbedUserDetailsAction({ theme_config: parsedTheme }));
              return;
            }
            dispatch(setEmbedUserDetailsAction({ [key]: toBoolean(value) }));
          });
        }
        
        // Set agent name but don't navigate yet
        if (urlParamsObj?.agent_name) {
          setCurrentAgentName(urlParamsObj.agent_name);
        }
      }
    };

    initializeTokens();
  }, [urlParamsObj]);

  // Handle navigation only after openGtwy event is received
  useEffect(() => {
    const handleNavigation = () => {
      if (!openGtwyReceived) {
        return;
      }

      if ((urlParamsObj.org_id && urlParamsObj.token && (urlParamsObj.folder_id||urlParamsObj.gtwy_user)) || urlParamsObj?.hideHomeButton) {
        setIsLoading(true);
        
        if (urlParamsObj?.agent_name) {
        } else if (urlParamsObj?.agent_id) {
          router.push(`/org/${urlParamsObj.org_id}/agents/configure/${urlParamsObj.agent_id}?isEmbedUser=true`);
        } else {
          router.push(`/org/${urlParamsObj.org_id}/agents?isEmbedUser=true`);
        }
      } else {
        setIsLoading(false);
      }
    };

    handleNavigation();
  }, [openGtwyReceived, urlParamsObj]);

  useEffect(() => {
    if (currentAgentName) {
      const orgId = urlParamsObj.org_id || sessionStorage.getItem('gtwy_org_id');
      if (orgId) {
        handleAgentNavigation(currentAgentName, orgId);
      }
    }
  }, [currentAgentName, urlParamsObj.org_id]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event?.data?.data?.type === "openGtwy")
        setOpenGtwyReceived(true);
      if (event.data?.data?.type !== "gtwyInterfaceData") return;
      // Only fetch bridges if not already present in store
      let bridges = allBridges;
      if (!allBridges || allBridges.length === 0) {
        await dispatch(getAllBridgesAction((data) => {
          bridges = data;
        }));
      }
      
      const messageData = event.data.data.data;
      const orgId = sessionStorage.getItem('gtwy_org_id');
      
      if (messageData?.agent_name) {
        setIsLoading(true);
        handleAgentNavigation(messageData.agent_name, orgId);
      } else if (messageData?.agent_id && orgId) {
        const bridgeData = bridges.find((bridge) => bridge._id === messageData.agent_id);
        const history = messageData?.history;
        
        if (!bridgeData) {
          router.push(`/org/${orgId}/agents`);
          return;
        }
        
        if (history) {
          router.push(`/org/${orgId}/agents/history/${messageData.agent_id}?version=${bridgeData.published_version_id || bridgeData.versions[0]}&message_id=${history.message_id}`);
          return;
        }
        
        router.push(`/org/${orgId}/agents/configure/${messageData.agent_id}?version=${bridgeData.published_version_id || bridgeData.versions[0]}`);
        return;
      } else if (messageData?.agent_purpose) {
        createNewAgent('', orgId, messageData.agent_purpose);
        setIsLoading(true);
      }
      
      if (messageData?.meta?.length > 0 && messageData?.agent_id && orgId) {
        const bridge = bridges.find((bridge) => bridge._id === messageData.agent_id);
        if (!bridge) {
          return;
        }
        dispatch(updateBridgeAction({
          dataToSend: { meta: messageData.meta },
          bridgeId: messageData.agent_id
        }))
        .then(() => {
          router.push(`/org/${orgId}/agents/configure/${messageData.agent_id}`);
        })
      }

      const uiUpdates = {};
      if (messageData?.hideHomeButton !== undefined) uiUpdates.hideHomeButton = messageData.hideHomeButton;
      if (messageData?.showGuide !== undefined) uiUpdates.showGuide = messageData.showGuide;
      if (messageData?.showConfigType !== undefined) uiUpdates.showConfigType = messageData.showConfigType;
      if (messageData?.theme_config) {
        let incomingTheme = messageData.theme_config;
        if (typeof incomingTheme === "string") {
          try {
            incomingTheme = JSON.parse(incomingTheme);
          } catch (err) {
            console.error("Invalid theme_config JSON from message data", err);
          }
        }
        // Set new theme config
        dispatch(setEmbedUserDetailsAction({ theme_config: incomingTheme }));
      }

      if (Object.keys(uiUpdates).length > 0) {
        dispatch(setEmbedUserDetailsAction(uiUpdates));
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      // window.removeEventListener('message', handleMessage);
    };
  }, []);


  // Memoize loading component to avoid unnecessary re-renders
  const LoadingComponent = useMemo(() => (
    <div className="flex items-center justify-center min-h-screen bg-base-100">
      <div className="text-center">
        <div className="text-4xl font-bold text-base-content mb-4">
          GTWY
        </div>
        <div className="flex items-center justify-center space-x-1 text-xl text-base-content">
          <span>is loading</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
          </div>
        </div>
      </div>
      <ServiceInitializer/>
    </div>
  ), []);

  if (isLoading) {
    return (
      <>
        <ThemeManager userType="embed" customTheme={resolvedEmbedTheme} />
        {LoadingComponent}
      </>
    );
  }

  return (
    <>
      <ThemeManager userType="embed" customTheme={resolvedEmbedTheme} />
      {children}
    </>
  );
}

export default Layout;
