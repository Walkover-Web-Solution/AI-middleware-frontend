"use client"
import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useState } from "react"
import { getSingleBridgesAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)"
import Sidebar from "@/components/Sidebar"
import axios from "axios"
import { method } from "lodash"

const Page = ({ params }) => {
  const dispatch = useDispatch()
  const { bridge } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges
  }))

  const [modelInfoClone, setModelInfoClone] = useState(modelInfo)
  const [intregrationData, setIntregationData] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(getSingleBridgesAction(params.id));
        const script = document.createElement("script");
        script.id = "viasocket-embed-main-script";
        script.src = "https://embed.viasocket.com/test-embedcomponent.js";
        script.setAttribute("embedToken", bridge?.embed_token);
        document.body.appendChild(script);

        const response = await axios({url:"https://dev-api.viasocket.com/projects/projXzlaXL3n/integrations", 
          headers: {
            authorization: bridge?.embed_token 
          },
          method:"get"
        });
        setIntregationData(response.data);
      } catch (error) {
        console.error("Error fetching integration data:", error);
      }
    };

    fetchData();

    return () => {
      document.body.removeChild(document.getElementById("viasocket-embed-main-script"));
    };
  }, [params.id, dispatch, bridge]);

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
