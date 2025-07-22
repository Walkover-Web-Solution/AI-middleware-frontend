"use client";
import React, { useState, useEffect } from "react";
import { CloseIcon, CopyIcon, CheckCircleIcon } from "@/components/Icons";
import { generateGtwyAccessTokenAction } from '@/store/action/orgAction';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customHooks/customSelector';
import CopyButton from "../copyButton/copyButton";


function GtwyIntegrationGuideSlider({ data, handleCloseSlider }) {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState({ accessKey: false, jwtToken: false, script: false, functions: false, interfaceData: false, eventListener: false });
  const [isOpen, setIsOpen] = useState(false);
  
  const gtwyAccessToken = useCustomSelector((state) =>
    state?.userDetailsReducer?.organizations?.[data?.org_id]?.meta?.gtwyAccessToken || ""
  );

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

 

  const jwtPayload = `{
  "org_id": "${data?.org_id}",
  "folder_id": "${data?.folder_id}",
  "user_id": "Your_user_id"
  }`;

  const integrationScript = `<script
    id="gtwy-main-script"
    embedToken="Your embed token"
    src="https://app.gtwy.ai/gtwy.js"
    slide="left/right/full /* adjust the position of the gtwy */"
    defaultOpen="true /* open by default */"
    parentId="Your_parent_id /* parent id of the element where the gtwy will be embedded */"
    hideFullScreenButton: true, /* Hide full-screen button */
    hideCloseButton: true,    /* Hide close button */
    hideHeader: true,         /* Hide header */
   ></script>`;

  const helperFunctions = `  window.openGtwy() //To open GTWY;
    window.closeGtwy() //To Close GTWY;
    window.openGtwy({"agent_id":"your gtwy agentid"}); // Open GTWY with specific agent`;

  const interfaceData = `// Configure UI elements
    window.GtwyEmbed.sendDataToGtwy({
        hideHomeButton: true,      // Hide home button
        showGuide: false,         // Hide agent guide
        showConfigType: false,    // Hide chatbot and config types
        agent_name: "New Agent",  // Create bridge with agent name
        agent_id: "your_agent_id" // Redirect to specific agent
    });`;

  const eventListenerScript = `  <script>
    window.addEventListener('message', (event) => {
        if (event.data.type === 'gtwy') {
            console.log('Received gtwy event:', event.data);
        }
    });
    </script>`;

  return (
    <aside
    id="gtwy-integration-slider"
    className={`sidebar-container fixed z-very-high flex flex-col top-0 right-0 p-4 w-full md:w-1/2 lg:w-1/2 opacity-100 h-screen bg-base-200 transition-all duration-300 border-l overflow-y-auto ${isOpen ? '' : 'translate-x-full'}`}
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

      <div className="space-y-6">
        {/* Step 1: JWT Configuration */}
        <div className="card bg-base-100 border">
          <div className="card-body">
            <h4 className="card-title text-base">Step 1: Connect Integration</h4>
            <div className="space-y-4">
              {/* JWT Payload */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">JWT Payload</span>
                </label>
                <div className="relative">
                  <div className="mockup-code">
                    <pre data-prefix=">"><code className="text-error">org_id=</code><code className="text-warning">{data?.org_id}</code></pre>
                    <pre data-prefix=">"><code className="text-error">folder_id=</code><code className="text-warning">{data?.folder_id}</code></pre>
                    <pre data-prefix=">"><code className="text-error">user_id=</code><code className="text-warning">"Your_user_id"</code></pre>
                  </div>
                  <CopyButton  data={jwtPayload} />
                </div>
              </div>

              {/* Access Token */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">JWT Access Token</span>
                </label>
                {gtwyAccessToken ? (
                  <div className="relative">
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
                    className="btn btn-primary btn-sm"
                  >
                    Generate JWT Access Token
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Script Integration */}
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
                  <pre data-prefix=">"><code className="text-error">  slide=</code><code className="text-warning">"left/right/full"</code></pre>
                  <pre data-prefix=">"><code className="text-error">  defaultOpen=</code><code className="text-warning">"true"</code></pre>
                  <pre data-prefix=">"><code className="text-error">  parentId=</code><code className="text-warning">"Your_parent_id"</code></pre>
                  <pre data-prefix=">"><code className="text-error">  hideFullScreenButton=</code><code className="text-warning">"true"</code></pre>
                  <pre data-prefix=">"><code className="text-error">  hideCloseButton=</code><code className="text-warning">"true"</code></pre>
                  <pre data-prefix=">"><code className="text-error">  hideHeader=</code><code className="text-warning">"true"</code></pre>
                  <pre data-prefix=">"><code className="text-error">&gt;&lt;/script&gt;</code></pre>
                </div>
                <CopyButton
                  data={integrationScript}
                  onCopy={() => handleCopy(integrationScript, 'script')}
                  copied={copied.script}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Helper Functions */}
        <div className="card bg-base-100 border">
          <div className="card-body">
            <h4 className="card-title text-base">Step 3: Integration Functions</h4>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Available Functions</span>
              </label>
              <div className="relative">
                <div className="mockup-code">
                  <pre data-prefix=">"><code className="text-warning">window.openGtwy()</code><code>{" //To open GTWY"}</code></pre>
                  <pre data-prefix=">"><code className="text-warning">window.closeGtwy()</code><code>{" //To Close GTWY"}</code></pre>
                  <pre data-prefix=">"><code className="text-warning">window.openGtwy({`{"agent_id":"your gtwy agentid"}`})</code><code>{" // Open GTWY with specific agent"}</code></pre>
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

        {/* Step 4: Interface Configuration */}
        <div className="card bg-base-100 border">
          <div className="card-body">
            <h4 className="card-title text-base">Configure Interface</h4>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Send Data to GTWY</span>
              </label>
              <div className="relative">
                <div className="mockup-code">
                  <pre data-prefix=">"><code className="text-error">window.GtwyEmbed.sendDataToGtwy({`{`}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  hideHomeButton: </code><code className="text-warning">true</code><code>{", // Hide home button"}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  showGuide: </code><code className="text-warning">false</code><code>{", // Hide agent guide"}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  showConfigType: </code><code className="text-warning">false</code><code>{", // Hide chatbot and config types"}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  agent_name: </code><code className="text-warning">"New Agent"</code><code>{", // Create bridge with agent name"}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  agent_id: </code><code className="text-warning">"your_agent_id"</code><code>{" // Redirect to specific agent"}</code></pre>
                  <pre data-prefix=">"><code className="text-error">{`});`}</code></pre>
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

        {/* Step 5: Event Listener */}
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
                  <pre data-prefix=">"><code className="text-error">window.addEventListener('message', (event) =&gt; {`{`}</code></pre>
                  <pre data-prefix=">"><code className="text-error">  if (event.data.type === 'gtwy') {`{`}</code></pre>
                  <pre data-prefix=">"><code className="text-error">    console.log('Received gtwy event:', event.data);</code></pre>
                  <pre data-prefix=">"><code className="text-error">  {`}`}</code></pre>
                  <pre data-prefix=">"><code className="text-error">{`});`}</code></pre>
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
  </aside>
  );
}

export default GtwyIntegrationGuideSlider;