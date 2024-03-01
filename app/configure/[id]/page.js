"use client"
// eslint-disable
import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useState } from "react"
import { getSingleBridgesAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
import Chat from "@/components/chat"
import { usePathname, useRouter } from "next/navigation"
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)"



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
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-50   min-h-full bg-base-200 text-base-content">
          {/* Sidebar content here */}
          <li><button className={path === "/bridges" ? "btn-active" : ""} onClick={() => route.push("/bridges")} >Bridges </button></li>
          <li><button className={path === "/apikey" ? "btn-active" : ""} onClick={() => route.push("/apikey")}>Api key</button></li>
        </ul>

      </div>
    </div>
  )
}
export default Protected(Page)

