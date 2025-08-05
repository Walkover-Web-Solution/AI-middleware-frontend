"use client";
import React, { useState, useEffect } from "react";
import { CloseIcon, CopyIcon, CheckCircleIcon } from "@/components/Icons";
import { Save } from "lucide-react";
import { generateGtwyAccessTokenAction } from '@/store/action/orgAction';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateIntegrationDataAction } from "@/store/action/integrationAction";
import GenericTable from "../table/table";

// Configuration Schema - easily extensible
const CONFIG_SCHEMA = [
  {
    key: 'hideHomeButton',
    type: 'toggle',
    label: 'Hide Home Button',
    description: 'Removes the home navigation button',
    defaultValue: false,
    section: 'Interface Options'
  },
  {
    key: 'showGuide',
    type: 'toggle',
    label: 'Show Guide',
    description: 'Display helpful user guides',
    defaultValue: false,
    section: 'Interface Options'
  },
  {
    key: 'showAgentTypeOnCreateAgent',
    type: 'toggle',
    label: 'Show Agent Type on Create Agent',
    description: 'Display agent type on create agent',
    defaultValue: true,
    section: 'Interface Options'
  },
  {
    key: 'showHistory',
    type: 'toggle',
    label: 'Show History',
    description: 'Display conversation history',
    defaultValue: false,
    section: 'Interface Options'
  },
  {
    key: 'showConfigType',
    type: 'toggle',
    label: 'Show Config Type',
    description: 'Show configuration type indicators',
    defaultValue: false,
    section: 'Interface Options'
  },
  {
    key: 'slide',
    type: 'select',
    label: 'Slide Position',
    description: 'Choose where GTWY appears on screen',
    defaultValue: 'right',
    options: [
      { value: 'left', label: 'Left' },
      { value: 'right', label: 'Right' },
      { value: 'full', label: 'Full' }
    ],
    section: 'Display Settings'
  },
  {
    key: 'defaultOpen',
    type: 'toggle',
    label: 'Default Open',
    description: 'Open GTWY automatically on page load',
    defaultValue: false,
    section: 'Display Settings'
  },
  {
    key: 'hideFullScreenButton',
    type: 'toggle',
    label: 'Hide Full Screen',
    description: 'Remove the full screen toggle button',
    defaultValue: false,
    section: 'Display Settings'
  },
  {
    key: 'hideCloseButton',
    type: 'toggle',
    label: 'Hide Close Button',
    description: 'Remove the close button',
    defaultValue: false,
    section: 'Display Settings'
  },
  {
    key: 'hideHeader',
    type: 'toggle',
    label: 'Hide Header',
    description: 'Hide the header section completely',
    defaultValue: false,
    section: 'Display Settings'
  },
];

