"use client"
import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useLayoutEffect } from "react"
import { createApiAction, getSingleBridgesAction, integrationAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import Sidebar from "@/components/Sidebar"

const Page = ({ params }) => {
  const dispatch = useDispatch()
  const { bridge, integrationData } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
    integrationData: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.integrationData?.flows
  }))

  useLayoutEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
  }, [params.id])

  useEffect(() => {
    const fetchData = async () => {
      const script = document.createElement("script");
      script.id = process.env.NEXT_PUBLIC_EMBED_SCRIPT_ID;
      script.src = process.env.NEXT_PUBLIC_EMBED_SCRIPT_SRC
      script.setAttribute("embedToken", bridge?.embed_token);
      document.body.appendChild(script);
    };


    fetchData();

    return () => {
      document.body.removeChild(document.getElementById("viasocket-embed-main-script"));
    };
  }, [params.id, dispatch, bridge?.embed_token]);

  window.addEventListener("message", (e) => {
    if (e.data.webhookurl) {
      dispatch(integrationAction(bridge?.embed_token, params.id))
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

  });

  // console.log(bridge, "bridge")
  // const dummyjson = modelInfo?.[bridge?.service]?.[bridge?.configuration?.model?.default]
  // console.log(dummyjson, "dummyjson")


  // const updatedObj1 = bridge

  // // Iterate over the keys of dummyjson.configuration
  // for (const key in dummyjson?.configuration) {
  //   if (dummyjson?.configuration.hasOwnProperty(key)) {
  //     // Check if the key exists in bridge.configuration
  //     if (updatedObj1.configuration.hasOwnProperty(key)) {
  //       // If the key exists, delete it from bridge.configuration
  //       delete updatedObj1.configuration[key];
  //     }
  //   }
  // }
  // console.log(updatedObj1, "updatedObj1")
  // // Remove the configuration fields present in updatedObj1 from bridge
  // for (const key in updatedObj1?.configuration) {
  //   if (updatedObj1.configuration.hasOwnProperty(key)) {
  //     delete bridge.configuration[key];
  //   }
  // }

  // console.log(bridge, "new Data to send ");


  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full m-4 ">
            <DropdownMenu data={bridge} params={params} embed={integrationData} />
          </div>
        </div>
      </div>
      <Sidebar orgid={params.org_id} />
    </div>
  );
}

export default Protected(Page);
