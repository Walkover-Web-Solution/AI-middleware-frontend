"use client"

import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getSingleBridgesAction } from '@/store/action/bridgeAction'
import { getModelAction } from '@/store/action/modelAction'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'


function page({ params }) {

  const dispatch = useDispatch()





  // const [openAccordionIndex, setOpenAccordionIndex] = useState(0);

  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap?.[params?.id]);
  
  const [selectedModel, setSelectedModel] = useState(bridgeData?.configuration?.model); // State to store the selected model
  
  
  const { modelData, modelInfo } = useCustomSelector(
    (state) => ({
      modelData: state?.modelReducer?.model,
      modelInfo: state?.modelReducer?.modelInfo?.[(selectedModel || state.bridgeReducer.allBridgesMap?.[params?.id]?.configuration?.model)?.replaceAll("-", "_")?.replaceAll(".", "_")]
    })
    )
    
    // const [temp, setTemp] = useState(Number(bridgeData?.configuration?.temperature || modelInfo?.temperature[0]))
    // const [maxTokens, setMaxTokens] = useState(modelInfo?.max_tokens[0]);
    
    console.log(modelInfo , "modelInfo")

  const handleModelChange = (e) => {
    console.log(e.target.value)
    setSelectedModel(e.target.value); // Update the state with the selected model
  };

  // const handleTempChange = (e) => {
  //   console.log(e.target.value)
  //   setTemp(e.target.value)
  // }
  // const handleMaxTokenChanges = (e) => {
  //   console.log(e.target.value)
  //   setMaxTokens(e.target.value)
  // }


  // const handleAccordionToggle = (index) => {
  //   setOpenAccordionIndex(index === openAccordionIndex ? -1 : index);
  // };

  useEffect(() => {
    // (async () =>{ const data =  await getSingleBridge(params.id)})()
    dispatch(getSingleBridgesAction(params.id))
    dispatch(getModelAction())
    // setMaxTokens(modelInfo?.max_tokens[0])
  }, [modelInfo])

  // console.log(bridgeData, "bridgeData", modelData, "modelData ", modelInfo, " modelInfo ", modelInfo, "modelInfo", typeof temp, "temp", bridgeData?.configuration?.temperature)

  return (
    <div>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>

        </div>
        <div className="drawer-side w-9">
          <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <details className="collapse bg-base-200">
              <summary className="collapse-title text-xl font-medium">Parameters</summary>
              <div className="collapse-content">
                <div>
                  <p>Foundation Model</p>
                  <select className="select select-bordered w-full max-w-xs" value={selectedModel} onChange={handleModelChange} >
                    <option disabled selected> {bridgeData?.configuration?.model || "select model"} </option>
                    {modelData && modelData?.map((item) => (<option key={item} value={item}>{item}</option>))}
                  </select>
                </div>

                <div>
                  {modelInfo && Object.keys(modelInfo).map((key) => (
                    <div className="flex flex-col gap-5" key={key}>
                      <div className="flex justify-between">
                        <p>{key}</p>
                        <p>{modelInfo[key][0]}</p> {/* Display the value using the zero index */}
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={modelInfo[key][1]} // Use the second index as max value
                        step={0.1}
                        value={bridgeData?.configuration?.temperature || modelInfo[key][0]} // Use the zero index as default value
                        onChange={(e) => handleInputChange(e, key)} // Pass the key for identification
                        className="range range-xs"
                      />
                    </div>
                  ))}
                </div>




                {/* <div className="flex flex-col gap-5">
                  <div className="flex justify-between"><p>Temperature</p> <p>{temp || modelInfo?.temperature[0]}</p></div>
                  <input type="range" min={0} max={2} step={0.1} value={(temp)} onChange={handleTempChange} className="range range-xs" />
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex justify-between"><p>Maximum tokens </p> <p>{maxTokens || modelInfo?.max_tokens[0]}</p></div>
                  <input type="range" min={0} max={4097} step={1} value={maxTokens} onChange={handleMaxTokenChanges} className="range range-xs" />
                </div> */}

              </div>
            </details>
            {/* <details className="collapse bg-base-200">
              <summary className="collapse-title text-xl font-medium">
                Advanced Parameters</summary>
              <div className="collapse-content">
       
                  <div>
                    <p>Foundation Model</p>
                    <select className="select select-bordered w-full max-w-xs" value={selectedModel} onChange={handleModelChange} >
                      <option disabled selected> {bridgeData?.configuration?.model || "select model"} </option>
                      {modelData && modelData?.map((item) => (<option key={item} value={item}>{item}</option>))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between"><p>Temperature</p> <p>{temp || modelInfo?.temperature[0]}</p></div>
                    <input type="range" min={0} max={2} step={0.1} value={(temp)} onChange={handleTempChange} className="range range-xs" />
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="flex justify-between"><p>Maximum tokens </p> <p>{maxTokens || modelInfo?.max_tokens[0]}</p></div>
                    <input type="range" min={0} max={4097} step={1} value={maxTokens} onChange={handleMaxTokenChanges} className="range range-xs" />
                  </div>

              </div>
            </details>
            */}
          </div>

        </div>
      </div>
    </div>
  )
}
export default Protected(page)
