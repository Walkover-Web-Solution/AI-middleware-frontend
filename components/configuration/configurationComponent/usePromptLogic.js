import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { generateRandomID } from '@/utils/utility';
import { setThreadIdForVersionReducer } from '@/store/reducer/bridgeReducer';

// Custom hook to handle all prompt-related logic with consolidated state
export const usePromptLogic = ({ 
    params, 
    searchParams, 
    reduxPrompt, 
    bridge, 
    promptState,
    setPromptState,
    handleCloseTextAreaFocus,
    savePrompt
}) => {
    const [oldContent, setOldContent] = useState(reduxPrompt);  
    const textareaRef = useRef(null);
    const debounceTimerRef = useRef(null);
    const dispatch = useDispatch();

    // Initialize content and thread ID
    useEffect(() => {
        setOldContent(reduxPrompt);
        setPromptState(prev => ({
            ...prev,
            thread_id: bridge?.thread_id || generateRandomID()
        }));
    }, [reduxPrompt, bridge?.thread_id, setPromptState]);

    // Handle beforeunload event
    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (promptState.hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [promptState.hasUnsavedChanges]);

  

    // Optimized prompt change handler with debouncing and consolidated state
    const handlePromptChange = useCallback((value) => {
        const hasChanges = value.trim() !== reduxPrompt.trim();
        
        // Single state update to prevent multiple re-renders
        setPromptState(prev => ({
            ...prev,
            prompt: value,
            hasUnsavedChanges: hasChanges
        }));
        
        // Debounced content update for diff modal
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            // Single state update for diff modal content and thread ID
            const newThreadId = generateRandomID();
            setPromptState(prev => ({
                ...prev,
                newContent: value,
                thread_id: newThreadId
            }));
            
            dispatch(setThreadIdForVersionReducer({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                thread_id: newThreadId
            }));
        }, 500);
    }, [reduxPrompt, setPromptState, dispatch, params?.id, searchParams?.version]);


    const handleSavePrompt = useCallback(() => {
        savePrompt(promptState.prompt);
        setOldContent(promptState.prompt);
        setPromptState(prev => ({
            ...prev,
            newContent: '',
            hasUnsavedChanges: false
        }));
        handleCloseTextAreaFocus();
    }, [promptState.prompt, savePrompt, handleCloseTextAreaFocus, setPromptState]);

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        textareaRef,
        oldContent,
        handlePromptChange,
        handleSavePrompt
    };
};
