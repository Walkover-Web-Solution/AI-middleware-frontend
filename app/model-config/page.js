'use client';

import { useState, useEffect } from 'react';
import axios from "@/utils/interceptor"
import { toast } from 'react-toastify';

const defaultConfig = {
  model_name: 'gpt-4o',
  service : 'openai',
  specification: {
    input_cost: 2.5,
    output_cost: 10,
    description: 'GPT-4o model which is fast, Intelligent model for all purpose tasks. It accepts both text and image inputs, and produces text outputs.',
    knowledge_cutoff: 'Oct 01, 2023',
    usecase: ['Fast, Intelligent model suitable for all purpose tasks']
  },
  configuration: {
    model: {
      field: 'drop',
      default: 'gpt-4o',
      level: 1
    },
    creativity_level: {
      field: 'slider',
      min: 0,
      max: 2,
      step: 0.1,
      default: 0,
      level: 2
    },
    max_tokens: {
      field: 'slider',
      min: 256,
      max: 16384,
      step: 1,
      default: 256,
      level: 2
    },
    probability_cutoff: {
      field: 'slider',
      min: 0,
      max: 1,
      step: 0.1,
      default: 1,
      level: 2
    },
    log_probability: {
      field: 'boolean',
      default: false,
      level: 0,
      typeOf: 'boolean'
    },
    repetition_penalty: {
      field: 'slider',
      min: 0,
      max: 2,
      step: 0.01,
      default: 0,
      level: 2
    },
    novelty_penalty: {
      field: 'slider',
      min: 0,
      max: 2,
      step: 0.01,
      default: 0,
      level: 2
    },
    response_count: {
      field: 'number',
      default: 1,
      typeOf: 'number',
      level: 0
    },
    stop: {
      field: 'text',
      default: '',
      level: 0
    },
    stream: {
      field: 'boolean',
      default: false,
      level: 0,
      typeOf: 'boolean'
    },
    tools: {
      field: 'array',
      level: 0,
      default: [],
      typeOf: 'array'
    },
    tool_choice: {
      field: 'dropdown',
      options: [
        'auto',
        'none',
        'required'
      ],
      default: 'auto',
      level: 0,
      typeOf: 'string'
    },
    response_type: {
      field: 'select',
      options: [
        { type: 'text' },
        { type: 'json_object' },
        { type: 'json_schema' }
      ],
      default: { type: 'text' },
      level: 0
    },
    vision: {
      support: true,
      level: 0,
      default: false
    },
    parallel_tool_calls: {
      field: 'boolean',
      default: true,
      level: 0,
      typeOf: 'boolean'
    },
    // specification: {
    //   input_cost: 2.5,
    //   output_cost: 10,
    //   level: 0,
    //   description: "GPT-4o model which is fast, Intelligent model for all purpose tasks. It accepts both text and image inputs, and produces text outputs.",
    //   knowledge_cutoff: "Oct 01, 2023",
    //   usecase: ["Fast, Intelligent model suitable for all purpose tasks"]
    // }
  },
  inputConfig: {
    system: {
      role: "system",
      content: "",
      contentKey: "content",
      type: "json"
    },
    content_location: "prompt[0].content"
  },
  outputConfig: {
    usage: [
      {
        prompt_tokens: "usage.prompt_tokens",
        completion_tokens: "usage.completion_tokens",
        total_tokens: "usage.total_tokens",
        cached_tokens: "usage.prompt_tokens_details.cached_tokens",
        total_cost: {
          input_cost: 2.5,
          output_cost: 10,
          cached_cost: 1.25
        }
      }
    ],
    message: "choices[0].message.content",
    tools: "choices[0].message.tool_calls",
    assistant: "choices[0].message",
    id: "id"
  },
  service: "openai"
};

