import { useCustomSelector } from '@/customHooks/customSelector';
import { ADVANCED_BRIDGE_PARAMETERS, KEYS_NOT_TO_DISPLAY } from '@/jsonFiles/bridgeParameter';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE, ONBOARDING_VIDEOS } from '@/utils/enums';
import { generateRandomID, openModal } from '@/utils/utility';
import { ChevronDownIcon, ChevronUpIcon, InfoIcon } from '@/components/Icons';
import JsonSchemaModal from "@/components/modals/JsonSchemaModal";
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import InfoTooltip from '@/components/InfoTooltip';

const AdvancedParameters = ({ params }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [objectFieldValue, setObjectFieldValue] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const [messages, setMessages] = useState([]);
  const thread_id = useMemo(() => generateRandomID(), []);
  const dispatch = useDispatch();

  const { service, version_function_data, configuration, integrationData, isFirstParameter } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    const integrationData = state?.bridgeReducer?.org?.[params?.org_id]?.integrationData || {};
    const user = state.userDetailsReducer.userDetails
    return {
      version_function_data: versionData?.apiCalls,
      integrationData,
      service: versionData?.service,
      configuration: versionData?.configuration,
      isFirstParameter: user?.meta?.onboarding?.AdvanceParameter
    };
  });
  const [inputConfiguration, setInputConfiguration] = useState(configuration);
  const { tool_choice: tool_choice_data, type, model } = configuration || {};
  const { modelInfoData } = useCustomSelector((state) => ({
    modelInfoData: state?.modelReducer?.serviceModels?.[service]?.[type]?.[configuration?.model]?.configuration?.additional_parameters,
  }));

  const handleTutorial = () => {
    setTutorialState(prev => ({
      ...prev,
      showSuggestion: isFirstParameter

    }))
  };

  useEffect(() => {
    setObjectFieldValue(configuration?.response_type?.json_schema ? JSON.stringify(configuration?.response_type?.json_schema, undefined, 4) : null);
  }, [configuration?.response_type?.json_schema]);

  useEffect(() => {
    if (tool_choice_data === "auto" || tool_choice_data === "none" || tool_choice_data === "default" || tool_choice_data === "required") {
      setSelectedOptions([{ name: tool_choice_data === "default" ? "auto" : tool_choice_data, id: tool_choice_data === "default" ? "auto" : tool_choice_data }])
      return
    }
    const selectedFunctiondata = version_function_data && typeof version_function_data === 'object'
      ? Object.values(version_function_data)
        .filter(value => {
          const toolChoice = typeof tool_choice_data === 'string' ? tool_choice_data : '';
          return toolChoice === value?._id;
        })
        .map(value => ({
          name: value?.function_name || value?.endpoint_name,
          id: value?._id
        }))
      : [];
    setSelectedOptions(selectedFunctiondata);
  }, [tool_choice_data])

  const handleInputChange = (e, key, isSlider = false) => {
    setInputConfiguration((prev) => ({
      ...prev,
      [key]: e.target.value,
    }))
    let newValue = e.target.value;
    let newCheckedValue = e.target.checked;
    if (e.target.type === 'number') {
      newValue = String(newValue)?.includes('.') ? parseFloat(newValue) : parseInt(newValue, 10);
    }
    let updatedDataToSend = {
      configuration: {
        [key]: isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue,
      }
    };
    if ((isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue) !== configuration?.[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: { ...updatedDataToSend } }));
    }
  };

  const handleSelectChange = (e, key, defaultValue, Objectvalue = {}, isDeafaultObject = true) => {
    let newValue;
    try {
      if (Objectvalue && !JSON.parse(Objectvalue)) {
        toast.error("Invalid JSON provided");
        return;
      }
      newValue = Objectvalue ? JSON.parse(Objectvalue) : JSON.parse("{}");
      setObjectFieldValue(JSON.stringify(newValue, undefined, 4));
    } catch (error) {
      toast.error("Invalid JSON provided");
      return;
    }
    let updatedDataToSend = isDeafaultObject ? {
      configuration: {
        [key]: {
          [defaultValue?.key]: e.target.value
        },
      }
    } : {
      configuration: {
        [key]: e.target.value
      }
    };
    if (Object.entries(newValue).length > 0) {
      updatedDataToSend = {
        configuration: {
          [key]: {
            [defaultValue?.key]: e.target.value,
            [e.target.value]: typeof newValue === 'string' ? JSON.parse(newValue) : newValue
          },
        }
      }
    }
    if (e.target.value !== configuration?.[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: { ...updatedDataToSend } }));
    }
  };

  const toggleAccordion = () => {
    setIsAccordionOpen((prevState) => !prevState);
  };

  const setSliderValue = (value, key) => {
    setInputConfiguration((prev) => ({
      ...prev,
      [key]: value,
    }))
    let updatedDataToSend = {
      configuration: {
        [key]: value
      }
    };
    if (value !== configuration?.[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: updatedDataToSend }));
    }
  };

  const handleDropdownChange = useCallback((value, key) => {
    const newValue = value ? value : null;
    const updatedDataToSend = {
      configuration: {
        [key]: newValue
      }
    };
    dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: params?.version, dataToSend: updatedDataToSend }));
  }, [dispatch, params?.id, params?.version]);

  return (
    <div className="z-very-low mt-4 text-base-content w-full cursor-pointer" tabIndex={0}>
      <div className={`info p-2 ${isAccordionOpen ? 'border border-base-content/20 rounded-x-lg rounded-t-lg' : 'border border-base-content/20 rounded-lg'} flex items-center justify-between font-medium w-full !cursor-pointer`} onClick={() => {
        handleTutorial()
        toggleAccordion()
      }}>
        <InfoTooltip tooltipContent="Advanced parameters allow you to fine-tune the behavior of your AI model, such as adjusting response length, quality, or response type." className="cursor-pointer mr-2">
          <div className="cursor-pointer label-text inline-block ml-1">
            Advanced Parameters
          </div>
        </InfoTooltip>

        <span className="cursor-pointer"> {isAccordionOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}</span>
      </div>
      {tutorialState.showSuggestion && (<TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"AdvanceParameter"} TutorialDetails={"Advanced Parameters"} />)}
      {tutorialState.showTutorial && (
        <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.AdvanceParameter} flagKey={"AdvanceParameter"} />
      )}
      <div className={`w-full gap-3 flex flex-col px-3 py-2 ${isAccordionOpen ? 'border border-base-content/20-x border-b border-base-content/20 rounded-x-lg rounded-b-lg' : 'border border-base-content/20 rounded-lg'}  transition-all duration-300 ease-in-out overflow-hidden ${isAccordionOpen ? ' opacity-100' : 'max-h-0 opacity-0 p-0'}`}>

        {modelInfoData && Object.entries(modelInfoData || {})?.map(([key, { field, min = 0, max, step, default: defaultValue, options }]) => {
          const isDeafaultObject = typeof modelInfoData?.[key]?.default === 'object';
          if (KEYS_NOT_TO_DISPLAY?.includes(key)) return null;
          const name = ADVANCED_BRIDGE_PARAMETERS?.[key]?.name || key;
          const description = ADVANCED_BRIDGE_PARAMETERS?.[key]?.description || '';
          let error = false;
          return (
            <div key={key} className="form-control w-full">
              <label className="label">
                <div className='flex gap-2'>
                  <div className='flex flex-row gap-2 items-center'>
                    {description ? <InfoTooltip tooltipContent={description}>
                      <span className="label-text capitalize info">{name || key}</span>
                    </InfoTooltip> : <span className="label-text capitalize">{name || key}</span>}
                  </div>
                  <div>
                    <ul className="menu menu-xs menu-horizontal lg:menu-horizontal bg-base-200 p-1 rounded-md text-xs">
                      {field === 'slider' && (<li><a onClick={() => setSliderValue("min", key)} className={configuration?.[key] === "min" ? 'bg-base-content text-base-100' : ''}>Min</a></li>)}
                      <div className="tooltip" data-tip="If you set default, this key will not be send"><li><a onClick={() => setSliderValue("default", key)} className={configuration?.[key] === "default" ? 'bg-base-content text-base-100 ' : ''} >Default</a></li></div>
                      {field === 'slider' && (<li><a onClick={() => setSliderValue("max", key)} className={configuration?.[key] === "max" ? 'bg-base-content text-base-100' : ''}> Max</a></li>)}
                    </ul>
                  </div>
                </div>
                {((field === 'slider') && !(min <= configuration?.[key] && configuration?.[key] <= max)) && (configuration?.['key']?.type === "string") && (error = true)}
                {field === 'slider' && <p className={`text-right ${error ? 'text-error' : ''}`} id={`sliderValue-${key}`}>{(configuration?.[key] === 'min' || configuration?.[key] === 'max' || configuration?.[key] === 'default') ?
                  modelInfoData?.[key]?.[configuration?.[key]] : configuration?.[key]}</p>}
              </label>
              {field === 'dropdown' && (
                <div className="w-full">
                  <div className="relative">
                    <div
                      className="flex items-center gap-2 input input-bordered input-sm w-full min-h-[2.5rem] cursor-pointer"
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span className="text-base-content">
                        {selectedOptions?.length > 0
                          ? (integrationData?.[selectedOptions?.[0]?.name]?.title || selectedOptions?.[0]?.name)
                          : 'Select an tool choice option...'}
                      </span>
                      <div className="ml-auto">
                        {showDropdown ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                      </div>
                    </div>

                    {showDropdown && (
                      <div className="bg-base-100 border border-base-200 rounded-md shadow-lg z-low max-h-[200px] overflow-y-auto mt-1 p-2">

                        <div className="p-2 top-0 bg-base-100">
                          <input
                            type="text"
                            placeholder="Search functions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input input-bordered input-sm w-full"
                          />
                        </div>
                        {/* Add option data to show in dropdown */}
                        {options && options.map(option => (
                          <div
                            key={option?.id}
                            className="p-2 hover:bg-base-200 cursor-pointer max-h-[80px] overflow-y-auto"
                            onClick={() => {
                              setSelectedOptions([{ name: option, id: option }]);
                              handleDropdownChange(option, key);
                              setShowDropdown(false);
                            }}
                          >
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="function-select"
                                checked={selectedOptions?.some(opt => opt?.name === option)}
                                className="radio radio-sm"
                              />
                              <span className="font-semibold">{option}</span>
                              <span className="text-gray-500 text-xs">
                                {option === 'none'
                                  ? "Model won't call a function; it will generate a message."
                                  : option === 'auto'
                                    ? "Model can generate a response or call a function."
                                    : "One or more specific functions must be called"}
                              </span>
                            </label>
                          </div>
                        ))}
                        {version_function_data && typeof version_function_data === 'object' && (
                          Object.values(version_function_data)
                            .filter(value => {
                              const functionName = value?.function_name || value?.endpoint_name;
                              const title = integrationData?.[functionName]?.title || value?.endpoint_name || 'Untitled';
                              return title?.toLowerCase()?.includes(searchQuery?.toLowerCase());
                            })
                            .sort((a, b) => {
                              const aName = a?.function_name || a?.endpoint_name;
                              const bName = b?.function_name || b?.endpoint_name;
                              const aTitle = integrationData?.[aName]?.title || aName || 'Untitled';
                              const bTitle = integrationData?.[bName]?.title || bName || 'Untitled';
                              return aTitle?.localeCompare(bTitle);
                            })
                            .map((value) => {
                              const functionName = value?.function_name || value?.endpoint_name;
                              const title = integrationData?.[functionName]?.title || value?.endpoint_name || 'Untitled';
                              const isSelected = selectedOptions?.some(opt => opt?.id === value?._id);
                              return (
                                <div
                                  key={value?._id}
                                  className="p-2 hover:bg-base-200 cursor-pointer max-h-[40px] overflow-y-auto"
                                  onClick={() => {
                                    setSelectedOptions(isSelected ? [] : [{ name: functionName, id: value?._id }]);
                                    handleDropdownChange(isSelected ? null : value?._id, key);
                                    setShowDropdown(false);
                                  }}
                                >
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name="function-select"
                                      checked={isSelected}
                                      className="radio radio-sm"
                                    />
                                    <span>{title}</span>
                                  </label>
                                </div>
                              );
                            })
                        )}

                      </div>
                    )}
                  </div>
                </div>
              )}

              {field === 'slider' && (
                <div>
                  <input
                    type="range"
                    min={min || 0}
                    max={max || 100}
                    step={step || 1}
                    key={`${key}-${configuration?.[key]}-${service}-${model}`}
                    defaultValue={
                      (configuration?.[key] === 'min' || configuration?.[key] === 'max' || configuration?.[key] === 'default') ?
                        modelInfoData?.[key]?.[configuration?.[key]] :
                        configuration?.[key]
                    }
                    onBlur={(e) => handleInputChange(e, key, true)}
                    onInput={(e) => {
                      document.getElementById(`sliderValue-${key}`).innerText = e.target.value;
                    }}
                    className="range range-accent range-sm h-3 range-extra-small-thumb"
                    name={key}
                  />
                </div>
              )}
              {field === 'text' && (
                <input
                  type="text"
                  value={inputConfiguration?.[key] === 'default' ? '' : inputConfiguration?.[key] || ''}
                  onChange={(e) =>
                    setInputConfiguration((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  onBlur={(e) => handleInputChange(e, key)}
                  className="input input-bordered input-sm w-full"
                  name={key}
                />
              )}
              {field === 'number' && (
                <input
                  type="number"
                  min={min}
                  max={max}
                  step={step}
                  value={inputConfiguration?.[key] === "default" ? 0 : inputConfiguration?.[key]}
                  onChange={(e) =>
                    setInputConfiguration((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  onBlur={(e) => handleInputChange(e, key)}
                  className="input input-bordered input-sm w-full"
                  name={key}
                />
              )}
              {field === 'boolean' && (
                <label className='flex items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
                  <input
                    name={key}
                    type="checkbox"
                    className="toggle"
                    checked={inputConfiguration?.[key] === "default" ? false : inputConfiguration?.[key]}
                    onChange={(e) => handleInputChange(e, key)}
                  />
                </label>
              )}
              {field === 'select' && (
                <label className='items-center justify-start gap-4 bg-base-100 text-base-content'>
                  <select
                    value={configuration?.[key] === 'default' ? 'default' : (configuration?.[key]?.[defaultValue?.key] || configuration?.[key])}
                    onChange={(e) => handleSelectChange(e, key, defaultValue, '{}', isDeafaultObject)}
                    className="select select-sm max-w-xs select-bordered capitalize"
                  >
                    <option value='default' disabled> Select {key} mode </option>
                    {options?.map((service, index) => (
                      <option key={index} value={service?.type}>{service?.type ? service?.type : service}</option>
                    ))}
                  </select>

                  {configuration?.[key]?.type === "json_schema" && (
                    <>
                      <div className="flex justify-end mb-2 mt-5">
                        <span
                          className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            openModal(MODAL_TYPE.JSON_SCHEMA);
                          }}
                        >
                          Response Builder
                        </span>
                      </div>

                      {/* Textarea */}
                      <textarea
                        key={`${key}-${configuration?.[key]}-${objectFieldValue}-${configuration}`}
                        type="input"
                        defaultValue={
                          objectFieldValue ||
                          JSON.stringify(
                            configuration?.[key]?.json_schema,
                            undefined,
                            4
                          )
                        }
                        className="textarea border border-base-content/20 w-full min-h-96 resize-y"
                        onBlur={(e) =>
                          handleSelectChange({ target: { value: "json_schema" } }, "response_type", { key: "type" }, e.target.value)
                        }
                        placeholder="Enter valid JSON object here..."
                      />

                      <JsonSchemaModal params={params} messages={messages} setMessages={setMessages} thread_id={thread_id} />
                    </>
                  )}

                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedParameters;
