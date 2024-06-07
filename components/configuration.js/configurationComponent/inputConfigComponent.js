import { useCustomSelector } from "@/customSelector/customSelector";
import { updateBridgeAction } from "@/store/action/bridgeAction";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { getSystemPromptHistory } from "@/config/index"; // Ensure this import is correct
import { X, Bot, History } from "lucide-react"; // Adjust imports if needed
import InfiniteScroll from 'react-infinite-scroll-component';

const InputConfigComponent = ({ params }) => {
  const { bridge } = useCustomSelector((state) => ({
    bridge: state?.bridgeReducer?.allBridgesMap?.[params?.id],
  }));

  const dataToSend = {
    configuration: {
      model: bridge?.configuration?.model?.default,
    },
    service: bridge?.service?.toLowerCase(),
  };

  const dispatch = useDispatch();
  const sidebarRef = useRef(null);

  const [inputConfig, setInputConfig] = useState(bridge?.inputConfig || {});
  const [isMessageHistoryOpen, setIsMessageHistoryOpen] = useState(false);
  const [prompt, setPrompt] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setInputConfig(bridge?.inputConfig);
  }, [bridge]);

  useEffect(() => {
    if (isMessageHistoryOpen) {
      fetchMessageHistory(1);
    }
  }, [isMessageHistoryOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsMessageHistoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarRef]);

  const fetchMessageHistory = async (pageNumber) => {
    try {
      const response = await getSystemPromptHistory({
        bridge_id: params.id,
        timestamp: Date.now(),
        page: pageNumber, // Assuming your API supports pagination
      });
      if (Array.isArray(response)) {
        if (response.length === 0) {
          setHasMore(false);
        } else {
          setPrompt((prevPrompt) => (pageNumber === 1 ? response : [...prevPrompt, ...response]));
          setPage(pageNumber + 1);
        }
      } else {
        setPrompt([]);
        setHasMore(false);
        console.error("Unexpected response format:", response);
      }
    } catch (error) {
      console.error("Error fetching message history:", error);
      setPrompt([]);
      setHasMore(false);
    }
  };

  const handleMessageSelect = (selectedMessage, key) => {
    setInputConfig((prevInputConfig) => {
      const updatedConfig = { ...prevInputConfig };
      if (updatedConfig && updatedConfig[key] && updatedConfig[key].default) {
        updatedConfig[key] = {
          ...updatedConfig[key],
          default: {
            ...updatedConfig[key].default,
            content: selectedMessage,
          },
        };
      }
      SaveData(selectedMessage, key);
      return updatedConfig;
    });
  };

  const handleInputConfigChanges = (value, key) => {
    setInputConfig((prevInputConfig) => ({
      ...prevInputConfig,
      [key]: {
        ...prevInputConfig[key],
        default: {
          ...prevInputConfig[key].default,
          content: value,
        },
      },
    }));
  };

  const SaveData = (value, key) => {
    const updatedDataToSend = {
      ...dataToSend,
      configuration: {
        ...dataToSend.configuration,
        prompt: [{ role: key, content: value }],
      },
    };
    UpdateBridge(updatedDataToSend);
  };

  const UpdateBridge = (currentDataToSend) => {
    dispatch(
      updateBridgeAction({
        bridgeId: params.id,
        dataToSend: { ...currentDataToSend },
      })
    );
  };

  const renderInputConfig = useMemo(
    () =>
      inputConfig &&
      Object.entries(inputConfig)
        .filter(([key]) => key !== "rawData")
        .map(([key, value]) => (
          <div className="form-control w-full" key={key + value}>
            <div className="label flex justify-between items-center">
              <span className="label-text capitalize">{key}</span>
              <button className='btn' onClick={() => setIsMessageHistoryOpen(key)}>
                <History size={20} />
              </button>
            </div>
            <textarea
              className="textarea textarea-bordered w-full min-h-96 resize-y"
              value={value?.default?.content || value?.prompt || value?.input || ""}
              onChange={(e) => {
                handleInputConfigChanges(e.target.value, key);
              }}
              onBlur={(e) => {
                SaveData(e.target.value, key);
              }}
            ></textarea>
          </div>
        )),
    [inputConfig]
  );

  return (
    <>
      {renderInputConfig}
      {isMessageHistoryOpen && (
        <aside
          ref={sidebarRef}
          className="fixed right-0 top-0 z-20 flex h-full w-1/3 flex-col overflow-y-auto bg-white px-5 py-8 shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-medium flex items-center gap-2">
              <Bot /> Prompt History
            </h1>
            <button
              className="btn btn-outline btn-circle btn-xs"
              onClick={() => setIsMessageHistoryOpen(false)}
            >
              <X size={16} />
            </button>
          </div>
          <div className="mt-6 flex flex-1 flex-col justify-between">
            <InfiniteScroll
              dataLength={prompt.length}
              next={() => fetchMessageHistory(page)}
              hasMore={hasMore}
              loader={<></>}
              endMessage={<p>No more prompts</p>}
              scrollableTarget="scrollableDiv"
            >
              <nav className="-mx-3 space-y-6" id="scrollableDiv">
                <div className="space-y-3">
                  {prompt.length > 0 ? (
                    prompt.map((item, index) => (
                      <div
                        key={index}
                        className="flex transform items-center justify-between rounded-lg px-3 py-2 text-gray-600 transition-colors duration-300 hover:bg-gray-100 hover:text-gray-700"
                        onClick={() => handleMessageSelect(item.system_prompt, isMessageHistoryOpen)}
                        style={{ overflow: "hidden" }}
                      >
                        <span className="mx-2 text-sm font-medium truncate">
                          {item.system_prompt}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No prompt history available</p>
                  )}
                </div>
              </nav>
            </InfiniteScroll>
          </div>
        </aside>
      )}
    </>
  );
};

export default InputConfigComponent;

