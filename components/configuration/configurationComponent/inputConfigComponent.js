import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useCustomSelector } from '@/customSelector/customSelector';
import { updateBridgeAction } from '@/store/action/bridgeAction';
import getCaretCoordinates from 'textarea-caret';

const InputConfigComponent = ({ params }) => {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.configuration?.type || "",
        service: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.allBridgesMap?.[params?.id]?.variables || []
    }));
    const suggestionListRef = useRef(null);
    const textareaRef = useRef(null);
    const [prompt, setPrompt] = useState(reduxPrompt);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        setPrompt(reduxPrompt);
    }, [reduxPrompt]);

    const savePrompt = useCallback((e) => {
        const newValue = e.target?.value || "";
        dispatch(updateBridgeAction({ bridgeId: params.id, dataToSend: { configuration: { prompt: newValue } } }));
    }, [dispatch, params.id]);

    const handleSuggestionClick = (suggestion) => {
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        const beforeCursor = prompt.slice(0, cursorPosition - 1);
        const afterCursor = prompt.slice(cursorPosition);
        const newPrompt = `${beforeCursor}{{${suggestion}}}${afterCursor}`;

        setPrompt(newPrompt);
        setShowSuggestions(false);

        // Set focus back to the textarea
        textarea.focus();

        // Calculate the new cursor position after inserting the suggestion
        const newCursorPosition = beforeCursor.length + suggestion.length + 4; // Adjust for `{{}}`

        // Set the cursor position manually
        setTimeout(() => {
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);

    };

    const handlePromptChange = (e) => {
        const value = e.target.value;
        setPrompt(value);
        const cursorPos = e.target.selectionStart;

        // Check if the user typed `{` or `{{`
        if (value.slice(cursorPos - 1, cursorPos) === '{') {
            setShowSuggestions(true);
        } else if (value.slice(cursorPos - 2, cursorPos) === '{{') {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    if (service === "google" && serviceType === "chat") {
        return null;
    }

    const getCaretCoordinatesAdjusted = () => {
        if (textareaRef.current) {
            const { top, left } = getCaretCoordinates(textareaRef.current);
            const { scrollTop, scrollLeft } = textareaRef.current;
            return {
                top: top - scrollTop + textareaRef.current.offsetTop,
                left: left - scrollLeft + textareaRef.current.offsetLeft,
            };
        }
        return { top: 0, left: 0 };
    };

    const handleKeyDown = (e) => {
        const suggestionItems = suggestionListRef.current?.querySelectorAll('.list-item');
        let activeElement = document.activeElement;

        if (!suggestionItems || suggestionItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (activeElement.classList.contains('list-item')) {
                let nextElement = activeElement.nextElementSibling || suggestionItems[0];
                nextElement.focus();
            } else {
                suggestionItems[0].focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeElement.classList.contains('list-item')) {
                let prevElement = activeElement.previousElementSibling || suggestionItems[suggestionItems.length - 1];
                prevElement.focus();
            } else {
                suggestionItems[suggestionItems.length - 1].focus();
            }
        } else if (e.key === 'Enter' && activeElement.classList.contains('list-item')) {
            e.preventDefault();
            activeElement.click(); // Trigger the click event for the active item
        }
    };

    return (
        <div className="form-control h-full">
            <div className="label">
                <span className="label-text capitalize">Prompt</span>
            </div>
            <textarea
                ref={textareaRef}
                className="textarea textarea-bordered border w-full min-h-96 resize-y focus:border-primary"
                value={prompt}
                onChange={handlePromptChange}
                onKeyDown={handleKeyDown}  // Attach keydown handler to textarea
            ></textarea>
            {showSuggestions && (
                <div className="dropdown dropdown-open" style={{ position: 'absolute', top: getCaretCoordinatesAdjusted().top + 4, left: getCaretCoordinatesAdjusted().left + 8, zIndex: 1000 }}>
                    <ul
                        ref={suggestionListRef}
                        tabIndex={0}
                        className="dropdown-content menu menu-dropdown-toggle bg-base-100 rounded-box z-[999999] w-60 p-2 shadow max-h-60 overflow-scroll overflow-y-auto"
                        onKeyDown={handleKeyDown}  // Attach keydown handler to suggestion list
                    >
                        <div className='flex flex-col w-full'>
                            {(variablesKeyValue || []).map((suggestion, index) => (
                                <li
                                    tabIndex={0}  // Ensure list items can receive focus
                                    className='list-item'
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion.key)}
                                >
                                    <a>{suggestion.key}</a>
                                </li>
                            ))}
                        </div>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InputConfigComponent;
