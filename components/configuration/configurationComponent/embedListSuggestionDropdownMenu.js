import { useCustomSelector } from "@/customHooks/customSelector";
import { updateOrgDetails } from "@/store/action/orgAction";
import { getStatusClass } from "@/utils/utility";
import { Info, Plus } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

function EmbedListSuggestionDropdownMenu({
  params,
  name,
  hideCreateFunction = false,
  onSelect = () => {},
  connectedFunctions = [],
  shouldToolsShow,
  modelName,
}) {
  const { integrationData, function_data, embedToken } = useCustomSelector(
    (state) => ({
      integrationData:
        state?.bridgeReducer?.org?.[params?.org_id]?.integrationData,
      function_data: state?.bridgeReducer?.org?.[params?.org_id]?.functionData,
      embedToken: state?.bridgeReducer?.org?.[params?.org_id]?.embed_token,
    })
  );
const dispatch=useDispatch();
  const orgId = params.org_id;
  const isFirstFunction = useCustomSelector(
    (state) =>
      state.userDetailsReducer.userDetails?.c_companies?.find(
        (c) => c.id === Number(orgId)
      )?.meta?.onboarding.FunctionCreation
  );
  const [showTutorial, setShowTutorial] = useState(false);

  const currentOrg = useCustomSelector((state) =>
    state.userDetailsReducer.userDetails?.c_companies?.find(
      (c) => c.id === Number(orgId)
    )
  );

  const handleTutorial = () => {
    
    setShowTutorial(isFirstFunction);
  };
  const handleVideoEnd = async () => {
    try {
      setShowTutorial(false);

      const updatedOrgDetails = {
        ...currentOrg,
        meta: {
          ...currentOrg?.meta,
          onboarding: {
            ...currentOrg?.meta?.onboarding,
            FunctionCreation: false,
          },
        },
      };

      await dispatch(updateOrgDetails(orgId, updatedOrgDetails));
    } catch (error) {
      console.error("Failed to update full organization:", error);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e) => {
    setSearchQuery(e.target?.value || ""); // Update search query when the input changes
  };

  const handleItemClick = (id) => {
    onSelect(id); // Assuming onSelect is a function you've defined elsewhere
  };
  const renderEmbedSuggestions = useMemo(
    () =>
      function_data &&
      Object.values(function_data)
        // .filter(value => !bridge_pre_tools?.includes(value?._id))
        // .filter(value => !(connectedFunctions || [])?.includes(value?._id))
        .filter((value) => {
          const title =
            integrationData?.[value?.endpoint]?.title ||
            integrationData?.[value?.function_name]?.title;
          return (
            title !== undefined &&
            title?.toLowerCase()?.includes(searchQuery.toLowerCase()) &&
            !(connectedFunctions || [])?.includes(value?._id)
          );
        })
        .slice() // Create a copy of the array to avoid mutating the original
        .sort((a, b) => {
          const aTitle =
            integrationData[a?.endpoint]?.title ||
            integrationData[a?.function_name]?.title;
          const bTitle =
            integrationData[b?.endpoint]?.title ||
            integrationData[b?.function_name]?.title;
          if (!aTitle) return 1;
          if (!bTitle) return -1;

          return aTitle?.localeCompare(bTitle); // Sort alphabetically based on title
        })
        .map((value) => {
          const functionName = value?.function_name || value?.endpoint;
          const status = integrationData?.[functionName]?.status;
          const title = integrationData?.[functionName]?.title || "Untitled";

          return (
            <li key={value?._id} onClick={() => handleItemClick(value?._id)}>
              <div className="flex justify-between items-center w-full">
                <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                  {title}
                </p>
                <div>
                  <span
                    className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(
                      status
                    )}`}
                  >
                    {value?.description?.trim() === "" ? "Ongoing" : status}
                  </span>
                </div>
              </div>
            </li>
          );
        }),
    [
      integrationData,
      function_data,
      searchQuery,
      getStatusClass,
      connectedFunctions,
      params.version,
    ]
  );
  return (
    <div className="dropdown dropdown-right">
      <div className="flex items-center gap-2">
        <button
          tabIndex={0}
          disabled={!shouldToolsShow}
          className="btn btn-outline btn-sm"
          onClick={() => handleTutorial()}
        >
          <Plus size={16} />
          {name || "Connect function"}
        </button>
        {!shouldToolsShow && (
          <div
            role="alert"
            className="alert p-2 flex items-center gap-2 w-auto"
          >
            <Info size={16} className="flex-shrink-0 mt-0.5" />
            <span className="label-text-alt text-xs leading-tight">
              {`The ${modelName} does not support ${
                name?.toLowerCase()?.includes("pre function")
                  ? "pre functions"
                  : "functions"
              } calling`}
            </span>
          </div>
        )}
      </div>
      {showTutorial && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <button
            onClick={() => handleVideoEnd()}
            className="absolute top-4 right-4 text-white text-4xl hover:text-red-500 z-50"
            aria-label="Close Tutorial"
          >
            &times;
          </button>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              position: "relative",
              boxSizing: "content-box",
              maxHeight: "80vh",
              width: "100%",
              aspectRatio: "1.935483870967742",
              padding: "40px 0",
            }}
          >
            <iframe
              src="https://video-faq.viasocket.com/embed/cm9tkq1kj0nmb11m7j6kw8r02?embed_v=2"
              loading="lazy"
              title="AI-middleware"
              allow="clipboard-write"
              frameBorder="0"
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              className="rounded-xl"
            />
          </div>
        </div>
      )}
      
      {!showTutorial && (
  <ul
    tabIndex={0}
    className="menu menu-dropdown-toggle dropdown-content z-[9999999] px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1"
  >
    <div className="flex flex-col gap-2 w-full">
      <li className="text-sm font-semibold disabled">Suggested Functions</li>
      <input
        type="text"
        placeholder="Search Function"
        value={searchQuery}
        onChange={handleInputChange}
        className="input input-bordered w-full input-sm"
      />
      {Object.values(function_data || {})?.length > 0 ? (
        renderEmbedSuggestions
      ) : (
        <li className="text-center mt-2">No functions found</li>
      )}
      {!hideCreateFunction && (
        <li
          className="mt-2 border-t w-full sticky bottom-0 bg-white py-2"
          onClick={() => openViasocket(undefined, { embedToken })}
        >
          <div>
            <Plus size={16} />
            <p className="font-semibold">Add new Function</p>
          </div>
        </li>
      )}
    </div>
  </ul>
)}
      
    </div>
  );
}

export default EmbedListSuggestionDropdownMenu;
