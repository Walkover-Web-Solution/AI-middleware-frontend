"use client"
import React, { useEffect, useState } from 'react';
import { services } from "@/jsonFiles/models"; // Update 'yourFilePath' with the correct path to your file
import { useCustomSelector } from '@/customSelector/customSelector';
import { useSelector } from 'react-redux';
import { modelInfo } from '@/jsonFiles/modelConfiguration';

const DropdownMenu = ({ params }) => {
    const openaiData = services.openai;
    const { bridgeData } = useSelector((state) => ({
        bridgeData: state?.bridgeReducer?.allBridgesMap?.[params?.id] || {}
    }))


    const [toggle, setToggle] = useState(false)
    const [selectedService, setSelectedService] = useState('');
    const [selectedModel, setSelectedModel] = useState(bridgeData?.bridges?.configuration?.model?.default);
    const [modelInfoData, setModelInfoData] = useState(modelInfo[selectedService]?.[selectedModel] || bridgeData?.bridges?.configuration)

    useEffect(() => {
        setSelectedService(bridgeData?.bridges?.service?.toLowerCase());
        setSelectedModel(bridgeData?.bridges?.configuration?.model?.default)
        setModelInfoData(bridgeData?.bridges?.configuration)
    }, [bridgeData]);


    const handleService = (e) => {
        setSelectedService(e.target.value)
    }
    const handleModel = (e) => {
        setSelectedModel(e.target.value)
        setModelInfoData(modelInfo[selectedService][e?.target?.value.replaceAll("-", "_").replaceAll(".", "_")] || {});

    }

    const handleInputChange = (e, key) => {
        if (document.getElementById(key) && modelInfoData[key]?.field === "slider") document.getElementById(key).value = e.target.value;
        const updatedModelInfo = {
            ...modelInfoData,
            [key]: {
                ...modelInfoData[key],
                default: e.target.value
            }
        };
        setModelInfoData(updatedModelInfo);
    };
    const toggleAccordion = () => {
        setToggle(!toggle)
    }

    return (
        <div className='flex items-start h-full justify-start'>

            <div className='    w-1/5 h-full pr-2'>
                <label className="form-control w-full max-w-xs">
                    <div className="label">
                        <span className="label-text">Service</span>
                    </div>
                    <select value={selectedService} onChange={handleService} className="select select-bordered">
                        <option value="google">google</option>
                        <option value="openai">openai</option>
                    </select>
                </label>

                <label className="form-control w-full mb-2 max-w-xs">
                    <div className="label">
                        <span className="label-text">Pick a service</span>
                    </div>
                    <select value={selectedModel} onChange={handleModel} className="select select-bordered">
                        {Object.entries(services?.[selectedService] || {}).map(([group, options]) => (
                            group !== 'models' && // Exclude the 'models' group
                            <optgroup label={group}>
                                {[...options].map(option => (
                                    <option key={option}>{option}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </label>
                {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                    key !== 'model' && value.level !== 0 &&
                    <div className='mb-2'>

                        <div className='flex justify-between items-center w-full'>
                            <p className='capitalize'> {key.replaceAll("_", " ")}</p>
                            {value.field === 'slider' && <p>{typeof value.default === 'object' ? JSON.stringify(value) : value.default}</p>}
                        </div>
                        {value.field === "slider" ?
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
                            : value.field === 'text' ?
                                <input
                                    type="text"
                                    required={value?.level === 1 ? true : false}
                                    value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                    onChange={(e) => handleInputChange(e, key)}
                                    className="input input-bordered"
                                    name={key} // Add name attribute
                                />
                                : "hello"}

                    </div>
                ))}
                <div className="collapse collapse-arrow bg-base-200">
                    <input type="radio" name="my-accordion-2" checked={toggle} onClick={toggleAccordion} />
                    <div className="collapse-title text-xl font-medium">
                        Advanced Parameters
                    </div>
                    <div className="collapse-content">
                        {modelInfoData && Object.entries(modelInfoData || {}).map(([key, value]) => (
                            key !== 'model' && value.level === 0 &&
                            <>

                                <div className='flex justify-between items-center w-full'>
                                    <p className='capitalize'> {key.replaceAll("_", " ")}</p>``
                                    {value.field === 'slider' && <p>{typeof value.default === 'object' ? JSON.stringify(value) : value.default}</p>}
                                </div>
                                {value.field === "slider" ?
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
                                    : value.field === 'text' ?
                                        <input
                                            type="text"
                                            required={value?.level === 1 ? true : false}
                                            value={typeof value?.default === 'object' ? JSON.stringify(value?.default) : value?.default}
                                            onChange={(e) => handleInputChange(e, key)}
                                            className="input w-full input-bordered"
                                            name={key} // Add name attribute
                                        />
                                        : "hello"}

                            </>
                        ))}
                    </div>
                </div>


            </div>

            <div className="hero h-full w-full ">
                <div className="hero-content justify-between items-start max-w-full flex-col lg:flex-row">
                    <div>
                         <select className="select  select-ghost select-xs w-full max-w-xs">
                            <option disabled selected>Coder</option>
                            <option>System</option>
                            <option>Coder</option>
                            <option>User</option>
                            <option>Assisant    </option>
                        </select>
                        <input type="text" placeholder="Type here" className="input input-bordered input-md w-full max-w-xs" />
                    </div>
                    <div>
                    <div>
                        {/* chat block start */}
        <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-[85vh] border w-full">
            {/* chat end */}
          <div
            id="messages"
            className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
          >
            <div className="chat chat-start">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  />
                </div>
              </div>
              <div className="chat-header">
                Obi-Wan Kenobi
                <time className="text-xs opacity-50 pl-2"> 12:45</time>
              </div>
              <div className="chat-bubble">You were the Chosen One!</div>
              <div className="chat-footer opacity-50">Delivered</div>
            </div>
            <div className="chat chat-end">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="Tailwind CSS chat bubble component"
                    src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  />
                </div>
              </div>
              <div className="chat-header">
                Anakin
                <time className="text-xs opacity-50 pl-2">12:46</time>
              </div>
              <div className="chat-bubble">I hate you!</div>
              <div className="chat-footer opacity-50">Seen at 12:46</div>
            </div>
          </div>
          {/* chat end */}

          {/* ---------------------------------bottom----------------------------------- */}
          <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
            <div className="relative flex justify-center items-center">
              <div class="form-control">
                <div class="input-group flex gap-2">
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input input-bordered w-full max-w-xs"
                  />
                  <button class="btn">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-6 w-6 ml-2 transform rotate-90"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* -----------------------bottom end----------------------------------- */}
        </div>
      </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DropdownMenu;
