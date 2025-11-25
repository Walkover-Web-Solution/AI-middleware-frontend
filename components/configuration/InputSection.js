import { memo } from 'react';
import PreEmbedList from "./configurationComponent/preEmbedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
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
        isPublished
    } = useConfigurationContext();

    return (
        <>
            {((!hidePreTool && isEmbedUser) || !isEmbedUser) && (
                <div className="w-full gap-2 flex flex-row items-start justify-between pt-4 cursor-default">
                    <PreEmbedList isPublished={isPublished} params={params} searchParams={searchParams} />
                    {!isEmbedUser && <button
                        type="button"
                        className="btn btn-xs btn-outline gap-1 mt-1 whitespace-nowrap"
                        onClick={() => toggleSidebar('integration-guide-slider', 'right')}
                    >
                        <BookText className="w-3 h-3" />
                        <span>Integration Guide</span>
                    </button>}
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
            />
        </>
    );
});

InputSection.displayName = 'InputSection';

export default InputSection;
