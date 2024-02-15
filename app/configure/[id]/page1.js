"use client"

// import { getSingleBridge } from '@/api'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getSingleBridgesAction } from '@/store/action/bridgeAction'
import { dryRunAction } from '@/store/action/dryRunAction'
import { getModelAction } from '@/store/action/modelAction'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'


export default function page({ params }) {

  
  const dispatch = useDispatch();
  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap?.[params?.id]);
  const temperature = useCustomSelector((state) => state.bridgeReducer.allBridgesMap?.[params?.id]?.configuration?.temperature  );
  const [selectedModel, setSelectedModel] = useState(bridgeData?.configuration?.temperature); // State to store the selected model
  const modelInfo = useCustomSelector((state) => state.modelReducer.modelInfo)?.[selectedModel?.replaceAll("-", "_")?.replaceAll(".", "_")]
  const modelData = useCustomSelector((state) => state.modelReducer.model);
  const [range, setRange] = useState(temperature)

  console.log(modelData, bridgeData, bridgeData?.configuration?.temperature , selectedModel  , modelInfo ,  "bridgeData", "modelData")

  useEffect(() => {
    // (async () =>{ const data =  await getSingleBridge(params.id)})()
    dispatch(getSingleBridgesAction(params.id))
    dispatch(getModelAction())
  }, [])


  const [openAccordionIndex, setOpenAccordionIndex] = useState(0);

  const handleAccordionToggle = (index) => {
    setOpenAccordionIndex(index === openAccordionIndex ? -1 : index);
  };

  const handleRangeChange = (e) => {
    console.log(e.target.value)
    setRange(e.target.value)
  }



  const handleModelChange = (e) => {
    console.log(e.target.value)
    setSelectedModel(e.target.value); // Update the state with the selected model
  };

  return (
    <div>
      <div className="drawer  lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          {/* Page content here */}
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>

        </div>
        <div className="drawer-side w-9">
          <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <div onClick={() => handleAccordionToggle(0)} className="collapse collapse-plus bg-base-200">
              <input type="radio" name="my-accordion-3" checked={openAccordionIndex === 0} />
              <div className="collapse-title text-xl font-medium">
                Parameters
              </div>
              <div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-5 collapse-content">
                <div>
                  <p>Foundation Model</p>
                  <select className="select select-bordered w-full max-w-xs"  value={selectedModel} onChange={handleModelChange} >
                    <option disabled selected> {bridgeData?.configuration?.model || "select model"} </option>
                    {modelData && modelData?.map((item) => (<option key={item} value={item}>{item}</option>))}
                  </select>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex justify-between"><p>Temperature</p> <p>{range || temperature}</p></div>
                  <input type="range" min={0} max={2} step={0.1} value={range} onChange={handleRangeChange} className="range range-xs" />
                </div>
              </div>
            </div>
            <div onClick={() => handleAccordionToggle(1)} className="collapse collapse-plus bg-base-200">
              <input type="radio" name="my-accordion-3" checked={openAccordionIndex === 1} />
              <div className="collapse-title text-xl font-medium">
                Advanced Parameters
              </div>
              <div className="collapse-content">
                <p>hello</p>
              </div>
            </div>

          </div>

        </div>
      </div>
      {/* <button onClick={()=> dispatch(getModelAction())}>get Models</button> */}
      <button onClick={() => dispatch(dryRunAction())}>Dry Run </button>
    </div>
  )
}

