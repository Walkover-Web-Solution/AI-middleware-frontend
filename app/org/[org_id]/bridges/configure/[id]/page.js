"use client"
import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useLayoutEffect } from "react"
import { createApiAction, getSingleBridgesAction, integrationAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"

const Page = ({ params }) => {
  const dispatch = useDispatch()
  const { bridge, integrationData, embedToken } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    embedToken: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.embed_token,
    integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData?.flows,
  }))
  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
  }, [params.id])

  useEffect(() => {
    if (embedToken) {
      const fetchData = async () => {
        const script = document.createElement("script");
        script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
        script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC
        script.setAttribute("embedToken", embedToken);
        document.body.appendChild(script);
      };
      fetchData();
      // embedToken && fetchData();
      return () => {
        document.body.removeChild(document.getElementById("viasocket-embed-main-script"));
      };
    }
  }, [params.id, embedToken]);

  useEffect(() => {
    function handleMessage(e) {
      if (e.data.webhookurl) {
        dispatch(integrationAction(embedToken, params.id))
        if (e.data.action === "published" || e.data.action === "created" && e.data.description.length > 0) {
          const dataFromEmbed = {
            "url": e.data.webhookurl,
            "payload": e.data.payload,
            "desc": e.data.description,
            "id": e.data.id,
            "status": e.data.action
          }

          dispatch(createApiAction(params.id, dataFromEmbed))
        }
      }
    }
    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, []);

  return (

    <>
      {!bridge && <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-filter backdrop-blur-lg flex justify-center items-center z-50">
        <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="flex items-center justify-center space-x-2">
            {/* Tailwind CSS Spinner */}
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xl font-medium text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
      }
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-start justify-start">
          <div className="flex w-full justify-start gap-16 items-start">
            <div className="w-full ">
              <DropdownMenu data={bridge} params={params} embed={integrationData} />
            </div>
          </div>
        </div>
        {/* <Sidebar orgid={params.org_id} /> */}
      </div>
    </>
  );
}

export default Protected(Page);
