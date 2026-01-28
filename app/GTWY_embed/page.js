"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const GTWYEmbedTester = () => {
  const scriptRef = useRef(null);
  const [embedToken, setEmbedToken] = useState("");
  const [isEmbedLoaded, setIsEmbedLoaded] = useState(false);
  const [eventLogs, setEventLogs] = useState([]);
  const eventLogRef = useRef(null);

  // Modal states
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentIdInput, setAgentIdInput] = useState("");
  const [metaInput, setMetaInput] = useState("");
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [agentPurpose, setAgentPurpose] = useState("");
  const [showAgentNameModal, setShowAgentNameModal] = useState(false);
  const [agentNameInput, setAgentNameInput] = useState("");
  const [showSendDataModal, setShowSendDataModal] = useState(false);
  const [sendDataAgentName, setSendDataAgentName] = useState("");
  const [sendDataAgentId, setSendDataAgentId] = useState("");
  const [showGetAgentsModal, setShowGetAgentsModal] = useState(false);
  const [getAgentIdInput, setGetAgentIdInput] = useState("");
  const [agentsData, setAgentsData] = useState(null);

  const addLog = (type, message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    setEventLogs((prev) => [...prev, { timestamp, type, message, data }]);
  };

  useEffect(() => {
    if (eventLogRef.current) {
      eventLogRef.current.scrollTop = eventLogRef.current.scrollHeight;
    }
  }, [eventLogs]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type) {
        addLog("event", `Received: ${event.data.type}`, event.data);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const loadEmbed = () => {
    if (!embedToken.trim()) {
      toast.error("Please enter an embed token");
      return;
    }

    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }

    const script = document.createElement("script");
    script.id = "gtwy-main-script";
    script.src = "https://dev.gtwy.ai/gtwy_dev.js";
    script.setAttribute("embedToken", embedToken);
    script.setAttribute("parentId", "parent-container");

    script.onload = () => {
      setIsEmbedLoaded(true);
      addLog("success", "GTWY Embed loaded successfully");
      toast.success("GTWY Embed loaded successfully!");
    };

    script.onerror = () => {
      addLog("error", "Failed to load GTWY Embed");
      toast.error("Failed to load GTWY Embed");
      setIsEmbedLoaded(false);
    };

    document.body.appendChild(script);
    scriptRef.current = script;
    addLog("info", "Loading GTWY Embed script...");
  };

  const unloadEmbed = () => {
    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    if (window.GtwyEmbed) delete window.GtwyEmbed;
    if (window.openGtwy) delete window.openGtwy;
    if (window.closeGtwy) delete window.closeGtwy;
    setIsEmbedLoaded(false);
    addLog("info", "GTWY Embed unloaded");
    toast.info("GTWY Embed unloaded");
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (scriptRef.current) {
        scriptRef.current.remove();
      }
      if (window.GtwyEmbed) {
        delete window.GtwyEmbed;
      }
      if (window.openGtwy) {
        delete window.openGtwy;
      }
      if (window.closeGtwy) {
        delete window.closeGtwy;
      }
    };
  }, []);

  const openGtwy = () => {
    if (!isEmbedLoaded || !window.openGtwy) {
      toast.error("Please load the embed first");
      return;
    }
    window.openGtwy();
    addLog("action", "Called: window.openGtwy()");
  };

  const closeGtwy = () => {
    if (!isEmbedLoaded || !window.closeGtwy) {
      toast.error("Please load the embed first");
      return;
    }
    window.closeGtwy();
    addLog("action", "Called: window.closeGtwy()");
  };

  const openWithAgent = () => {
    if (!isEmbedLoaded) {
      toast.error("Please load the embed first");
      return;
    }
    setShowAgentModal(true);
  };

  const handleOpenAgent = () => {
    if (!agentIdInput.trim()) {
      toast.error("Please enter an Agent ID");
      return;
    }

    const params = { agent_id: agentIdInput.trim() };

    if (metaInput.trim()) {
      try {
        params.meta = JSON.parse(metaInput);
      } catch (e) {
        toast.error("Invalid JSON in meta field");
        return;
      }
    }

    if (window.openGtwy) {
      window.openGtwy(params);
      addLog("action", "Called: window.openGtwy() with params", params);
      setShowAgentModal(false);
      setAgentIdInput("");
      setMetaInput("");
    }
  };

  const createAgentWithPurpose = () => {
    if (!isEmbedLoaded) {
      toast.error("Please load the embed first");
      return;
    }
    setShowPurposeModal(true);
  };

  const handleCreateAgent = () => {
    if (!agentPurpose.trim()) {
      toast.error("Please enter agent purpose");
      return;
    }
    if (window.GtwyEmbed?.sendDataToGtwy) {
      window.GtwyEmbed.sendDataToGtwy({ agent_purpose: agentPurpose });
      addLog("action", `Called: sendDataToGtwy({ agent_purpose: "${agentPurpose}" })`);
      setShowPurposeModal(false);
      setAgentPurpose("");
    }
  };

  const createAgentWithName = () => {
    if (!isEmbedLoaded) {
      toast.error("Please load the embed first");
      return;
    }
    setShowAgentNameModal(true);
  };

  const handleCreateAgentWithName = () => {
    if (!agentNameInput.trim()) {
      toast.error("Please enter agent name");
      return;
    }
    if (window.openGtwy) {
      window.openGtwy({ agent_name: agentNameInput.trim() });
      addLog("action", `Called: window.openGtwy({ agent_name: "${agentNameInput}" })`);
      setShowAgentNameModal(false);
      setAgentNameInput("");
      toast.success("Creating agent with name");
    }
  };

  const openSendDataModal = () => {
    if (!isEmbedLoaded) {
      toast.error("Please load the embed first");
      return;
    }
    setShowSendDataModal(true);
  };

  const handleSendData = () => {
    if (!sendDataAgentName.trim() && !sendDataAgentId.trim()) {
      toast.error("Please enter at least agent name or agent ID");
      return;
    }

    const dataToSend = {};
    if (sendDataAgentName.trim()) {
      dataToSend.agent_name = sendDataAgentName.trim();
    }
    if (sendDataAgentId.trim()) {
      dataToSend.agent_id = sendDataAgentId.trim();
    }

    if (window.GtwyEmbed?.sendDataToGtwy) {
      window.GtwyEmbed.sendDataToGtwy(dataToSend);
      addLog("action", "Called: window.GtwyEmbed.sendDataToGtwy()", dataToSend);
      setShowSendDataModal(false);
      setSendDataAgentName("");
      setSendDataAgentId("");
      toast.success("Data sent to GTWY");
    }
  };

  const openGetAgentsModal = () => {
    if (!embedToken.trim()) {
      toast.error("Please enter an embed token first");
      return;
    }
    setShowGetAgentsModal(true);
  };

  const handleGetAgents = async () => {
    if (!embedToken.trim()) {
      toast.error("Please enter an embed token");
      return;
    }

    try {
      const url = new URL("https://db.gtwy.ai/api/embed/getAgents");
      if (getAgentIdInput.trim()) {
        url.searchParams.append("agent_id", getAgentIdInput.trim());
      }

      addLog("info", "Fetching agent data...", { url: url.toString() });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: embedToken.trim(),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAgentsData(data);
        addLog("success", "Agent data fetched successfully", data);
        toast.success("Agent data fetched successfully!");
      } else {
        addLog("error", "Failed to fetch agent data", data);
        toast.error(data.message || "Failed to fetch agent data");
      }
    } catch (error) {
      addLog("error", "Error fetching agent data", { error: error.message });
      toast.error("Error fetching agent data: " + error.message);
    }

    setShowGetAgentsModal(false);
    setGetAgentIdInput("");
  };

  return (
    <div className="h-screen bg-base-200 overflow-hidden flex flex-col">
      <div className="flex-none px-6 pt-4 pb-3 border-b border-base-300">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-base-content mb-1">GTWY Embed Tester</h1>
          <p className="text-sm text-base-content/70">Comprehensive testing interface for all GTWY embed features</p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Left Panel - Configuration & Controls */}
            <div className="lg:col-span-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100">
              <div className="space-y-3 pr-2">
                {/* Embed Token Card */}
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body p-4">
                    <h2 className="card-title text-lg mb-3">1. Load Embed</h2>
                    <div className="space-y-3">
                      <textarea
                        className="textarea textarea-bordered w-full resize-none font-mono text-xs"
                        rows="3"
                        placeholder="Paste JWT embed token here..."
                        value={embedToken}
                        onChange={(e) => setEmbedToken(e.target.value)}
                        disabled={isEmbedLoaded}
                      />
                      <div className="flex gap-2">
                        <button onClick={loadEmbed} disabled={isEmbedLoaded} className="btn btn-primary btn-sm flex-1">
                          {isEmbedLoaded ? "✓ Loaded" : "Load"}
                        </button>
                        <button onClick={unloadEmbed} disabled={!isEmbedLoaded} className="btn btn-error btn-sm flex-1">
                          Unload
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${isEmbedLoaded ? "bg-success animate-pulse" : "bg-base-300"}`}
                        ></div>
                        <span className="text-base-content/70">{isEmbedLoaded ? "Ready" : "Not Loaded"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Programmatic Controls */}
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body p-4">
                    <h2 className="card-title text-lg mb-3">2. Window Controls</h2>
                    <div className="space-y-2">
                      <button onClick={openGtwy} disabled={!isEmbedLoaded} className="btn btn-success btn-sm w-full">
                        Open GTWY
                      </button>
                      <button onClick={closeGtwy} disabled={!isEmbedLoaded} className="btn btn-warning btn-sm w-full">
                        Close GTWY
                      </button>
                      <button onClick={openWithAgent} disabled={!isEmbedLoaded} className="btn btn-info btn-sm w-full">
                        Open with Agent ID
                      </button>
                    </div>
                  </div>
                </div>

                {/* Agent Creation */}
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body p-4">
                    <h2 className="card-title text-lg mb-3">3. Agent Creation</h2>
                    <div className="space-y-2">
                      <button
                        onClick={createAgentWithName}
                        disabled={!isEmbedLoaded}
                        className="btn btn-accent btn-sm w-full"
                      >
                        Create Agent with Name
                      </button>
                      <button
                        onClick={createAgentWithPurpose}
                        disabled={!isEmbedLoaded}
                        className="btn btn-secondary btn-sm w-full"
                      >
                        Create Agent with Purpose
                      </button>
                      <button
                        onClick={openSendDataModal}
                        disabled={!isEmbedLoaded}
                        className="btn btn-primary btn-sm w-full"
                      >
                        Send Data to GTWY
                      </button>
                    </div>
                  </div>
                </div>

                {/* API Testing */}
                <div className="card bg-base-100 shadow-lg">
                  <div className="card-body p-4">
                    <h2 className="card-title text-lg mb-3">4. API Testing</h2>
                    <div className="space-y-2">
                      <button
                        onClick={openGetAgentsModal}
                        disabled={!embedToken.trim()}
                        className="btn btn-info btn-sm w-full"
                      >
                        Get Agent Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Embed Preview & Event Logs */}
            <div className="lg:col-span-2 flex flex-col h-full gap-3 overflow-hidden">
              {/* Embed Preview */}
              <div className="card bg-base-100 shadow-lg flex-1 flex flex-col overflow-hidden">
                <div className="card-body p-4 flex flex-col h-full">
                  <h2 className="card-title text-base mb-2 flex-none">Embed Preview</h2>
                  <div className="relative border-2 border-dashed border-base-300 rounded-lg flex-1 bg-base-200 overflow-hidden">
                    <div id="parent-container" className="w-full h-full" />
                    {!isEmbedLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <svg
                            className="w-16 h-16 text-base-content/30 mx-auto mb-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-base-content/50">Load the embed to see preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Logs */}
              <div className="card bg-base-100 shadow-lg flex-none" style={{ height: "280px" }}>
                <div className="card-body p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2 flex-none">
                    <h2 className="card-title text-base">Event Logs</h2>
                    <button onClick={() => setEventLogs([])} className="btn btn-ghost btn-xs">
                      Clear
                    </button>
                  </div>
                  <div
                    ref={eventLogRef}
                    className="bg-neutral rounded-lg p-3 flex-1 overflow-y-auto font-mono text-xs text-neutral-content"
                  >
                    {eventLogs.length === 0 ? (
                      <p className="text-neutral-content/50">No events yet...</p>
                    ) : (
                      eventLogs.map((log, index) => (
                        <div key={index} className="mb-2">
                          <span className="text-neutral-content/50">[{log.timestamp}]</span>{" "}
                          <span
                            className={
                              log.type === "success"
                                ? "text-success"
                                : log.type === "error"
                                  ? "text-error"
                                  : log.type === "action"
                                    ? "text-info"
                                    : log.type === "event"
                                      ? "text-warning"
                                      : "text-neutral-content/70"
                            }
                          >
                            {log.message}
                          </span>
                          {log.data && (
                            <pre className="text-neutral-content/70 ml-4 mt-1 text-xs">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent ID Modal */}
      {showAgentModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Open with Agent ID</h3>
            <input
              type="text"
              className="input input-bordered w-full font-mono text-sm"
              placeholder="Enter agent ID (e.g., 697355123bcf08ee26fa36bf)"
              value={agentIdInput}
              onChange={(e) => setAgentIdInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleOpenAgent()}
              autoFocus
            />
            <div className="modal-action">
              <button onClick={handleOpenAgent} className="btn btn-primary">
                Open
              </button>
              <button
                onClick={() => {
                  setShowAgentModal(false);
                  setAgentIdInput("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Name Modal */}
      {showAgentNameModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create Agent with Name</h3>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="Enter agent name (e.g., My Custom Agent)"
              value={agentNameInput}
              onChange={(e) => setAgentNameInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateAgentWithName()}
              autoFocus
            />
            <div className="modal-action">
              <button onClick={handleCreateAgentWithName} className="btn btn-accent">
                Create
              </button>
              <button
                onClick={() => {
                  setShowAgentNameModal(false);
                  setAgentNameInput("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Data Modal */}
      {showSendDataModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Send Data to GTWY</h3>
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Agent Name - Optional</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., New Agent"
                  value={sendDataAgentName}
                  onChange={(e) => setSendDataAgentName(e.target.value)}
                  autoFocus
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Create bridge with agent name
                  </span>
                </label>
              </div>
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Agent ID - Optional</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-mono text-sm"
                  placeholder="e.g., 697355123bcf08ee26fa36bf"
                  value={sendDataAgentId}
                  onChange={(e) => setSendDataAgentId(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Redirect to specific agent
                  </span>
                </label>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={handleSendData} className="btn btn-primary">
                Send
              </button>
              <button
                onClick={() => {
                  setShowSendDataModal(false);
                  setSendDataAgentName("");
                  setSendDataAgentId("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Get Agents Modal */}
      {showGetAgentsModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Get Agent Data</h3>
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">Agent ID - Optional</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full font-mono text-sm"
                  placeholder="e.g., 697355123bcf08ee26fa36bf"
                  value={getAgentIdInput}
                  onChange={(e) => setGetAgentIdInput(e.target.value)}
                  autoFocus
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Leave empty to get all agents, or specify agent_id for specific agent
                  </span>
                </label>
              </div>
              <div className="bg-base-200 p-3 rounded-lg">
                <p className="text-xs font-mono text-base-content/70">
                  <span className="font-semibold">API Endpoint:</span><br />
                  GET https://db.gtwy.ai/api/embed/getAgents<br />
                  <span className="font-semibold">Authorization:</span> {embedToken.substring(0, 20)}...
                </p>
              </div>
            </div>
            <div className="modal-action">
              <button onClick={handleGetAgents} className="btn btn-info">
                Fetch Data
              </button>
              <button
                onClick={() => {
                  setShowGetAgentsModal(false);
                  setGetAgentIdInput("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Purpose Modal */}
      {showPurposeModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Create Agent with Purpose</h3>
            <textarea
              className="textarea textarea-bordered w-full resize-none"
              rows="4"
              placeholder="Enter the purpose of the agent to be created..."
              value={agentPurpose}
              onChange={(e) => setAgentPurpose(e.target.value)}
              autoFocus
            />
            <div className="modal-action">
              <button onClick={handleCreateAgent} className="btn btn-secondary">
                Create
              </button>
              <button
                onClick={() => {
                  setShowPurposeModal(false);
                  setAgentPurpose("");
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GTWYEmbedTester;
