"use client"
import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useLayoutEffect, useState } from "react"
import { getSingleBridgesAction, integrationAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import Sidebar from "@/components/Sidebar"

const Page = ({ params }) => {
  const dispatch = useDispatch()
  const { bridge } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges
  }))


  useLayoutEffect(() => {
    dispatch(getSingleBridgesAction(params.id)); 
  }, [params.id])

  useEffect(() => {
    const fetchData = async () => {
        const script = document.createElement("script");
        script.id = "viasocket-embed-main-script";
        script.src = "https://embed.viasocket.com/test-embedcomponent.js";
        script.setAttribute("embedToken", bridge?.embed_token);
        document.body.appendChild(script);
    };

    dispatch(integrationAction(bridge?.embed_token , params.id))

    fetchData();

    return () => {
      document.body.removeChild(document.getElementById("viasocket-embed-main-script"));
    };
  }, [params.id, dispatch, bridge ,  bridge?.embed_token]);

  window.addEventListener("message", (e) => {
    console.log(e);
  });



  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-start justify-start">
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">
            <button className="btn" onClick={() => window.openViasocket()}>Api Docs</button>
            <DropdownMenu data={bridge} params={params} />
          </div>
        </div>
      </div>
      <Sidebar />
    </div>
  );
}

export default Protected(Page);
