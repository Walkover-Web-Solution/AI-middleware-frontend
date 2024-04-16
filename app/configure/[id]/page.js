"use client"

import Protected from "@/components/protected"
import { useCustomSelector } from "@/customSelector/customSelector"
import DropdownMenu from "@/components/dropDown"
import { useEffect, useState } from "react"
import { getSingleBridgesAction } from "@/store/action/bridgeAction"
import { useDispatch } from "react-redux"
// import { usePathname, useRouter } from "next/navigation"
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)"
import Sidebar from "@/components/Sidebar"

/**
 * This page is for configuring a single bridge.
 * This page renders the drop down menu component which displays
 * the configuration of the selected bridge.
 */
const Page = ({ params }) => {
  // Get the redux store's dispatch function
  const dispatch = useDispatch()
  // Get the data for the selected bridge from the store
  const { bridge, bridgeService, bridgeConfigration } = useCustomSelector((state) => ({
    bridgeService: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges?.service,
    bridgeConfigration: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.bridges?.configuration,
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id]
  }))

  // Create a clone of the modelInfo object which will be mutated
  // to display the selected bridge's configuration
  const [modelInfoClone, setModelInfoClone] = useState(modelInfo)


  // Fetch the data for the selected bridge from the server on mount
  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
  }, [params.id])

  // Update the modelInfoClone on mount and when the bridgeService or 
  // bridgeConfigration changes, this ensures that the correct data
  // is displayed for the selected bridge
  useEffect(() => {
    setModelInfoClone(modelInfo[bridgeService])
  }, [params.id, bridgeService, bridgeConfigration, modelInfoClone])

  // Get the configuration data for the selected bridge
  let configrationData
  if (modelInfoClone) {
    configrationData = Object.values(modelInfoClone)[0]
    // Check if bridgeConfigration is not null before iterating over its keys
    if (bridgeConfigration && configrationData && configrationData.configuration) {
      // Iterate over the keys in bridgeConfigration and update the default
      // value of the corresponding configuration key in configrationData
      Object.keys(bridgeConfigration).forEach(key => {
        if (configrationData.configuration.hasOwnProperty(key)) {

          configrationData.configuration[key].default = bridgeConfigration[key]?.default;
        }
        // If the key is "prompt" and the bridgeService is "openai", then iterate
        // over the prompt array and update the default value of the contentKey
        // for the corresponding role in configrationData
        if (key === "prompt" && bridgeService === 'openai') {
          bridgeConfigration.prompt.forEach(obj => {
            configrationData.inputConfig[obj["role"]].default[configrationData.inputConfig[obj["role"]].contentKey] = obj[configrationData.inputConfig[obj["role"]].contentKey] ?? "";
          });
        }
      });
    }
  }



  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col items-start justify-start">
        {/* Page content here */}
        {/* <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label> */}
        {/* <h1 className="text-2xl font-bold capitalize pb-2">{bridgeData?.bridges?.name}</h1> */}
        <div className="flex w-full justify-start gap-16 items-start">
          <div className="w-full">
            <DropdownMenu data={configrationData} params={params} />
          </div>
        </div>

      </div>

      <Sidebar />

    </div>
  )
}

export default Protected(Page)

