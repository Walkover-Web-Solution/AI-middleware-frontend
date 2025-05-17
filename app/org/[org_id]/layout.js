"use client";
import ErrorPage from "@/app/not-found";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import LoadingSpinner from "@/components/loadingSpinner";
import Navbar from "@/components/navbar";
import Protected from "@/components/protected";
import MainSlider from "@/components/sliders/mainSlider";
import { getSingleMessage } from "@/config";
import { useCustomSelector } from "@/customHooks/customSelector";
import { useEmbedScriptLoader } from "@/customHooks/embedScriptLoader";
import { getAllApikeyAction } from "@/store/action/apiKeyAction";
import { createApiAction, deleteFunctionAction, getAllBridgesAction, getAllFunctions, getPrebuiltToolsAction, integrationAction, updateBridgeVersionAction } from "@/store/action/bridgeAction";
import { getAllChatBotAction } from "@/store/action/chatBotAction";
import { getAllKnowBaseDataAction } from "@/store/action/knowledgeBaseAction";
import { MODAL_TYPE } from "@/utils/enums";
import { openModal } from "@/utils/utility";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

function layoutOrgPage({ children, params }) {
  console.log(params)
  const dispatch = useDispatch();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const version_id = searchParams.get('version');
  const path = pathName.split('?')[0].split('/')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [isValidOrg, setIsValidOrg] = useState(true);
  const [loading, setLoading] = useState(true);
  const { embedToken, alertingEmbedToken, versionData, organizations, preTools } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    alertingEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.alerting_embed_token,
    versionData: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.apiCalls || {},
    organizations : state.userDetailsReducer.organizations,
    preTools: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.pre_tools || {}
  }));
  const urlParams = useParams();
  useEmbedScriptLoader(pathName.includes('bridges') ? embedToken : pathName.includes('alerts') ? alertingEmbedToken : '');
  const orgId=urlParams.org_id
   const isFirstBridgeCreation = useCustomSelector((state) =>
state.userDetailsReducer.userDetails?.c_companies?.find(c => c.id === Number(orgId))?.meta?.onboarding.bridgeCreation
 
);


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
    if (params.org_id && organizations) {
      validateOrg();
    }
  }, [params, organizations]);

  useEffect(() => {
    if (isValidOrg) {
      dispatch(getAllBridgesAction((data) => {
        if (data === 0&&!isFirstBridgeCreation) {
          openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
        }
        setLoading(false);
      }))
      dispatch(getAllFunctions())
    }
  }, [isValidOrg]);

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
    if (isValidOrg) {
      window.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
      };
    }
  }, [isValidOrg, params.id, versionData, version_id, path]);

  async function handleMessage(e) {
    if(e.data?.metadata?.type==='trigger') return;
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

  const isHomePage = useMemo(() => path?.length < 5, [path]);
  if (!isValidOrg) {
    return <ErrorPage></ErrorPage>;
  }
  if (isHomePage) {
    return (
      <div className="flex h-screen">
        <div className=" flex flex-col  h-full">
          <MainSlider />
        </div>
        <div className="flex-1 ml-8 lg:ml-0 overflow-y-auto overflow-x-hidden">
          <Navbar />
          {loading ? <LoadingSpinner /> :
            <main className="px-2">{children}</main>
          }
        </div>
        <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
      </div>
    );
  } else {
    return (
      <div className="h-screen">
        <Navbar />
        {loading ? <LoadingSpinner /> : children}
        <ChatDetails selectedItem={selectedItem} setIsSliderOpen={setIsSliderOpen} isSliderOpen={isSliderOpen} />
      </div>
    );
  }
}

export default Protected(layoutOrgPage);