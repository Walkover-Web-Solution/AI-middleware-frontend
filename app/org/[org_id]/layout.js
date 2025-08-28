"use client";
import ErrorPage from "@/app/not-found";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import LoadingSpinner from "@/components/loadingSpinner";
import Navbar from "@/components/navbar";
import Protected from "@/components/protected";
import MainSlider from "@/components/sliders/mainSlider";
import { getSingleMessage, switchOrg } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEmbedScriptLoader } from "@/customHooks/embedScriptLoader";
import { getAllApikeyAction } from "@/store/action/apiKeyAction";
import { createApiAction, deleteFunctionAction, getAllBridgesAction, getAllFunctions, getPrebuiltToolsAction, integrationAction, updateApiAction, updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { getAllKnowBaseDataAction, getKnowledgeBaseTokenAction } from "@/store/action/knowledgeBaseAction";
import { updateUserMetaOnboarding } from "@/store/action/orgAction";
import { getModelAction } from "@/store/action/modelAction";
import { getServiceAction } from "@/store/action/serviceAction";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";

import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import useRtLayerEventHandler from "@/customHooks/useRtLayerEventHandler";
import { getApiKeyGuideAction, getTutorialDataAction } from "@/store/action/flowDataAction";
import { userDetails } from "@/store/action/userDetailsAction";
import { getAllOrchestralFlowAction } from "@/store/action/orchestralFlowAction";
import { storeMarketingRefUserAction } from "@/store/action/marketingRefAction";
function layoutOrgPage({ children, params, isEmbedUser }) {
  const dispatch = useDispatch();
  const pathName = usePathname();
  const urlParams = useParams();
  const searchParams = useSearchParams();
  const version_id = searchParams.get('version');
  const path = pathName.split('?')[0].split('/')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [isValidOrg, setIsValidOrg] = useState(true);
  const [loading, setLoading] = useState(true);
  const { embedToken, alertingEmbedToken, versionData, organizations, preTools, currentUser, SERVICES } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    alertingEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.alerting_embed_token,
    versionData: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.apiCalls || {},
    organizations: state.userDetailsReducer.organizations,
    preTools: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.pre_tools || {},
    SERVICES: state?.serviceReducer?.services,
    currentUser: state.userDetailsReducer.userDetails,
    doctstar_embed_token: state?.bridgeReducer?.org?.[params.org_id]?.doctstar_embed_token || "",
  }));
  useEffect(() => {
    if (pathName.endsWith("agents") && !isEmbedUser) {
      dispatch(getTutorialDataAction()); 
      dispatch(userDetails());
    }
    if (pathName.endsWith("apikeys")&& !isEmbedUser) {
      dispatch(getApiKeyGuideAction()); 
    }
  }, [pathName]);
  useEffect(() => {
    const updateUserMeta = async () => {
      const reference_id = localStorage.getItem("reference_id");
        let currentUserMeta = currentUser?.meta;
      // If user meta is null, initialize onboarding meta
      if (currentUser?.meta === null) {
        const updatedUser = {
          ...currentUser,
          meta: {
            onboarding: {
              bridgeCreation: true,
              FunctionCreation: true,
              knowledgeBase: true,
              Addvariables: true,
              AdvanceParameter: true,
              PauthKey: true,
              CompleteBridgeSetup: true,
              TestCasesSetup:true
            },
          },
        };
      const data= await dispatch(updateUserMetaOnboarding(currentUser.id, updatedUser));
      if (data?.data?.status) {
        currentUserMeta = data?.data?.data?.user?.meta;
      }
      }
  
      // If reference_id exists but user has no reference_id in meta
      if (reference_id && !currentUser?.meta?.reference_id) {
        try {
          const data = await dispatch(
            storeMarketingRefUserAction({
              ref_id: reference_id,
              client_id: currentUser.id,
              client_email: currentUser.email,
              client_name: currentUser.name,
              created_at: currentUser.created_at,
            })
          );
  
          if (data?.status) {
            const updatedUser = {
              ...currentUser,
              meta: {
                ...currentUserMeta,
                reference_id: reference_id,
              },
            };
            await dispatch(updateUserMetaOnboarding(currentUser.id, updatedUser));
          }
        } catch (err) {
          console.error("Error storing marketing ref:", err);
        }
      }
    };
  
    updateUserMeta();
  }, []);
  

  useEmbedScriptLoader(pathName.includes('agents') ? embedToken : pathName.includes('alerts') && !isEmbedUser ? alertingEmbedToken : '', isEmbedUser);
  useRtLayerEventHandler();

  // Theme initialization with full system theme support
  useEffect(() => {
    const getSystemTheme = () => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    };

    const applyTheme = (themeToApply) => {
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-theme', themeToApply);
      }
    };

    const savedTheme = localStorage.getItem("theme") || "system";
    const systemTheme = getSystemTheme();
    
    if (savedTheme === "system") {
      applyTheme(systemTheme);
    } else {
      applyTheme(savedTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? 'dark' : 'light';
      const currentSavedTheme = localStorage.getItem("theme") || "system";
      
      // Only update if currently using system theme
      if (currentSavedTheme === "system") {
        applyTheme(newSystemTheme);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);
  
  useEffect(() => {
    const validateOrg = async () => {
      try {
        if (!organizations) {
          return;
        }
        const orgExists = organizations[params?.org_id]
        if (orgExists) {
          setIsValidOrg(true);
        } else {
          setIsValidOrg(false);
        }
      } catch (error) {
        setIsValidOrg(false);
      }
    };
    if (params.org_id && organizations && !isEmbedUser) {
      validateOrg();
    }
  }, [params, organizations]);

  useEffect(() => {
    if (!SERVICES || Object?.entries(SERVICES)?.length === 0) {
      dispatch(getServiceAction({ orgid: params.orgid }))
    }
  }, [SERVICES]);

  useEffect(() => {
    if (isValidOrg) {
      dispatch(getAllBridgesAction((data) => {
        if (data?.length === 0 && !currentUser?.meta?.onboarding?.bridgeCreation) {
          openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
        }
        setLoading(false);
      }))
      dispatch(getAllFunctions())
    }
  }, [isValidOrg, currentUser?.meta?.onboarding?.bridgeCreation]);

  useEffect(() => {
    if (isValidOrg) {
      Array?.isArray(SERVICES) && SERVICES?.map((service) => {
        dispatch(getModelAction({ service: service?.value }));
        return null; // to satisfy map's return
      });
    }
  }, [isValidOrg]);

  useEffect(() => {
    dispatch(getAllOrchestralFlowAction(params.org_id));
  }, [params.org_id]);

  useEffect(() => {
    if (isValidOrg && params?.org_id) {
      dispatch(getAllApikeyAction(params?.org_id));
      dispatch(getAllKnowBaseDataAction(params?.org_id))
      dispatch(getPrebuiltToolsAction())
    }
  }, [isValidOrg, dispatch, params?.org_id]);

  const scriptId = "chatbot-main-script";
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {
    if (isValidOrg) {
      const updateScript = (token) => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          document.head.removeChild(existingScript);
        }
        if (token) {
          const script = document.createElement("script");
          script.setAttribute("embedToken", token);
          script.setAttribute("hideIcon", true);
          script.setAttribute("eventsToSubscribe", JSON.stringify(["MESSAGE_CLICK"]));
          script.id = scriptId;
          script.src = scriptSrc;
          document.head.appendChild(script);
        }
      };

      dispatch(getAllChatBotAction(params.org_id)).then(e => {
        const chatbotToken = e?.chatbot_token
        if (chatbotToken && !pathName.includes('/history')) updateScript(chatbotToken);
      })

      return () => {
        if (!pathName.includes('/history')) {
          const existingScript = document.getElementById(scriptId);
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        }
      };
    }
  }, [isValidOrg]);

  useEffect(() => {
    const onFocus = async () => {
      if (isValidOrg) {
        const orgId = localStorage.getItem("current_org_id");
        if (orgId !== params?.org_id) {
          await switchOrg(params?.org_id);
        }
      }
    };
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    }
  }, [isValidOrg, params])

  // useEffect(() => {
  //   const updateScript = (token) => {
  //     const existingScript = document.getElementById("rag-main-script");
  //     if (existingScript) {
  //       document.head.removeChild(existingScript);
  //     }
  //     if (!token) return;
  //     const script = document.createElement("script");
  //     script.id = "rag-main-script";
  //     script.src = process.env.NEXT_PUBLIC_RAG_EMBED_URL;
  //     script.setAttribute("embedToken", token);
  //     document.head.appendChild(script);
  //   };

  //   dispatch(getKnowledgeBaseTokenAction(params.org_id)).then((data) => {
  //     const token = data?.response;
  //     updateScript(token);
  //   });
  // }, [params.org_id]);

  // const docstarScriptId = "docstar-main-script";
  // const docstarScriptSrc = "https://app.docstar.io/scriptProd.js";

  // useEffect(() => {
  //   const existingScript = document.getElementById(docstarScriptId);
  //   if (existingScript) {
  //     document.head.removeChild(existingScript);
  //   }
  //   if (doctstar_embed_token) {
  //     const script = document.createElement("script");
  //     script.setAttribute("embedToken", doctstar_embed_token);
  //     script.id = docstarScriptId;
  //     script.src = docstarScriptSrc;
  //     document.head.appendChild(script);
  //   }
  // }, [doctstar_embed_token]);

  useEffect(() => {
    if (isValidOrg) {
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [isValidOrg, params.id, versionData, version_id, path]);

  async function handleMessage(e) {
    if (e.data?.metadata?.type !== 'tool') return;
    // todo: need to make api call to update the name & description
    if (e?.data?.webhookurl) {
      const dataToSend = {
        ...e.data,
        status: e?.data?.action
      }
      dispatch(integrationAction(dataToSend, params?.org_id));
      if (e?.data?.action === 'deleted') {
        if (versionData && typeof versionData === 'object' && !Array.isArray(versionData)) {
          const selectedVersionData = Object.values(versionData).find(
            fn => fn.function_name === e?.data?.id
          );
          if (selectedVersionData) {
            await dispatch(updateBridgeVersionAction({
              bridgeId: path[5],
              versionId: version_id,
              dataToSend: {
                functionData: {
                  function_id: selectedVersionData._id,
                  function_name: selectedVersionData.function_name
                }
              }
            }));
          }
          dispatch(deleteFunctionAction({ function_name: e?.data?.id, orgId: path[2], functionId: selectedVersionData?._id }));
        }
      }

      if ((e?.data?.action === "published" || e?.data?.action === "paused" || e?.data?.action === "created" || e?.data?.action === "updated")) {
        const dataFromEmbed = {
          url: e?.data?.webhookurl,
          payload: e?.data?.payload,
          desc: e?.data?.description || e?.data?.title,
          id: e?.data?.id,
          status: e?.data?.action,
          title: e?.data?.title,
        };
        dispatch(createApiAction(params.org_id, dataFromEmbed)).then((data) => {
          if (!versionData?.[data?._id] && (!Array.isArray(preTools) || !preTools?.includes(data?._id))) {
            {
              e?.data?.metadata?.createFrom && e.data.metadata.createFrom === "preFunction" ? (
                dispatch(updateApiAction(path[5], {
                  pre_tools: [data?._id],
                  version_id: version_id
                }))
              )
                : (
                  dispatch(updateBridgeVersionAction({
                    bridgeId: path[5],
                    versionId: version_id,
                    dataToSend: {
                      functionData: {
                        function_id: data?._id,
                        function_operation: "1"
                      }
                    }
                  }))
                )
            }
          }
        });
      }
    }
    if (e.data?.type === 'MESSAGE_CLICK') {
      try {
        const systemPromptResponse = await getSingleMessage({ bridge_id: urlParams?.id, message_id: e?.data?.data?.createdAt });
        setSelectedItem({ "System Prompt": systemPromptResponse, ...e?.data?.data });
        setIsSliderOpen(true)
      } catch (error) {
        console.error("Failed to fetch single message:", error);
      }
    }
  }

  if (!isValidOrg && !isEmbedUser) {
    return <ErrorPage></ErrorPage>;
  }

  if (!isEmbedUser) {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex flex-col h-full z-high">
            <MainSlider params={params} />
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 ${path.length > 4 ? 'ml-12 lg:ml-12' : ''} flex flex-col overflow-hidden z-medium`}>
            {/* Sticky Navbar */}
            <div className="sticky top-0 z-medium bg-base-100 border-b border-base-300 ml-2">
              <Navbar params={params} />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              <main className={`px-2 h-full ${path.length > 4 && !pathName.includes('flow') ? 'max-h-[calc(100vh-4rem)]' : ''} ${!pathName.includes('history') ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>{children}</main>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
          </div>
        ) : null}

        {/* Chat Details Sidebar */}
        <ChatDetails
          selectedItem={selectedItem}
          setIsSliderOpen={setIsSliderOpen}
          isSliderOpen={isSliderOpen}
        />
      </div>
    );
  }
  else {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
          {/* Main Content Area for Embed Users */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Sticky Navbar */}
            <div className="sticky top-0 z-medium bg-base-100 border-b border-base-300 ml-2">
              <Navbar params={params} />
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              ) : (
                <main className={`px-2 h-full ${path.length > 4 && !pathName.includes('flow') ? 'max-h-[calc(100vh-4rem)]' : ''} ${!pathName.includes('history') ? 'overflow-y-auto' : 'overflow-y-hidden'}`}>{children}</main>
              )}
            </div>
          </div>
      </div>
    );
  }
}

export default Protected(layoutOrgPage);