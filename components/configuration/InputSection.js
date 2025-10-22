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
        isMobileView
    } = useConfigurationContext();

    return (
        <>
            {((!hidePreTool && isEmbedUser) || !isEmbedUser) && (
                <PreEmbedList params={params} searchParams={searchParams} />
            )}
            <InputConfigComponent
                params={params}
                searchParams={searchParams}
                promptTextAreaRef={promptTextAreaRef}
                isEmbedUser={isEmbedUser}
                // Consolidated state props
                uiState={uiState}
                updateUiState={updateUiState}
                promptState={promptState}
                setPromptState={setPromptState}
                handleCloseTextAreaFocus={handleCloseTextAreaFocus}
                savePrompt={savePrompt}
                isMobileView={isMobileView}
            />
        </>
    );
});

InputSection.displayName = 'InputSection';

export default InputSection;
