"use client";
import React, { useEffect, useState } from "react";
import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file
import { useCustomSelector } from "@/customSelector/customSelector";
import { useSelector } from "react-redux";
import { modelInfo } from "@/jsonFiles/modelConfiguration";
import Chat from "./chat";
import axios from "axios"

const DropdownMenu = ({ params }) => {
  const openaiData = services.openai;
  const { bridgeData } = useSelector((state) => ({
    bridgeData: state?.bridgeReducer?.allBridgesMap?.[params?.id] || {},
  }));

  const [toggle, setToggle] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    bridgeData?.bridges?.configuration?.model?.default
  );
  const [modelInfoData, setModelInfoData] = useState(
    modelInfo[selectedService]?.[selectedModel] ||
      bridgeData?.bridges?.configuration
  );

  useEffect(() => {
    setSelectedService(bridgeData?.bridges?.service?.toLowerCase());
    setSelectedModel(bridgeData?.bridges?.configuration?.model?.default);
    setModelInfoData(bridgeData?.bridges?.configuration);
  }, [bridgeData]);

  const handleService = (e) => {
    setSelectedService(e.target.value);
  };
  const handleModel = (e) => {
    setSelectedModel(e.target.value);
    setModelInfoData(
      modelInfo[selectedService][
        e?.target?.value.replaceAll("-", "_").replaceAll(".", "_")
      ] || {}
    );
  };

  const handleInputChange = (e, key) => {
    if (document.getElementById(key) && modelInfoData[key]?.field === "slider")
      document.getElementById(key).value = e.target.value;
    const updatedModelInfo = {
      ...modelInfoData,
      [key]: {
        ...modelInfoData[key],
        default: e.target.value,
      },
    };
    setModelInfoData(updatedModelInfo);
  };
  const toggleAccordion = () => {
    setToggle(!toggle);
  };

  return (
    <div className="flex items-start h-full justify-start overflow-hidden">
      <div className="    w-1/5 h-full pr-2">
        <label className="form-control w-full max-w-xs">
          <div className="label">
            <span className="label-text">Service</span>
          </div>
          <select
            value={selectedService}
            onChange={handleService}
            className="select select-bordered"
          >
            <option value="google">google</option>
            <option value="openai">openai</option>
          </select>
        </label>

        <label className="form-control w-full mb-2 max-w-xs">
          <div className="label">
            <span className="label-text">Pick a service</span>
          </div>
          <select
            value={selectedModel}
            onChange={handleModel}
            className="select select-bordered"
          >
            {Object.entries(services?.[selectedService] || {}).map(
              ([group, options]) =>
                group !== "models" && ( // Exclude the 'models' group
                  <optgroup label={group}>
                    {[...options].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </optgroup>
                )
            )}
          </select>
        </label>
        {modelInfoData &&
          Object.entries(modelInfoData || {}).map(
            ([key, value]) =>
              key !== "model" &&
              value.level !== 0 && (
                <div className="mb-2">
                  <div className="flex justify-between items-center w-full">
                    <p className="capitalize"> {key.replaceAll("_", " ")}</p>
                    {value.field === "slider" && (
                      <p>
                        {typeof value.default === "object"
                          ? JSON.stringify(value)
                          : value.default}
                      </p>
                    )}
                  </div>
                  {value.field === "slider" ? (
                    <input
                      id={key} // Add this id attribute
                      type="range"
                      min={value?.min}
                      max={value?.max}
                      step={value?.step}
                      value={value?.default}
                      onChange={(e) => handleInputChange(e, key)}
                      className="range range-xs"
                      name={key} // Add name attribute
                    />
                  ) : value.field === "text" ? (
                    <input
                      type="text"
                      required={value?.level === 1 ? true : false}
                      value={
                        typeof value?.default === "object"
                          ? JSON.stringify(value?.default)
                          : value?.default
                      }
                      onChange={(e) => handleInputChange(e, key)}
                      className="input input-bordered"
                      name={key} // Add name attribute
                    />
                  ) : (
                    "hello"
                  )}
                </div>
              )
          )}
        <div className="collapse collapse-arrow bg-base-200">
          <input
            type="radio"
            name="my-accordion-2"
            checked={toggle}
            onClick={toggleAccordion}
          />
          <div className="collapse-title text-xl font-medium">
            Advanced Parameters
          </div>
          <div className="collapse-content">
            {modelInfoData &&
              Object.entries(modelInfoData || {}).map(
                ([key, value]) =>
                  key !== "model" &&
                  value.level === 0 && (
                    <>
                      <div className="flex justify-between items-center w-full">
                        <p className="capitalize">
                          {" "}
                          {key.replaceAll("_", " ")}
                        </p>
                        ``
                        {value.field === "slider" && (
                          <p>
                            {typeof value.default === "object"
                              ? JSON.stringify(value)
                              : value.default}
                          </p>
                        )}
                      </div>
                      {value.field === "slider" ? (
                        <input
                          id={key} // Add this id attribute
                          type="range"
                          min={value?.min}
                          max={value?.max}
                          step={value?.step}
                          value={value?.default}
                          onChange={(e) => handleInputChange(e, key)}
                          className="range range-xs w-full"
                          name={key} // Add name attribute
                        />
                      ) : value.field === "text" ? (
                        <input
                          type="text"
                          required={value?.level === 1 ? true : false}
                          value={
                            typeof value?.default === "object"
                              ? JSON.stringify(value?.default)
                              : value?.default
                          }
                          onChange={(e) => handleInputChange(e, key)}
                          className="input w-full input-bordered"
                          name={key} // Add name attribute
                        />
                      ) : (
                        "hello"
                      )}
                    </>
                  )
              )}
          </div>
        </div>
      </div>

      {/* bookmark  justify-between items-center */}
      <div className="hero justify-between items-center h-full w-3/4  ">
        <div className="hero-content justify-start items-start max-w-full flex-col lg:flex-row">
          <div>
            <select className="select  select-ghost select-xs w-full max-w-xs">
              <option disabled selected>
                Coder
              </option>
              <option>System</option>
              <option>Coder</option>
              <option>User</option>
              <option>Assisant </option>
            </select>
            <input
              type="text"
              placeholder="Type here"
              className="input input-bordered input-md w-full max-w-xs"
            />
          </div>

          <div className=" flex w-full">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DropdownMenu;
