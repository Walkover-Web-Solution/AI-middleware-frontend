"use client";
import ChatDetails from "@/components/historyPageComponents/chatDetails";
import LoadingSpinner from "@/components/loadingSpinner";
import Navbar from "@/components/navbar";
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

export default function layoutOrgPage({ children, params }) {
  const dispatch = useDispatch();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const version_id = searchParams.get('version');
  const path = pathName.split('?')[0].split('/')
  const [selectedItem, setSelectedItem] = useState(null)
  const [isSliderOpen, setIsSliderOpen] = useState(false)
  const [loading, setLoading] = useState(true);
  const { embedToken, alertingEmbedToken, versionData, preTools } = useCustomSelector((state) => ({
    embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    alertingEmbedToken: state?.bridgeReducer?.org?.[params?.org_id]?.alerting_embed_token,
    versionData: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.apiCalls || {},
    preTools: state?.bridgeReducer?.bridgeVersionMapping?.[path[5]]?.[version_id]?.pre_tools || {}
  }));
  const urlParams = useParams();
  useEmbedScriptLoader(pathName.includes('bridges') ? embedToken : pathName.includes('alerts') ? alertingEmbedToken : '');

  useEffect(() => {
    dispatch(getAllBridgesAction((data) => {
      if (data === 0) {
        openModal(MODAL_TYPE.CREATE_BRIDGE_MODAL)
      }
      setLoading(false);
    }))
    dispatch(getAllFunctions())
  }, []);

  useEffect(() => {
    if (params?.org_id) {
      dispatch(getAllApikeyAction(params?.org_id));
      dispatch(getAllKnowBaseDataAction(params?.org_id))
      dispatch(getPrebuiltToolsAction())
    }
  }, [dispatch, params?.org_id]);

  const scriptId = "chatbot-main-script";
  const scriptSrc = process.env.NEXT_PUBLIC_CHATBOT_SCRIPT_SRC;

  useEffect(() => {

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
  }, []);


  useEffect(() => {
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [params.id, versionData, version_id, path]);

  async function handleMessage(e) {
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
          if (!versionData?.[data?._id] && !preTools?.includes(data?._id)) {
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