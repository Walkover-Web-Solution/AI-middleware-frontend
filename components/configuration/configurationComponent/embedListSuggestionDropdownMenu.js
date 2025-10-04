import OnBoarding from '@/components/OnBoarding';
import TutorialSuggestionToast from '@/components/tutorialSuggestoinToast';
import { useCustomSelector } from '@/customHooks/customSelector';
import { ONBOARDING_VIDEOS } from '@/utils/enums';
import { getStatusClass } from '@/utils/utility';
import { current } from '@reduxjs/toolkit';
import { InfoIcon, AddIcon } from '@/components/Icons';
import React, { useMemo, useState } from 'react';
import InfoTooltip from '@/components/InfoTooltip';

function EmbedListSuggestionDropdownMenu({ params, searchParams, name, hideCreateFunction = false, onSelect = () => { }, connectedFunctions = [], shouldToolsShow, modelName }) {
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
                const fnName = value?.function_name || value?.endpoint;
                const title = value?.title || integrationData?.[fnName]?.title;
                 return title !== undefined && title?.toLowerCase()?.includes(searchQuery.toLowerCase()) &&
                     !(connectedFunctions || [])?.includes(value?._id);
            })
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => {
                const aFnName = a?.function_name || a?.endpoint;
                const bFnName = b?.function_name || b?.endpoint;
                const aTitle = a?.title || integrationData?.[aFnName]?.title;
                const bTitle = b?.title || integrationData?.[bFnName]?.title;
                 if (!aTitle) return 1;
                 if (!bTitle) return -1;

                 return aTitle?.localeCompare(bTitle); // Sort alphabetically based on title
            })
            .map((value) => {
                const functionName = value?.function_name || value?.endpoint;
                const status = value?.status || integrationData?.[functionName]?.status;
                const title = value?.title || integrationData?.[functionName]?.title || 'Untitled';
                 return (
                     <li key={value?._id} onClick={() => handleItemClick(value?._id)}>
                         <div className="flex justify-between items-center w-full">
                            <div  title={title?.length > 20 ? title : ""}>
                             <p className="overflow-hidden text-ellipsis whitespace-pre-wrap">
                                 {title?.length > 20 ? `${title.slice(0, 20)}...` : title}
                             </p>
                             </div>
                             <div>
                                 <span className={`rounded-full capitalize bg-base-200 px-3 py-1 text-[10px] sm:text-xs font-semibold text-black ${getStatusClass(status)}`}>
                                     {value?.description?.trim() === "" ? "Ongoing" : status===1 ? "Active" : status}
                                 </span>
                             </div>
                         </div>
                     </li>
                 )
             }
             )
    ), [integrationData, function_data, searchQuery, getStatusClass, connectedFunctions, searchParams?.version]);
    return (
        <div className="dropdown dropdown-left mt-8">
            
            {tutorialState?.showSuggestion && (
                <TutorialSuggestionToast setTutorialState={setTutorialState} flagKey={"FunctionCreation"} TutorialDetails={"Tool Configuration"}/>
            )}
            {tutorialState?.showTutorial && (
                <OnBoarding setShowTutorial={() => setTutorialState(prev => ({ ...prev, showTutorial: false }))} video={ONBOARDING_VIDEOS.FunctionCreation}  flagKey={"FunctionCreation"} />
            )}
            {!tutorialState?.showTutorial && (
                <ul tabIndex={0} className="menu menu-dropdown-toggle dropdown-content z-high px-4 shadow bg-base-100 rounded-box w-72 max-h-96 overflow-y-auto pb-0">
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
                        {!hideCreateFunction && <li className="border-t border-base-300 w-full sticky bottom-0 bg-base-100 py-2" onClick={() => openViasocket(undefined,
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