import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import { useCustomSelector } from '@/customHooks/customSelector';
import { ONBOARDING_VIDEOS } from '@/utils/enums';
import { getStatusClass } from '@/utils/utility';
import { current } from '@reduxjs/toolkit';
import { InfoIcon, AddIcon } from '@/components/Icons';
import React, { useMemo, useState } from 'react';
import InfoTooltip from '@/components/InfoTooltip';

function EmbedListSuggestionDropdownMenu({ params, name, hideCreateFunction = false, onSelect = () => { }, connectedFunctions = [], shouldToolsShow, modelName }) {
     const [tutorialState, setTutorialState] = useState({
        showTutorial: false,
        showSuggestion: false
      });
    const { integrationData, function_data, embedToken, isFirstFunction } = useCustomSelector((state) => {
        const orgId = Number(params?.org_id);
        const orgData = state?.bridgeReducer?.org?.[orgId] || {};
        const currentUser = state.userDetailsReducer.userDetails

        return {
            integrationData: orgData.integrationData,
            function_data: orgData.functionData,
            embedToken: orgData.embed_token,
            isFirstFunction: currentUser?.meta?.onboarding?.FunctionCreation,
            
        };
    });
    const handleTutorial = () => {
        setTutorialState(prev=>({
            ...prev,
            showSuggestion:isFirstFunction
        }));
    };
    const [searchQuery, setSearchQuery] = useState('');

    const handleInputChange = (e) => {
        setSearchQuery(e.target?.value || ""); // Update search query when the input changes
    };

    const handleItemClick = (id) => {
        onSelect(id); // Assuming onSelect is a function you've defined elsewhere
    };
    const renderEmbedSuggestions = useMemo(() => (
        function_data && (Object.values(function_data))
            // .filter(value => !bridge_pre_tools?.includes(value?._id))
            // .filter(value => !(connectedFunctions || [])?.includes(value?._id))
            .filter(value => {
                const title = integrationData?.[value?.endpoint]?.title || integrationData?.[value?.function_name]?.title;
                return title !== undefined && title?.toLowerCase()?.includes(searchQuery.toLowerCase()) &&
                    !(connectedFunctions || [])?.includes(value?._id);
            })
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => {
                const aTitle = integrationData[a?.endpoint]?.title || integrationData[a?.function_name]?.title;
                const bTitle = integrationData[b?.endpoint]?.title || integrationData[b?.function_name]?.title;
                if (!aTitle) return 1;
                if (!bTitle) return -1;

                return aTitle?.localeCompare(bTitle); // Sort alphabetically based on title
            })
            .map((value) => {
                const functionName = value?.function_name || value?.endpoint;
                const status = integrationData?.[functionName]?.status;
                const title = integrationData?.[functionName]?.title || 'Untitled';

                return (
                   <li key={value?._id} onClick={() => handleItemClick(value?._id)}>
                        <div className="flex justify-between items-center w-full">
                            <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                {title}
                            </p>
                            <div>
                                <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-base-content ${getStatusClass(status)}`}>
                                    {value?.description?.trim() === "" ? "Ongoing" : status}
                                </span>
                            </div>
                        </div>
                    </li>
                )
            }
            )
    ), [integrationData, function_data, searchQuery, getStatusClass, connectedFunctions, params.version]);
    return (
        <div className="dropdown dropdown-right">
            <div className="flex items-end gap-2">
                {name === "preFunction" ? (
                    <div className=" flex flex-col items-start gap-2">
                        <InfoTooltip tooltipContent={"A pre-tools prepares data before passing it to the main tools for the GPT call"}>
                        <p className="text-base font-semibold info">Pre Tool Configuration</p>
                       
                        </InfoTooltip>

                        {/* Plus Icon Button */}
                        <button
                           tabIndex={0}
                           className="btn btn-outline btn-sm"                  
                        >
                                <AddIcon size={16} />
                               {"Connect Pre Tool"}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-2">
                        {connectedFunctions.length === 0 && (
                            <InfoTooltip video={ONBOARDING_VIDEOS.FunctionCreation} tooltipContent={"Tools let LLMs access real-time data, perform calculations, and interact with external services."} >
                                <p className=" label-text info">Tool Configuration</p>

                            </InfoTooltip>
                        )}

                        <div className='flex flex-wrap items-center gap-2 w-full lg:mr-0 mr-5'>
                            <button
                                tabIndex={0}
                                disabled={!shouldToolsShow}
                                onClick={() => handleTutorial()}
                                className="btn btn-outline btn-sm "
                            >
                                <AddIcon size={16} />
                                <span className="truncate">Connect Tool</span>
                            </button>
                        </div>
                    </div>
                )}
                {
                    !shouldToolsShow && name !== "preFunction"&&
                    <div role="alert" className="alert p-2 flex items-center gap-2 w-auto">
                        <InfoIcon size={16} className="flex-shrink-0 mt-0.5" />
                        <span className='label-text-alt text-xs leading-tight'>
                            {`The ${modelName} does not support ${name?.toLowerCase()?.includes('pre function') ? 'pre functions' : 'functions'} calling`}
                        </span>
                    </div>
                }
            </div>
            {tutorialState?.showSuggestion && (
                <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"FunctionCreation"} TutorialDetails={"Tool Configuration"}/>
            )}
            {tutorialState?.showTutorial && (
                <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.FunctionCreation}  flagKey={"FunctionCreation"} />
            )}
            {!tutorialState?.showTutorial && (
                <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-1">
                    <div className='flex flex-col gap-2 w-full'>
                        <li className="text-sm font-semibold disabled">Suggested Tools</li>
                        <input
                            type='text'
                            placeholder='Search Function'
                            value={searchQuery}
                            onChange={handleInputChange} // Update search query on input change
                            className='input input-bordered w-full input-sm'
                        />
                        {Object.values(function_data || {})?.length > 0 ? (
                            renderEmbedSuggestions
                        ) : (
                            <li className="text-center mt-2">No tools found</li>
                        )}
                        {!hideCreateFunction && <li className="mt-2 border-t w-full sticky bottom-0 bg-white py-2" onClick={() => openViasocket(undefined,
                            {
                                embedToken,
                                meta: {
                                    createFrom: name,
                                    type: 'tool',
                                    bridge_id: params?.id,
                                }
                            }
                        )}>
                            <div>
                                <AddIcon size={16} /><p className='font-semibold'>Add new Tools</p>
                            </div>
                        </li>}
                    </div>
                </ul>
            )}
        </div>
    )
}

export default EmbedListSuggestionDropdownMenu