// Generic Input Component
const ConfigInput = ({ config, value, onChange }) => {
  const { key, type, label, description, options } = config;

  const renderInput = () => {
    switch (type) {
      case 'toggle':
        return (
          <input 
            type="checkbox" 
            className="toggle toggle-primary toggle-sm" 
            checked={value || false}
            onChange={(e) => onChange(key, e.target.checked)}
          />
        );
      
      case 'select':
        return (
          <select 
            className="select select-bordered select-primary w-full select-sm" 
            value={value || config.defaultValue}
            onChange={(e) => onChange(key, e.target.value)}
          >
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="form-control bg-base-200 rounded p-2">
      <label className={`label ${type === 'toggle' ? 'cursor-pointer' : ''} py-1`}>
        <span className="label-text text-sm">{label}</span>
        {type === 'toggle' && renderInput()}
      </label>
      {type !== 'toggle' && (
        <div className="mt-1">
          {renderInput()}
        </div>
      )}
      <p className="text-xs text-base-content/70 mt-1 pl-2">{description}</p>
    </div>
  );
};

// Configuration Section Component
const ConfigSection = ({ title, configs, configuration, onChange }) => {
  return (
    <div className="space-y-2">
      <h5 className="text-sm font-semibold text-primary border-b border-base-300 pb-1">
        {title}
      </h5>
      <div className="space-y-2">
        {configs.map((config) => (
          <ConfigInput
            key={config.key}
            config={config}
            value={configuration[config.key]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  );
};

function GtwyIntegrationGuideSlider({ data, handleCloseSlider }) {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState({ 
    accessKey: false, 
    jwtToken: false, 
    script: false, 
    functions: false, 
    interfaceData: false, 
    eventListener: false 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Get config from Redux store
  const config = useCustomSelector((state) => 
    state?.integrationReducer?.integrationData?.[data?.org_id]?.find((f)=> f.folder_id === data?.folder_id)?.config
  );
  
  // Generate initial config from schema
  const generateInitialConfig = () => {
    const initialConfig = {};
    CONFIG_SCHEMA.forEach(item => {
      initialConfig[item.key] = item.defaultValue;
    });
    return initialConfig;
  };
  
  // Initialize configuration state
  const [configuration, setConfiguration] = useState(() => {
    const defaultConfig = generateInitialConfig();
    // Merge default config with existing config from Redux
    return config ? { ...defaultConfig, ...config } : defaultConfig;
  });
  
  const gtwyAccessToken = useCustomSelector((state) =>
    state?.userDetailsReducer?.organizations?.[data?.org_id]?.meta?.gtwyAccessToken || ""
  );

  // Update configuration when config from Redux changes
  useEffect(() => {
    if (config) {
      const defaultConfig = generateInitialConfig();
      setConfiguration(prevConfig => ({ ...defaultConfig, ...config }));
    }
  }, [config]);

  useEffect(() => {
    if (data) {
      setIsOpen(true);
      const sidebar = document.getElementById("gtwy-integration-slider");
      if (sidebar) {
        sidebar.classList.remove('translate-x-full');
      }
    }
  }, [data]);

  const handleClose = () => {
    setIsOpen(false);
    handleCloseSlider();
  };

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleGenerateAccessKey = () => {
    dispatch(generateGtwyAccessTokenAction(data?.org_id))
  };

  const handleConfigurationSave = async () => {
    setIsSaving(true);
    try {
      const dataToSend = {
        folder_id: data?.folder_id,
        orgId: data?.org_id,
        config: configuration
      }
      await dispatch(updateIntegrationDataAction(data?.org_id, dataToSend));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfigChange = (key, value) => {
    setConfiguration(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Check if configuration has changed from the initial Redux config
  const isConfigChanged = () => {
    const defaultConfig = generateInitialConfig();
    const originalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
    return JSON.stringify(configuration) !== JSON.stringify(originalConfig);
  };

  // Group configs by section
  const groupedConfigs = CONFIG_SCHEMA.reduce((groups, config) => {
    const section = config.section || 'General';
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(config);
    return groups;
  }, {});

  const CopyButton = ({ data, onCopy, copied: isCopied }) => (
    <button
      onClick={onCopy}
      className={`btn btn-sm btn-ghost absolute top-2 right-2 text-base-100 ${isCopied ? 'btn-success' : ''}`}
    >
      {isCopied ? <CheckCircleIcon size={16} /> : <CopyIcon size={16} />}
      {isCopied ? 'Copied!' : 'Copy'}
    </button>
  );

  const jwtPayload = `{
  "org_id": "${data?.org_id}",
  "folder_id": "${data?.folder_id}",
  "user_id": "Your_user_id"
}`;

  const integrationScript = `<script
    id="gtwy-main-script"
    embedToken="Your embed token"
    src="https://app.gtwy.ai/gtwy.js"
    parentId="${configuration.parentId || 'Your_parent_id'}"
    agent_id= 'Your_agent_id'
    agent_name= 'Your_agent_name'
   ></script>`;

  const helperFunctions = `window.openGtwy() //To open GTWY;
window.closeGtwy() //To Close GTWY;
window.openGtwy({"agent_id":"your gtwy agentid"}); // Open GTWY with specific agent
window.openGtwy({"agent_name":"your gtwy agent name"}); // Create agent with specific name`;


  const interfaceData = `// Configure UI elements
window.GtwyEmbed.sendDataToGtwy({
    agent_name: "New Agent",  // Create bridge with agent name
    agent_id: "your_agent_id" // Redirect to specific agent
});`;

  const eventListenerScript = `<script>
window.addEventListener('message', (event) => {
    if (event.data.type === 'gtwy') {
        console.log('Received gtwy event:', event.data);
    }
});
</script>`;

const metaUpdateScript = `
window.openGtwy(
    "your_agent_id",
    {
      "meta_data": "your_meta_data"
    }
);
`;

const getDataUsingUserId = () => {
  return `curl --location '${process.env.NEXT_PUBLIC_SERVER_URL}/gtwyEmbed/:user_id' \
--header 'pauthkey: \''your_pauth_key'\'''`
}

const tableData = [
  ['parentId', 'To open GTWY in a specific container'],
   ['agent_id', 'To open agent in a specific agent'],
   ['agent_name', 'To create an agent with a specific name, or redirect if the agent already exists.']
]
const tableHeaders = ['Key', 'Description'];

  return (
    <aside
      id="gtwy-integration-slider"
      className={`sidebar-container fixed z-very-high flex flex-col top-0 right-0 p-4 w-full md:w-[60%] lg:w-[70%] xl:w-[80%] 2xl:w-[70%] opacity-100 h-screen bg-base-200 transition-all overflow-auto duration-300 border-l ${isOpen ? '' : 'translate-x-full'}`}
      aria-label="Integration Guide Slider"
    >
      <div className="flex flex-col w-full gap-4">
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="font-bold text-lg">Integration Setup</h3>
          <CloseIcon
            className="cursor-pointer hover:text-error transition-colors"
            onClick={handleClose}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Left Column - Configuration Form */}
          <div className="space-y-2 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide mb-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-3">
                <h4 className="card-title text-primary text-base mb-0">Configuration Settings</h4>
                <p className="text-xs text-base-content/70">Customize how GTWY appears and behaves in your application</p>
                
                <div className="space-y-4 mt-2">
                  {/* Dynamically render sections */}
                  {Object.entries(groupedConfigs).map(([sectionName, configs]) => (
                    <div key={sectionName}>
                      <ConfigSection
                        title={sectionName}
                        configs={configs}
                        configuration={configuration}
                        onChange={handleConfigChange}
                      />
                      {sectionName !== Object.keys(groupedConfigs)[Object.keys(groupedConfigs).length - 1] && (
                        <div className="divider my-2"></div>
                      )}
                    </div>
                  ))}

                  {/* Save Button */}
                  <div className="divider my-2"></div>
                  <button 
                    onClick={handleConfigurationSave}
                    className={`btn btn-primary btn-sm w-full gap-2 ${(!isConfigChanged() || isSaving) ? 'btn-disabled' : ''}`}
                    disabled={!isConfigChanged() || isSaving}
                  >
                    <Save size={14} />
                    {isSaving ? 'Saving...' : isConfigChanged() ? 'Save Configuration' : 'No Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Generated Scripts */}
          <div className="space-y-6 overflow-y-auto h-[calc(100vh-100px)] scrollbar-hide mb-4">
            {/* Script Integration */}
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h4 className="card-title text-base">Step 1: Connect Integration</h4>
                <div className="space-y-6">
                  {/* JWT Payload */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">JWT Payload</span>
                    </label>
                    <div className="relative">
                      <div className="mockup-code">
                        <pre data-prefix=">">
                          <code className="text-error">org_id=</code>
                          <code className="text-warning">{data?.org_id}</code>
                        </pre>
                        <pre data-prefix=">">
                          <code className="text-error">folder_id=</code>
                          <code className="text-warning">{data?.folder_id}</code>
                        </pre>
                        <pre data-prefix=">">
                          <code className="text-error">user_id=</code>
                          <code className="text-warning">"Your_user_id"</code>
                        </pre>
                      </div>
                      <CopyButton
                        data={jwtPayload}
                        onCopy={() => handleCopy(jwtPayload, 'jwtToken')}
                        copied={copied.jwtToken}
                      />
                    </div>
                  </div>

                  {/* Access Token */}
                  <div className="form-control">
                    <label className="label flex flex-col items-start space-y-1">
                      <span className="label-text font-medium">Access Token (Signed with RS256)</span>
                    </label>

                    <div className="text-sm text-base-content/70 leading-relaxed ml-1">
                      RS256 is an asymmetric signing algorithm defined in
                      <a
                        href="https://datatracker.ietf.org/doc/html/rfc7518#section-3.1"
                        className="text-blue-600 underline ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        RFC 7518
                      </a>
                    </div>

                    {gtwyAccessToken ? (
                      <div className="relative mt-3">
                        <div className="mockup-code">
                          <pre data-prefix=">">
                            <code className="text-error">Access Token: </code>
                            <code className="text-warning">{gtwyAccessToken}</code>
                          </pre>
                        </div>
                        <CopyButton
                          data={gtwyAccessToken}
                          onCopy={() => handleCopy(gtwyAccessToken, 'accessKey')}
                          copied={copied.accessKey}
                        />
                      </div>
                    ) : (
                      <button
                        onClick={handleGenerateAccessKey}
                        className="btn btn-primary btn-sm w-56 mt-3"
                      >
                        Show Access Key
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>


            <div className="card bg-base-100 border">
              <div className="card-body">
                <h4 className="card-title text-base">Step 2: Add Script</h4>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Add this script tag to your HTML</span>
                  </label>
                  <div className="relative">
                    <div className="mockup-code">
                      <pre data-prefix=">"><code className="text-error">&lt;script</code></pre>
                      <pre data-prefix=">"><code className="text-error">  id=</code><code className="text-warning">"gtwy-main-script"</code></pre>
                      <pre data-prefix=">"><code className="text-error">  embedToken=</code><code className="text-warning">"Your embed token"</code></pre>
                      <pre data-prefix=">"><code className="text-error">  src=</code><code className="text-warning">"https://app.gtwy.ai/gtwy.js"</code></pre>
                      <pre data-prefix=">"><code className="text-error">  parentId=</code><code className="text-warning">"{'Your_parent_id'}"</code></pre>
                      <pre data-prefix=">"><code className="text-error">  agent_id=</code><code className="text-warning">"{'Your_agent_id'}"</code></pre>
                      <pre data-prefix=">"><code className="text-error">  agent_name=</code><code className="text-warning">"{'Your_agent_name'}"</code></pre>
                      <pre data-prefix=">"><code className="text-error">&gt;&lt;/script&gt;</code></pre>
                    </div>
                    <CopyButton
                      data={integrationScript}
                      onCopy={() => handleCopy(integrationScript, 'script')}
                      copied={copied.script}
                    />
                  </div>
                </div>
                <GenericTable data={tableData} headers={tableHeaders}/>
              </div>
            </div>

            {/* Interface Configuration */}
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h4 className="card-title text-base">Configure Interface</h4>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Send Data to GTWY</span>
                  </label>
                  <div className="relative">
                    <div className="mockup-code">
                      <pre data-prefix=">"><code className="text-error">  window.GtwyEmbed.sendDataToGtwy({`{`}</code></pre>
                      <pre data-prefix=">"><code className="text-error">    agent_name: </code><code className="text-warning">"New Agent"</code><code>{", // Create bridge with agent name"}</code></pre>
                      <pre data-prefix=">"><code className="text-error">    agent_id: </code><code className="text-warning">"your_agent_id"</code><code>{" // Redirect to specific agent"}</code></pre>
                      <pre data-prefix=">"><code className="text-error">  {`});`}</code></pre>
                    </div>
                    <CopyButton
                      data={interfaceData}
                      onCopy={() => handleCopy(interfaceData, 'interfaceData')}
                      copied={copied.interfaceData}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Functions */}
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h4 className="card-title text-base">Step 3: Integration Functions</h4>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Available Functions</span>
                  </label>
                  <div className="relative">
                    <div className="mockup-code">
                      <pre data-prefix=">"><code className="text-warning">  window.openGtwy()</code><code>{" //To open GTWY"}</code></pre>
                      <pre data-prefix=">"><code className="text-warning">  window.closeGtwy()</code><code>{" //To Close GTWY"}</code></pre>
                      <pre data-prefix=">"><code className="text-warning">  window.openGtwy({`{"agent_id":"your gtwy agentid"}`})</code><code>{" // Open GTWY with specific agent"}</code></pre>
                      <pre data-prefix=">"><code className="text-warning">  window.openGtwy({`{"agent_name":"your agent name"}`})</code><code>{" // Create agent with specific name"}</code></pre>
                    </div>
                    <CopyButton
                      data={helperFunctions}
                      onCopy={() => handleCopy(helperFunctions, 'functions')}
                      copied={copied.functions}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 border mt-4">
                <div className="card-body">
                  <h4 className="card-title text-base">Add Meta Data</h4>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Use this script to add meta data to GTWY </span>
                    </label>
                    <div className="relative">
                      <div className="mockup-code">
                        <pre data-prefix=">"><code className="text-error">  window.GtwyEmbed.openGtwy({`{"agent_id":"your gtwy agentid" , "meta": {"meta_data": "your_meta_data"}}`})</code></pre>
                      </div>
                      <CopyButton
                        data={metaUpdateScript}
                        onCopy={() => handleCopy(metaUpdateScript, 'metaUpdate')}
                        copied={copied.metaUpdate}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 border mt-4">
                <div className="card-body">
                  <h4 className="card-title text-base">Get Agent Data Using User ID</h4>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Use this script to get data using user id</span>
                    </label>
                    <div className="relative">
                      <div className="mockup-code">
                        <pre data-prefix=">"><code className="text-error">  {getDataUsingUserId()}</code></pre>
                      </div>
                      <p className="text-sm text-gray-600 mt-4">
                        Note: Pass <code>agent_id="your_agent_id"</code> in the params if you want to get the data of specific agent.
                      </p>
                      <CopyButton
                        data={getDataUsingUserId()}
                        onCopy={() => handleCopy(getDataUsingUserId(), 'getDataUsingUserId')}
                        copied={copied.getDataUsingUserId}
                      />
                    </div>
                  </div>
                </div>
              </div>

            {/* Event Listener */}
            <div className="card bg-base-100 border">
              <div className="card-body">
                <h4 className="card-title text-base">Add Event Listener</h4>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Add this script to receive GTWY events</span>
                  </label>
                  <div className="relative">
                    <div className="mockup-code">
                      <pre data-prefix=">"><code className="text-error">&lt;script&gt;</code></pre>
                      <pre data-prefix=">"><code className="text-error">  window.addEventListener('message', (event) =&gt; {`{`}</code></pre>
                      <pre data-prefix=">"><code className="text-error">    if (event.data.type === 'gtwy') {`{`}</code></pre>
                      <pre data-prefix=">"><code className="text-error">      console.log('Received gtwy event:', event.data);</code></pre>
                      <pre data-prefix=">"><code className="text-error">    {`}`}</code></pre>
                      <pre data-prefix=">"><code className="text-error">  {`});`}</code></pre>
                      <pre data-prefix=">"><code className="text-error">&lt;/script&gt;</code></pre>
                    </div>
                    <CopyButton
                      data={eventListenerScript}
                      onCopy={() => handleCopy(eventListenerScript, 'eventListener')}
                      copied={copied.eventListener}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default GtwyIntegrationGuideSlider;
