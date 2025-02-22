import { useCustomSelector } from '@/customHooks/customSelector';
import { ADVANCED_BRIDGE_PARAMETERS, KEYS_NOT_TO_DISPLAY } from '@/jsonFiles/bridgeParameter';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import JsonSchemaModal from "@/components/modals/JsonSchemaModal";
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { openModal } from '@/utils/utility';
import { MODAL_TYPE } from '@/utils/enums';

const AdvancedParameters = ({ params }) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [objectFieldValue, setObjectFieldValue] = useState();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const dispatch = useDispatch();

  const { service, type, model, configuration, integrationData, version_function_data, tool_choice_data } = useCustomSelector((state) => {
    const versionData = state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[params?.version];
    const integrationData = state?.bridgeReducer?.org?.[params?.org_id]?.integrationData || {};
    return {
      integrationData,
      service: versionData?.service,
      type: versionData?.configuration?.type,
      configuration: versionData?.configuration,
      tool_choice_data: versionData?.configuration?.tool_choice,
      model: versionData?.configuration?.model,
      version_function_data: versionData?.apiCalls
    };
  });

  const { modelInfoData } = useCustomSelector((state) => ({
    modelInfoData: state?.modelReducer?.serviceModels?.[service]?.[type]?.[configuration?.model]?.configuration?.additional_parameters,
  }));

  useEffect(() => {
    if (configuration?.response_type?.json_schema) {
      setObjectFieldValue(
        JSON.stringify(configuration?.response_type?.json_schema, undefined, 4)
      );
    }
  }, [tool_choice_data]);

  useEffect(() => {
    if(tool_choice_data === "auto"  || tool_choice_data === "none" || tool_choice_data === "default")
    {
      setSelectedOptions([{name: tool_choice_data === "default" ? "auto" : tool_choice_data, id: tool_choice_data === "default" ? "auto" : tool_choice_data}])
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
    if ((isSlider ? Number(newValue) : e.target.type === 'checkbox' ? newCheckedValue : newValue) !== configuration[key]) {
      // dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { ...updatedDataToSend } }));
      dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { ...updatedDataToSend } }));
    }
  };

  const handleSelectChange = (e, key) => {
    let newValue;
    let is_json = false
    try {
      newValue = e.target.value ? JSON.parse(e.target.value) : JSON.parse("{}");
      setObjectFieldValue(JSON.stringify(newValue, undefined, 4));
      is_json = true
    } catch (error) {
      newValue = e.target.value;
    }
    let updatedDataToSend = {
      configuration: {
        [key]: newValue,
      }
    };
    if (key === "size") {
      updatedDataToSend = {
        configuration: {
          'size': newValue
        }
      }

    }
    if (key === "quality") {
      updatedDataToSend = {
        configuration: {
          'quality': newValue
        }
      }
    }
    if (key === 'json_schema') {
      if (!is_json) return toast.error('Json schema is not parsable JSON');
      updatedDataToSend = {
        configuration: {
          "response_type": {
            "type": 'json_schema',
            [key]: newValue
          }
        }
      }
    }
    if (key === 'response_type') {
      updatedDataToSend = {
        configuration: {
          "response_type": {
            "type": newValue,
          }
        }
      }
    }
    if (newValue !== configuration[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: { ...updatedDataToSend } }));
    }
  };

  const toggleAccordion = () => {
    setIsAccordionOpen((prevState) => !prevState);
  };

  const setSliderValue = (value, key) => {
    let updatedDataToSend = {
      configuration: {
        [key]: value
      }
    };
    if (value !== configuration[key]) {
      dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: updatedDataToSend }));
    }
  };

  const handleDropdownChange = useCallback((value, key) => {
    const newValue = value ? value : null; // Corrected to handle single value
    const updatedDataToSend = {
      configuration: {
        [key]: newValue
      }
    };
    dispatch(updateBridgeVersionAction({ bridgeId: params.id, versionId: params.version, dataToSend: updatedDataToSend }));
  }, [dispatch, params.id, params.version]);

  return (
    <div className="collapse text-base-content" tabIndex={0}>
      <input type="radio" name="my-accordion-1" onClick={toggleAccordion} className='cursor-pointer' />
      <div className="collapse-title p-0 flex items-center justify-start font-medium cursor-pointer" onClick={toggleAccordion}>
        <span className="mr-2 cursor-pointer">
          Advanced Parameters
        </span>

        {isAccordionOpen ? <ChevronUp /> : <ChevronDown />}
      </div>

      {isAccordionOpen && <div className="collapse-content gap-3 flex flex-col p-3 border rounded-md">

        {modelInfoData && Object.entries(modelInfoData || {})?.map(([key, { field, min, max, step, default: defaultValue, options }]) => {
          if (KEYS_NOT_TO_DISPLAY.includes(key)) return null;
          const name = ADVANCED_BRIDGE_PARAMETERS?.[key]?.name || key;
          const description = ADVANCED_BRIDGE_PARAMETERS?.[key]?.description || '';
          let error = false;
          return (
            <div key={key} className="form-control">
              <label className="label">
                <div className='flex gap-2'>
                  <div className='flex flex-row gap-2 items-center'>
                    <span className="label-text capitalize">{name || key}</span>
                    {description && <div className="tooltip tooltip-right" data-tip={description}>
                      <Info size={12} />
                    </div>}
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
                        {selectedOptions.length > 0 
                          ? (integrationData[selectedOptions[0].name]?.title || selectedOptions[0].name) 
                          : 'Select an tool choice option...'}
                      </span>
                      <div className="ml-auto">
                        {showDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {showDropdown && (
                      <div className="bg-base-100 border border-base-200 rounded-md shadow-lg z-10 max-h-[200px] overflow-y-auto mt-1 p-2">

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
                            key={option.id}
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
                                checked={selectedOptions.some(opt => opt.name === option)}
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
                              const title = integrationData[functionName]?.title || value?.endpoint_name || 'Untitled';
                              return title.toLowerCase().includes(searchQuery.toLowerCase());
                            })
                            .sort((a, b) => {
                              const aName = a?.function_name || a?.endpoint_name;
                              const bName = b?.function_name || b?.endpoint_name;
                              const aTitle = integrationData[aName]?.title || aName || 'Untitled';
                              const bTitle = integrationData[bName]?.title || bName || 'Untitled';
                              return aTitle.localeCompare(bTitle);
                            })
                            .map((value) => {
                              const functionName = value?.function_name || value?.endpoint_name;
                              const title = integrationData[functionName]?.title || value?.endpoint_name || 'Untitled';
                              const isSelected = selectedOptions.some(opt => opt?.id === value._id);
                              return (
                                <div
                                  key={value._id}
                                  className="p-2 hover:bg-base-200 cursor-pointer max-h-[40px] overflow-y-auto"
                                  onClick={() => {
                                    setSelectedOptions(isSelected ? [] : [{ name: functionName, id: value._id }]);
                                    handleDropdownChange(isSelected ? null : value._id, key); // Updated to pass the correct value
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
                    className="range range-xs w-full"
                    name={key}
                  />
                </div>
              )}
              {field === 'text' && (
                <input
                  type="text"
                  defaultValue={configuration?.[key] === 'default' ? '' : configuration?.[key] || ''}
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
                  defaultValue={configuration?.[key] || 0}
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
                    defaultChecked={configuration?.[key] || false}
                    onChange={(e) => handleInputChange(e, key)}
                  />
                </label>
              )}
              {field === 'select' && (
                <label className='items-center justify-start w-fit gap-4 bg-base-100 text-base-content'>
                  <select value={configuration?.[key]?.type ? configuration?.[key]?.type : configuration?.[key] || 'Text'} onChange={(e) => handleSelectChange(e, key)} className="select select-sm max-w-xs select-bordered capitalize">
                    <option disabled>Select response mode</option>
                    {options?.map((service, index) => (
                      <option key={index} value={service?.type}>{service?.type ? service?.type : service}</option>
                    ))}
                  </select>
                  {configuration?.[key]?.type === "json_schema" && (
                    <>
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
                        className="mt-5 textarea textarea-bordered border w-full min-h-96 resize-y z-[1]"
                        onBlur={(e) =>
                          handleSelectChange(e, "json_schema")
                        }
                        placeholder="Enter valid JSON object here..."
                      />
                      <span
                        className="label-text capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text"
                        onClick={() => {
                          openModal(MODAL_TYPE.JSON_SCHEMA);
                        }}
                      >
                        Optimize Schema
                      </span>
                      <JsonSchemaModal params={params} />
                    </>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>}
    </div>
  );
};

export default AdvancedParameters;