import { memo } from 'react';
import PreEmbedList from "./configurationComponent/preEmbedList";
import InputConfigComponent from "./configurationComponent/inputConfigComponent";
import { useConfigurationContext } from './ConfigurationContext';

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
                <PreEmbedList isPublished={isPublished} params={params} searchParams={searchParams} />
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
