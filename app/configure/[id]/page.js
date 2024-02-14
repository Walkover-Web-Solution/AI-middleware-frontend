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
  const modelData = useCustomSelector((state) => state.modelReducer.model);

  console.log(modelData, bridgeData, "bridgeData", "modelData")

  useEffect(() => {
    // (async () =>{ const data =  await getSingleBridge(params.id)})()
    dispatch(getSingleBridgesAction(params.id))
    dispatch(getModelAction())
  }, [])
  const [openAccordionIndex, setOpenAccordionIndex] = useState(0);

  const handleAccordionToggle = (index) => {
    setOpenAccordionIndex(index === openAccordionIndex ? -1 : index);
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
          <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <li onClick={() => handleAccordionToggle(0)} className="collapse collapse-plus bg-base-200">
              <input type="radio" name="my-accordion-3" checked={openAccordionIndex === 0} />
              <div className="collapse-title text-xl font-medium">
                Parameters
              </div>
              <div onClick={(e) => e.stopPropagation()} className="collapse-content">
                <select className="select select-bordered w-full max-w-xs">
                  <option disabled selected>Who shot first?</option>
                  <option>Han Solo</option>
                  <option>Greedo</option>
                </select>
              </div>
            </li>
            <li onClick={() => handleAccordionToggle(1)} className="collapse collapse-plus bg-base-200">
              <input type="radio" name="my-accordion-3" checked={openAccordionIndex === 1} />
              <div className="collapse-title text-xl font-medium">
                Advanced Parameters
              </div>
              <div className="collapse-content">
                <p>hello</p>
              </div>
            </li>

          </ul>

        </div>
      </div>
      {/* <button onClick={()=> dispatch(getModelAction())}>get Models</button> */}
      <button onClick={() => dispatch(dryRunAction())}>Dry Run </button>
    </div>
  )
}

