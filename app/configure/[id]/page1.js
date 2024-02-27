"use client"
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customSelector/customSelector'
import { getSingleBridgesAction } from '@/store/action/bridgeAction'
import { getModelAction } from '@/store/action/modelAction'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import _ from 'lodash'

function Page({ params }) {
  const dispatch = useDispatch()

  const bridgeData = useCustomSelector((state) => state.bridgeReducer.allBridgesMap?.[params?.id]);
  const [selectedModel, setSelectedModel] = useState(bridgeData?.bridges?.configuration?.model);
  // const { modelData, modelInfo } = useCustomSelector((state) => ({
  //   modelData: state?.modelReducer?.model,
  //   modelInfo: state?.modelReducer?.modelInfo?.[(selectedModel || state.bridgeReducer.allBridgesMap?.[params?.id]?.configuration?.model)?.replaceAll("-", "_")?.replaceAll(".", "_")]
  // }));
  const [cloneModelInfo, setCloneModelInfo] = useState({});

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
  };

  useEffect(() => {
    dispatch(getSingleBridgesAction(params.id));
    dispatch(getModelAction());
    setCloneModelInfo({ ...modelInfo });
  }, [modelInfo]);

  const handleInputChange = (e, key) => {
    if (document.getElementById(key) && cloneModelInfo[key]?.field === "slider") document.getElementById(key).value = e.target.value;
    const updatedModelInfo = {
      ...cloneModelInfo,
      [key]: {
        ...cloneModelInfo[key],
        default: e.target.value
      }
    };
      setCloneModelInfo(updatedModelInfo);

    // Update the range input value
  };

  

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="drawer lg:drawer-open">
        <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col items-center justify-center">
          <label htmlFor="my-drawer-2" className="btn btn-primary drawer-button lg:hidden">Open drawer</label>

        </div>
        <div className="drawer-side w-9">
          <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
            <details className="collapse bg-base-200">
              <summary className="collapse-title text-xl font-medium">Parameters</summary>
              <div className="collapse-content">
                {/* <form onSubmit={handleSubmit}> */}
                  <div>
                    <p>Foundation Model</p>
                    <select
                      className="select select-bordered w-full max-w-xs"
                      value={selectedModel}
                      onChange={handleModelChange}
                      name="selectedModel" // Add name attribute
                    >
                      <option disabled selected> {bridgeData?.configuration?.model || "select model"} </option>
                      {modelData && modelData.map((item) => (<option key={item} value={item}>{item}</option>))}
                    </select>
                  </div>

                  <div>
                    {modelInfo && Object.keys(modelInfo).map((key) => (
                      <div className="flex flex-col gap-5" key={key}>
                        <div className="flex justify-between">
                          <p>{key}</p>
                          <p>{typeof cloneModelInfo[key]?.default === 'object' ? JSON.stringify(cloneModelInfo[key]?.default) : cloneModelInfo[key]?.default}</p>
                        </div>
                        {cloneModelInfo[key]?.field === "slider" ?
                          <input
                            id={key} // Add this id attribute
                            type="range"
                            min={cloneModelInfo[key]?.min}
                            max={cloneModelInfo[key]?.max}
                            step={cloneModelInfo[key]?.step}
                            value={cloneModelInfo[key]?.default}
                            onChange={(e) => handleInputChange(e, key)}
                            className="range range-xs"
                            name={key} // Add name attribute
                          />
                          : cloneModelInfo[key]?.field === 'text' || 'drop' ?
                            <input
                              type="text"
                              required={cloneModelInfo[key]?.level === 1 ? true : false}
                              value={typeof cloneModelInfo[key]?.default === 'object' ? JSON.stringify(cloneModelInfo[key]?.default) : cloneModelInfo[key]?.default}
                              onChange={(e) => handleInputChange(e, key)}
                              className="input input-bordered"
                              name={key} // Add name attribute
                            /> : "hello"
                        }
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSubmit}>Submit</button>
                {/* </form> */}
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Protected(Page)
