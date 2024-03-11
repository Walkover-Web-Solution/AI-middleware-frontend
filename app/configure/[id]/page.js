"use client"

import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useState } from "react"
import { getSingleBridgesAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import Playground from "@/components/playground"
import Chat from "@/components/chat"
import { usePathname, useRouter } from "next/navigation"
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)"
import Sidebar from "@/components/Sidebar"



function Page({ params }) {
  const path = usePathname()
  const route = useRouter()
  const dispatch = useDispatch()

  const { bridge, bridgeService, bridgeConfigration } = useCustomSelector((state) => ({
    bridgeService: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges?.service,
    bridgeConfigration: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges?.configuration,
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id]
  }))

  const [modelInfoClone, setModelInfoClone] = useState(modelInfo)


  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
    setModelInfoClone(modelInfo[bridgeService])
  }, [params.id, bridgeService, bridgeConfigration, modelInfoClone]);

  let configrationData
  if (modelInfoClone) {
    configrationData = Object.values(modelInfoClone)[0]

    // Check if bridgeConfigration is not null before iterating over its keys
    if (bridgeConfigration && configrationData && configrationData.configuration) {
      Object.keys(bridgeConfigration).forEach(key => {
        if (configrationData.configuration.hasOwnProperty(key)) {
          
          configrationData.configuration[key].default = bridgeConfigration[key]?.default;
        }
        if(key==="prompt"){
          bridgeConfigration.prompt.forEach(obj => {
            configrationData.inputConfig[obj["role"]].default[configrationData.inputConfig[obj["role"]].contentKey]=obj[configrationData.inputConfig[obj["role"]].contentKey] ?? "";
          });
        }
      });
    }
  }



  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex pl-2 flex-col items-start justify-start">
        {/* Page content here */}
        {/* <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label> */}
        {/* <h1 className="text-2xl font-bold capitalize pb-2">{bridgeData?.bridges?.name}</h1> */}
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">
            <DropdownMenu data={configrationData} params={params} />
          </div>
        </div>

      </div>
     
       <Sidebar/>

    </div>
  )
}
export default Protected(Page)

