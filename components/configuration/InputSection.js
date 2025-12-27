import { memo } from 'react';
import PreEmbedList from "./configurationComponent/PreEmbedList";
import InputConfigComponent from "./configurationComponent/InputConfigComponent";
import { useConfigurationContext } from './ConfigurationContext';
import { toggleSidebar } from '@/utils/utility';
import {BookText } from 'lucide-react';
import TriggersList from './configurationComponent/TriggersList';

const InputSection = memo(() => {
    const { 
        params, 
        searchParams, 
        promptTextAreaRef, 
        isEmbedUser, 
        hidePreTool,
        uiState,
        updateUiState,
        promptState,
        setPromptState,
        handleCloseTextAreaFocus,
        savePrompt,
        isMobileView,
        isPublished,
        bridgeType,
        isEditor
    } = useConfigurationContext();
    return (
        <>
          {!isEmbedUser && bridgeType === 'trigger' &&
          <div className="w-full pt-4 cursor-default flex flex-wrap justify-between items-start gap-2">
            <div className="flex-1 min-w-[220px] max-w-md">
                 <TriggersList params={params} />
                 </div>
           </div>}
        
            {((!hidePreTool && isEmbedUser) || !isEmbedUser) && (
                <div className="w-full pt-4 cursor-default flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1">
                        <PreEmbedList isPublished={isPublished} isEditor={isEditor} params={params} searchParams={searchParams} isEmbedUser={isEmbedUser}   />
                    </div>
                </div>
            )}
            <InputConfigComponent
                params={params}
                searchParams={searchParams}
                promptTextAreaRef={promptTextAreaRef}
                isEmbedUser={isEmbedUser}
                uiState={uiState}
                updateUiState={updateUiState}
                promptState={promptState}
                setPromptState={setPromptState}
                handleCloseTextAreaFocus={handleCloseTextAreaFocus}
                savePrompt={savePrompt}
                isMobileView={isMobileView}
                isPublished={isPublished}
                isEditor={isEditor}
            />
        </>
    );
});

InputSection.displayName = 'InputSection';

export default InputSection;
