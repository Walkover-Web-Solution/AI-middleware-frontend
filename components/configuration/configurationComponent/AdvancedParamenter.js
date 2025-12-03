import { useCustomSelector } from '@/customHooks/customSelector';
import { ADVANCED_BRIDGE_PARAMETERS, KEYS_NOT_TO_DISPLAY } from '@/jsonFiles/bridgeParameter';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import useTutorialVideos from '@/hooks/useTutorialVideos';
import { generateRandomID, openModal } from '@/utils/utility';
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons';
import JsonSchemaModal from "@/components/modals/JsonSchemaModal";
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/TutorialSuggestoinToast';
import InfoTooltip from '@/components/InfoTooltip';
import {setThreadIdForVersionReducer } from '@/store/reducer/bridgeReducer';
import { CircleQuestionMark } from 'lucide-react';

const AdvancedParameters = ({ params, searchParams, isEmbedUser, hideAdvancedParameters, className = "", level = 1, compact = false, isPublished = false }) => {
  // Use the tutorial videos hook
  const { getAdvanceParameterVideo } = useTutorialVideos();
  
  const [objectFieldValue, setObjectFieldValue] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [tutorialState, setTutorialState] = useState({
    showTutorial: false,
    showSuggestion: false
  });
  const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();

  const {service,version_function_data,configuration,integrationData,connected_agents,modelInfoData,bridge } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version];
    const bridgeDataFromState = state?.bridgeReducer?.allBridgesMap?.[params?.id];
    const integrationData = state?.bridgeReducer?.org?.[params?.org_id]?.integrationData || {};
    
    // Use bridgeData when isPublished=true, otherwise use versionData
    const activeData = isPublished ? bridgeDataFromState : versionData;
    const service = activeData?.service;
    const configuration = activeData?.configuration;
    const type = configuration?.type;
    const model = configuration?.model;
    const modelInfoData = state?.modelReducer?.serviceModels?.[service]?.[type]?.[model]?.configuration?.additional_parameters;
    
    return {
      version_function_data: isPublished ? (bridgeDataFromState?.apiCalls) : (versionData?.apiCalls),
      integrationData,
      service,
      configuration,
      connected_agents: isPublished ? (bridgeDataFromState?.connected_agents) : (versionData?.connected_agents),
      modelInfoData,
      bridge: activeData
    };
  });
  const [inputConfiguration, setInputConfiguration] = useState(configuration);
  const { tool_choice: tool_choice_data, model } = configuration || {};
  const initialThreadId = bridge?.thread_id || generateRandomID();
  const [thread_id, setThreadId] = useState(initialThreadId);

    useEffect(() => {
          if (!bridge?.thread_id && initialThreadId) {
            setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                  bridgeId: params?.id,
                  versionId: searchParams?.version,
                  thread_id: initialThreadId,
              }));
          }
      }, []);
  useEffect(() => {
    setInputConfiguration(configuration);
  }, [configuration]);
  
  // Filter parameters by level
  const getParametersByLevel = (level) => {
    if (!modelInfoData) return [];

    return Object.entries(modelInfoData || {}).filter(([key, paramConfig]) => {
      // Skip keys that shouldn't be displayed
      if (KEYS_NOT_TO_DISPLAY?.includes(key)) return false;

      // Get level from ADVANCED_BRIDGE_PARAMETERS or default to 1
      const paramLevel = paramConfig?.level ?? 1;
      return paramLevel === level;
    });
  };

  const level1Parameters = getParametersByLevel(1); // Regular parameters (not in accordion)
  const level2Parameters = getParametersByLevel(2); // Outside accordion parameters

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
      const selectedAgentData = connected_agents && typeof connected_agents === 'object'
        ? Object.entries(connected_agents)
          .filter(([name, item]) => {
            const toolChoice = typeof tool_choice_data === 'string' ? tool_choice_data : '';
            return toolChoice === item.bridge_id;
          })
          .map(([name, item]) => ({
            name,
            id: item.bridge_id
          }))
        : [];
      setSelectedOptions(selectedAgentData?.length > 0 ? selectedAgentData : selectedFunctiondata);
    
  }, [tool_choice_data]);

  const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
      const context = this;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(context, args);
      }, delay);
    };
  };

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
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: { ...updatedDataToSend } }));
    }
  };

  const debouncedInputChange = useCallback(
    debounce(handleInputChange, 500),
    [configuration, params?.id, params?.version]
  );

  const handleSelectChange = (e, key, defaultValue, Objectvalue = {}, isDeafaultObject = true) => {
    let newValue;
    try {
      if (Objectvalue && !JSON.parse(Objectvalue)) {
        toast.error("Invalid JSON provided");
        return;
      }
      newValue = Objectvalue ? JSON.parse(Objectvalue) : JSON.parse("{}");
      setObjectFieldValue(JSON.stringify(newValue, undefined, 4));
    } catch {
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
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: { ...updatedDataToSend } }));
    }
  };
  const setSliderValue = (value, key, isDeafaultObject = false) => {
    setInputConfiguration((prev) => ({
      ...prev,
      [key]: value,
    }))
    let updatedDataToSend = (isDeafaultObject && value !== "default") ? {
      configuration: {
        [key]:{
          [value?.key]: value[value?.key]
        }
      }
    } : {
      configuration: {
        [key]: value
      }
    };
    if (value !== configuration?.[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: updatedDataToSend }));
    }
  };

  const handleDropdownChange = useCallback((value, key) => {
    const newValue = value ? value : null;
    const updatedDataToSend = {
      configuration: {
        [key]: newValue
      }
    };
    dispatch(updateBridgeVersionAction({ bridgeId: params?.id, versionId: searchParams?.version, dataToSend: updatedDataToSend }));
  }, [dispatch, params?.id, searchParams?.version]);
  
  // Helper function to render parameter fields
  const renderParameterField = (key, { field, min = 0, max, step, default: defaultValue, options }) => {
    const isDeafaultObject = typeof modelInfoData?.[key]?.default === 'object';
    if (KEYS_NOT_TO_DISPLAY?.includes(key)) return null;

    const name = ADVANCED_BRIDGE_PARAMETERS?.[key]?.name || key;
    const description = ADVANCED_BRIDGE_PARAMETERS?.[key]?.description || '';
    const isDefaultValue = configuration?.[key] === 'default';
    const checkboxSizeClass = 'checkbox-xs';
    const inputSizeClass = 'input-xs';
    const selectSizeClass = 'select-sm';
    const buttonSizeClass = 'btn-xs';
    const rangeSizeClass = 'range-xs';
    const toggleSizeClass = 'toggle-xs';
    const labelTextClass = 'text-sm font-medium capitalizen';
    const sliderValueId = `sliderValue-${key} h-2`;

    let error = false;
    if (field === 'slider' && !isDefaultValue) {
      error = !(min <= configuration?.[key] && configuration?.[key] <= max) && (configuration?.['key']?.type === "string");
    }

    const sliderDisplayValue = field === 'slider' && !isDefaultValue
      ? ((configuration?.[key] === 'min' || configuration?.[key] === 'max' || configuration?.[key] === 'default')
        ? modelInfoData?.[key]?.[configuration?.[key]]
        : configuration?.[key])
      : null;

    const sliderValueNode = (!isDefaultValue && sliderDisplayValue !== null) ? (
      <span
        className={`text-xs ${error ? 'text-error' : 'text-base-content/70'}`}
        id={sliderValueId}
      >
        {sliderDisplayValue}
      </span>
    ) : null;

    // Detect if this is level 2 by checking if we're in compact mode or level 2 context
    const isLevel2 = level === 2 || compact;
    
    return (
      <div key={key} className={`group w-full ${isLevel2 ? 'space-y-1' : 'space-y-3'}`}>
        <div className={`flex items-center justify-between gap-2 ${isLevel2 ? 'mb-1' : 'mb-2'}`}>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className={`checkbox ${checkboxSizeClass} cursor-pointer`}
              title={isDefaultValue ? 'Use default value' : 'Use custom value'}
              checked={!isDefaultValue}
              onChange={(e) => {
                const checked = e.target.checked;
                if (!checked) {
                  setSliderValue("default", key, isDeafaultObject);
                } else {
                  const fallback = modelInfoData?.[key]?.default ?? inputConfiguration?.[key] ?? configuration?.[key] ?? null;
                  setSliderValue(fallback, key, isDeafaultObject);
                }
              }}
              disabled={isPublished}
            />
            <div className="flex items-center gap-1">
              <span className={labelTextClass}>{name || key}</span>
              {description && (
                <InfoTooltip tooltipContent={description}>
                  <CircleQuestionMark size={14} className="text-gray-500 hover:text-gray-700 cursor-help" />
                </InfoTooltip>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sliderValueNode}
            {isDefaultValue && (
              <span className="badge badge-info badge-xs p-2">Default</span>
            )}
          </div>
        </div>

        {field === 'dropdown' && !isDefaultValue && (
          <div className="w-full">
            <div className="relative">
              <div
                className={`flex items-center gap-2 input input-bordered ${inputSizeClass} w-full min-h-[2rem] cursor-pointer`}
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span className="truncate text-base-content text-xs">
                  {selectedOptions?.length > 0
                    ? (integrationData?.[selectedOptions?.[0]?.name]?.title || selectedOptions?.[0]?.name)
                    : 'Select a tool choice option...'}
                </span>
                <div className="ml-auto">
                  {showDropdown ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
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
                      className={`input input-bordered ${inputSizeClass} w-full`}
                    />
                  </div>
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
                          className="radio radio-xs"
                        />
                        <span className="font-medium text-xs">{option}</span>
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
                                className="radio radio-xs"
                              />
                              <span className="text-xs">{title}</span>
                            </label>
                          </div>
                        );
                      })
                  )}
                  {connected_agents && typeof connected_agents === 'object' && (
                    <>
                      <div className="px-2 pt-2 pb-1 text-xs font-semibold text-base-content/70">Agents</div>
                      {Object.entries(connected_agents)
                        .filter(([name, item]) => {
                          const label = name || item?.description || '';
                          return label?.toLowerCase()?.includes(searchQuery?.toLowerCase());
                        })
                        .sort(([aName], [bName]) => (aName || '').localeCompare(bName || ''))
                        .map(([name, item]) => {
                          const title = name || 'Untitled';
                          const isSelected = selectedOptions?.some(opt => opt?.id === item?.bridge_id);
                          return (
                            <div
                              key={item?.bridge_id}
                              className="p-2 hover:bg-base-200 cursor-pointer max-h-[40px] overflow-y-auto"
                              onClick={() => {
                                setSelectedOptions(isSelected ? [] : [{ name, id: item?.bridge_id }]);
                                handleDropdownChange(isSelected ? null : item?.bridge_id, key);
                                setShowDropdown(false);
                              }}
                            >
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="agent-select"
                                  checked={isSelected}
                                  className="radio radio-xs"
                                />
                                <span className="text-xs">{title}</span>
                              </label>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {field === 'slider' && !isDefaultValue && (
          <div className="flex items-center gap-2">
            <button disabled={isPublished} type="button" className={`btn ${buttonSizeClass} btn-ghost border border-base-content/20`} onClick={() => setSliderValue('min', key)}>Min</button>
            <input
              type="range"
              min={min || 0}
              max={max || 100}
              step={step || 1}
              key={`${key}-${configuration?.[key]}-${service}-${model}`}
              defaultValue={sliderDisplayValue ?? ''}
              onChange={(e) => {
                const el = document.getElementById(sliderValueId);
                if (el) el.innerText = e.target.value;
                debouncedInputChange(e, key, true);
              }}
              className={`range range-accent disabled:opacity-50 disabled:cursor-not-allowed h-2 rounded-full ${rangeSizeClass}`}
              name={key}
              disabled={isPublished}
            />
            <button disabled={isPublished} type="button" className={`btn ${buttonSizeClass} btn-ghost border border-base-content/20`} onClick={() => setSliderValue('max', key)}>Max</button>
          </div>
        )}

        {field === 'text' && !isDefaultValue && (
          <input
            type="text"
            value={inputConfiguration?.[key] === 'default' ? '' : inputConfiguration?.[key] || ''}
            onChange={(e) => {
              setInputConfiguration((prev) => ({
                ...prev,
                [key]: e.target.value,
              }));
              debouncedInputChange(e, key);
            }}
            className={`input input-bordered ${inputSizeClass} w-full`}
            name={key}
            disabled={isPublished}
          />
        )}

        {field === 'number' && !isDefaultValue && (
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
            className={`input input-bordered ${inputSizeClass} w-full`}
            name={key}
            disabled={isPublished}
          />
        )}

        {field === 'boolean' && !isDefaultValue && (
          <label className='flex items-center justify-start w-fit gap-2 bg-base-100 text-base-content'>
            <input
              name={key}
              type="checkbox"
              className={`toggle ${toggleSizeClass}`}
              checked={inputConfiguration?.[key] === "default" ? false : inputConfiguration?.[key]}
              onChange={(e) => handleInputChange(e, key)}
              disabled={isPublished}
            />
          </label>
        )}

        {field === 'select' && !isDefaultValue && (
          <label className='items-center justify-start gap-4 bg-base-100 text-base-content'>
            <select
              value={configuration?.[key] === 'default' ? 'default' : (configuration?.[key]?.[defaultValue?.key] || configuration?.[key])}
              onChange={(e) => handleSelectChange(e, key, defaultValue, '{}', isDeafaultObject)}
              className={`select ${selectSizeClass} max-w-xs select-bordered capitalize`}
              disabled={isPublished}
            >
              <option value='default' disabled> Select {key} mode </option>
              {options?.map((service, index) => (
                <option key={index} value={service?.type}>{service?.type ? service?.type : service}</option>
              ))}
            </select>

            {configuration?.[key]?.type === "json_schema" && (
              <>
                <div className="flex justify-end mb-2">
                  <span
                    className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      openModal(MODAL_TYPE.JSON_SCHEMA);
                    }}
                  >
                    Response Builder
                  </span>
                </div>

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
                  className="textarea bg-white dark:bg-black/15 border border-base-content/20 w-full min-h-96 resize-y"
                  onBlur={(e) =>
                    handleSelectChange({ target: { value: "json_schema" } }, "response_type", { key: "type" }, e.target.value)
                  }
                  placeholder="Enter valid JSON object here..."
                  disabled={isPublished}
                />

                <JsonSchemaModal
                  params={params}
                  searchParams={searchParams}
                  messages={messages}
                  setMessages={setMessages}
                  thread_id={thread_id}
                  onResetThreadId={() => {
                    const newId = generateRandomID();
                    setThreadId(newId);
                    setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                      bridgeId: params?.id,
                      versionId: searchParams?.version,
                      thread_id: newId,
                    }));
                  }}
                />
              </>
            )}

          </label>
        )}
      </div>
    );
  };

  const shouldShowLevel1 = level1Parameters.length > 0 && (!isEmbedUser || (isEmbedUser && !hideAdvancedParameters));

  if (level === 2) {
    if (level2Parameters.length === 0) {
      return null;
    }

    return (
      <div className={`z-very-low mt-2 text-base-content w-full ${className}`} tabIndex={0}>
        {/* Level 2 Parameters - Displayed Outside Accordion */}
        {level2Parameters.length > 0 && (
          <div className="w-full gap-4 flex flex-col px-2 py-2 cursor-default items-center">
            {level2Parameters.map(([key, paramConfig]) => (
              <div key={key} className="compact-parameter w-full max-w-md">
                {renderParameterField(key, paramConfig)}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (level === 1) {
    if (!shouldShowLevel1) {
      return null;
    }

    // Level 1 parameters now render without accordion
    return (
      <div className={`z-very-low mt-4 text-base-content w-full ${className}`} tabIndex={0}>
        {tutorialState.showSuggestion && (
          <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"AdvanceParameter"} TutorialDetails={"Advanced Parameters"} />
        )}
        {tutorialState.showTutorial && (
          <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={getAdvanceParameterVideo()} flagKey={"AdvanceParameter"} />
        )}
        <div className={`w-full flex flex-col ${compact ? 'gap-3' : 'gap-4'} items-center`}>
          {level1Parameters.map(([key, paramConfig]) => (
            <div key={key} className="w-full max-w-md">
              {renderParameterField(key, paramConfig)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default AdvancedParameters;