export default function ModelConfigPage() {
  const [config, setConfig] = useState(JSON.parse(JSON.stringify(defaultConfig)));
  const [activeTab, setActiveTab] = useState('keys');
  const [outputJson, setOutputJson] = useState('');
  const [selectedKeys, setSelectedKeys] = useState([]);

  useEffect(() => {
    setOutputJson(generateJsonOutput());
  }, [selectedKeys, config]);

  const handleSelectKey = (key) => {
    setSelectedKeys(prevSelected => {
      if (prevSelected.includes(key)) {
        return prevSelected.filter(item => item !== key);
      } else {
        return [...prevSelected, key];
      }
    });
  };

  const handleServiceChange = (service) => {
    setConfig(prev => ({
      ...prev,
      service
    }));
  };

  const handleConfigChange = (key, field, value) => {
    if(key === "model") {
      setConfig(prev => ({
        ...prev,
        model_name: value
      }));
    }
    setConfig(prev => {
      const updatedConfig = {
        ...prev.configuration[key],
        [field]: value
      };
      // Ensure level is always present
      if (!('level' in updatedConfig)) {
        updatedConfig.level = 0;
      }
      return {
        ...prev,
        configuration: {
          ...prev.configuration,
          [key]: updatedConfig
        }
      };
    });
  };

  // Helper function to determine the type of a value
  const getValueType = (value) => {
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object' && value !== null) return 'object';
    return 'string';
  };

  // Helper function to update nested object values
  const updateNestedValue = (obj, path, value, valueType) => {
    const keys = path.split('.');
    const newObj = JSON.parse(JSON.stringify(obj));
    let current = newObj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    const finalKey = keys[keys.length - 1];
    switch (valueType) {
      case 'number':
        current[finalKey] = parseFloat(value) || 0;
        break;
      case 'boolean':
        current[finalKey] = value === 'true' || value === true;
        break;
      case 'array':
        try {
          current[finalKey] = JSON.parse(value);
        } catch {
          current[finalKey] = value.split(',').map(item => item.trim());
        }
        break;
      default:
        current[finalKey] = value;
    }
    
    return newObj;
  };

  // Handle input/output config changes
  const handleInputConfigChange = (path, value, valueType) => {
    setConfig(prev => ({
      ...prev,
      inputConfig: updateNestedValue(prev.inputConfig, path, value, valueType)
    }));
  };

  const handleOutputConfigChange = (path, value, valueType) => {
    setConfig(prev => ({
      ...prev,
      outputConfig: updateNestedValue(prev.outputConfig, path, value, valueType)
    }));
  };

  // Add new key to input/output config
  const addConfigKey = (configType, parentPath = '') => {
    const newKey = prompt('Enter new key name:');
    if (!newKey) return;
    
    const fullPath = parentPath ? `${parentPath}.${newKey}` : newKey;
    const defaultValue = '';
    
    if (configType === 'input') {
      handleInputConfigChange(fullPath, defaultValue, 'string');
    } else {
      handleOutputConfigChange(fullPath, defaultValue, 'string');
    }
  };

  // Remove key from config
  const removeConfigKey = (configType, path) => {
    setConfig(prev => {
      const newConfig = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let current = configType === 'input' ? newConfig.inputConfig : newConfig.outputConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      delete current[keys[keys.length - 1]];
      return newConfig;
    });
  };

  // Render nested config editor
  const renderConfigEditor = (obj, configType, parentPath = '', level = 0) => {
    // Special handling for outputConfig usage array
    if (configType === 'output' && parentPath === 'usage' && Array.isArray(obj)) {
      return obj.map((item, index) => {
        const currentPath = `usage.${index}`;
        return (
          <div key={currentPath} className="border p-4 rounded-md bg-white mb-4">
            <h4 className="font-medium text-gray-700 mb-4">Usage Configuration</h4>
            <div className="space-y-4 mt-2">
              {/* Token fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prompt Tokens Path</label>
                  <input
                    type="text"
                    value={item.prompt_tokens}
                    onChange={(e) => handleOutputConfigChange(`${currentPath}.prompt_tokens`, e.target.value, 'string')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Completion Tokens Path</label>
                  <input
                    type="text"
                    value={item.completion_tokens}
                    onChange={(e) => handleOutputConfigChange(`${currentPath}.completion_tokens`, e.target.value, 'string')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Total Tokens Path</label>
                  <input
                    type="text"
                    value={item.total_tokens}
                    onChange={(e) => handleOutputConfigChange(`${currentPath}.total_tokens`, e.target.value, 'string')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Cached Tokens Path</label>
                  <input
                    type="text"
                    value={item.cached_tokens}
                    onChange={(e) => handleOutputConfigChange(`${currentPath}.cached_tokens`, e.target.value, 'string')}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Cost fields */}
              <div className="border-t pt-4 mt-4">
                <h5 className="font-medium text-gray-700 mb-3">Cost Configuration</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Input Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.total_cost.input_cost}
                      onChange={(e) => handleOutputConfigChange(`${currentPath}.total_cost.input_cost`, e.target.value, 'number')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Output Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.total_cost.output_cost}
                      onChange={(e) => handleOutputConfigChange(`${currentPath}.total_cost.output_cost`, e.target.value, 'number')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Cached Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.total_cost.cached_cost}
                      onChange={(e) => handleOutputConfigChange(`${currentPath}.total_cost.cached_cost`, e.target.value, 'number')}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });
    }

    // Regular rendering for other cases
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      const valueType = getValueType(value);
      const isNested = valueType === 'object' && !Array.isArray(value);
      
      // Skip rendering for usage array items as they're handled separately
      if (configType === 'output' && currentPath === 'usage') {
        return renderConfigEditor(value, configType, currentPath, level);
      }
      
      return (
        <div key={currentPath} className={`border-l-2 border-gray-200 pl-4 mb-4 ${level > 0 ? 'ml-4' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-700">{key}</span>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {valueType}
              </span>
            </div>
            {configType !== 'output' && (
              <button
                onClick={() => removeConfigKey(configType, currentPath)}
                className="text-red-500 hover:text-red-700 text-sm"
                title="Remove key"
              >
                ×
              </button>
            )}
          </div>
          
          {!isNested ? (
            <div className="mb-2">
              {valueType === 'boolean' ? (
                <select
                  value={value.toString()}
                  onChange={(e) => {
                    const handler = configType === 'input' ? handleInputConfigChange : handleOutputConfigChange;
                    handler(currentPath, e.target.value, 'boolean');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              ) : valueType === 'array' ? (
                <textarea
                  value={JSON.stringify(value)}
                  onChange={(e) => {
                    const handler = configType === 'input' ? handleInputConfigChange : handleOutputConfigChange;
                    handler(currentPath, e.target.value, 'array');
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Enter JSON array or comma-separated values"
                />
              ) : (
                <input
                  type={valueType === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => {
                    const handler = configType === 'input' ? handleInputConfigChange : handleOutputConfigChange;
                    handler(currentPath, e.target.value, valueType);
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step={valueType === 'number' ? '0.01' : undefined}
                />
              )}
            </div>
          ) : (
            <div className="mb-4">
              {renderConfigEditor(value, configType, currentPath, level + 1)}
              {configType !== 'output' && (
                <button
                  onClick={() => addConfigKey(configType, currentPath)}
                  className="mt-2 px-3 py-1 text-xs bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Add Nested Key
                </button>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  const addOption = (key) => {
    const fieldConfig = config.configuration[key];
    const newOption = fieldConfig.options[0] && typeof fieldConfig.options[0] === 'object' 
      ? { type: 'new_option' } 
      : 'new_option';
    
    handleConfigChange(key, 'options', [...fieldConfig.options, newOption]);
  };

  const updateOption = (key, optionIndex, newValue) => {
    const fieldConfig = config.configuration[key];
    const updatedOptions = [...fieldConfig.options];
    
    if (typeof updatedOptions[optionIndex] === 'object') {
      updatedOptions[optionIndex] = { type: newValue };
    } else {
      updatedOptions[optionIndex] = newValue;
    }
    
    handleConfigChange(key, 'options', updatedOptions);
  };

  const removeOption = (key, optionIndex) => {
    const fieldConfig = config.configuration[key];
    const updatedOptions = fieldConfig.options.filter((_, index) => index !== optionIndex);
    handleConfigChange(key, 'options', updatedOptions);
  };

  const generateJsonOutput = () => {
    const selectedConfig = selectedKeys.reduce((acc, key) => {
      if (config.configuration[key]) {
        acc[key] = config.configuration[key];
      }
      return acc;
    }, {});

    const result = {
      configuration: selectedConfig,
      service: config.service,
      model_name: config.model_name,
      specification: config.specification,
      inputConfig: config.inputConfig || {},
      outputConfig: config.outputConfig || {}
    };

    return JSON.stringify(result, null, 2);
  };

  const renderDropdownControls = (key, fieldConfig) => {
    if (!selectedKeys.includes(key)) return null;



    return (
      <div className="mt-3 p-4 bg-gray-50 border rounded-md">
        {/* Level display */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
          <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-500">
            Level {fieldConfig.level || 0}
          </div>
        </div>

        {/* Field specific controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Min Value */}
          {fieldConfig.hasOwnProperty('min') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={fieldConfig.min}
                onChange={(e) => handleConfigChange(key, 'min', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Max Value */}
          {fieldConfig.hasOwnProperty('max') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={fieldConfig.max}
                onChange={(e) => handleConfigChange(key, 'max', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Default Value */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Default Value
            </label>
            {fieldConfig.field === 'boolean' ? (
              <select
                value={fieldConfig.default.toString()}
                onChange={(e) => handleConfigChange(key, 'default', e.target.value === 'true')}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            ) : fieldConfig.field === 'dropdown' || fieldConfig.field === 'select' ? (
              <select
                value={typeof fieldConfig.default === 'object' ? JSON.stringify(fieldConfig.default) : fieldConfig.default}
                onChange={(e) => {
                  try {
                    const parsedValue = JSON.parse(e.target.value);
                    handleConfigChange(key, 'default', parsedValue);
                  } catch {
                    handleConfigChange(key, 'default', e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fieldConfig.options?.map((option, index) => (
                  <option 
                    key={index} 
                    value={typeof option === 'object' ? JSON.stringify(option) : option}
                  >
                    {typeof option === 'object' ? option.type : option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={fieldConfig.field === 'number' ? 'number' : 'text'}
                value={fieldConfig.default}
                onChange={(e) => {
                  const value = fieldConfig.field === 'number' ? parseFloat(e.target.value) : e.target.value;
                  handleConfigChange(key, 'default', value);
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          {/* Step Value for sliders */}
          {fieldConfig.hasOwnProperty('step') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Step Value
              </label>
              <input
                type="number"
                step="0.01"
                value={fieldConfig.step}
                onChange={(e) => handleConfigChange(key, 'step', parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Options Management for dropdown/select fields */}
        {(fieldConfig.field === 'dropdown' || fieldConfig.field === 'select') && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-xs font-medium text-gray-600">
                Manage Options
              </label>
              <button
                type="button"
                onClick={() => addOption(key)}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Option
              </button>
            </div>
            <div className="space-y-2">
              {fieldConfig.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={typeof option === 'object' ? option.type : option}
                    onChange={(e) => updateOption(key, index, e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Option value"
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(key, index)}
                    className="px-2 py-2 text-xs bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Remove option"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSelectableKeys = () => {
    return Object.keys(config.configuration).map((key) => {
      const fieldConfig = config.configuration[key];
      return (
        <div key={key} className="mb-4 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={selectedKeys.includes(key)}
              onChange={() => handleSelectKey(key)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">{key.replace(/_/g, ' ')}</span>
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {fieldConfig.field}
            </span>
          </div>
          {renderDropdownControls(key, fieldConfig)}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Generate Model Configuration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Customize your LLM model parameters and generate the configuration JSON
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {['service', 'keys', 'specification', 'inputConfig', 'outputConfig', 'json'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab === 'keys' ? 'Keys' : 
                   tab === 'inputConfig' ? 'Input Config' :
                   tab === 'outputConfig' ? 'Output Config' :
                   tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="px-6 py-8">
            {activeTab === 'keys' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Configuration Keys</h3>
                  <div className="text-sm text-gray-500">
                    {selectedKeys.length} of {Object.keys(config.configuration).length} selected
                  </div>
                </div>
                <div className="space-y-4">
                  {renderSelectableKeys()}
                </div>
              </div>
            )}
            {activeTab === 'service' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Select Service</h3>
                  <div className="flex space-x-2">
                    <select
                      value={config.service}
                      onChange={(e) => handleServiceChange(e.target.value)}
                      className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white"
                    >
                      {['openai', 'anthropic', 'openai_response', 'groq', 'open_router'].map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specification' && (
              <div className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Input Cost</label>
                      <input
                        type="number"
                        value={config.specification.input_cost}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          specification: { ...prev.specification, input_cost: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Output Cost</label>
                      <input
                        type="number"
                        value={config.specification.output_cost}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          specification: { ...prev.specification, output_cost: parseFloat(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={config.specification.description}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        specification: { ...prev.specification, description: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Knowledge Cutoff</label>
                    <input
                      type="text"
                      value={config.specification.knowledge_cutoff}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        specification: { ...prev.specification, knowledge_cutoff: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Use Cases</label>
                    <textarea
                      value={config.specification.usecase.join('\n')}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        specification: { ...prev.specification, usecase: e.target.value.split('\n').filter(Boolean) }
                      }))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter use cases (one per line)"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'inputConfig' && (
              <div className="p-6">
                <div className="mb-4">
                  {renderConfigEditor(config.inputConfig || {}, 'input')}
                </div>
              </div>
            )}

            {activeTab === 'outputConfig' && (
              <div className="p-6">
                <div className="mb-4">
                  {renderConfigEditor(config.outputConfig || {}, 'output')}
                </div>
              </div>
            )}

            {activeTab === 'json' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">JSON Output</h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(outputJson)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Copy to Clipboard
                  </button>
                </div>
                <div className="bg-gray-800 p-4 rounded-md">
                  <pre className="text-green-400 text-xs overflow-auto">
                    {outputJson}
                  </pre>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async (event) => {
                event.preventDefault();
                try {
                  const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/modelConfiguration`, config);
                  if(response.status === 200) {
                    toast.success('Configuration saved successfully');
                    console.log('Configuration saved:', response.data);
                  }
                } catch (error) {
                  console.error('Error saving configuration:', error);
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}