import { memo } from 'react';
import PreEmbedList from "./configurationComponent/PreEmbedList";
import InputConfigComponent from "./configurationComponent/InputConfigComponent";
import { useConfigurationContext } from './ConfigurationContext';
import { toggleSidebar } from '@/utils/utility';
import {BookText } from 'lucide-react';

const InputSection = memo(() => {
    const { 
        params, 
        searchParams, 
        promptTextAreaRef, 
        isEmbedUser, 
        hidePreTool,
        // Consolidated state props
        uiState,
        updateUiState,
        promptState,
        setPromptState,
        handleCloseTextAreaFocus,
        savePrompt,
        isMobileView,
        isPublished,
        isEditor
    } = useConfigurationContext();

    return (
        <>
            {((!hidePreTool && isEmbedUser) || !isEmbedUser) && (
                <div className="w-full pt-4 cursor-default flex flex-wrap justify-between items-start gap-2">
                    <div className="flex-1 min-w-[220px] max-w-md">
                        <PreEmbedList isPublished={isPublished} isEditor={isEditor} params={params} searchParams={searchParams} />
                    </div>
                    {!isEmbedUser && (
                        <button
                            type="button"
                            className="btn btn-xs btn-outline gap-1 mt-1 whitespace-nowrap shrink-0"
                            onClick={() => toggleSidebar('integration-guide-slider', 'right')}
                        >
                            <BookText className="w-3 h-3" />
                            <span>Integration Guide</span>
                        </button>
                    )}
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
