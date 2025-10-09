import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { generateRandomID, openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import EasyMDE from 'easymde';
import 'easymde/dist/easymde.min.css';
import PromptSummaryModal from '../../modals/PromptSummaryModal';
import ToneDropdown from './toneDropdown';
import ResponseStyleDropdown from './responseStyleDropdown';
import { ChevronDownIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import PromptHelper from '../../PromptHelper';
import { setIsFocusReducer, setThreadIdForVersionReducer } from '@/store/reducer/bridgeReducer';
import Diff_Modal from '@/components/modals/Diff_Modal';


const InputConfigComponent = ({ params, searchParams, promptTextAreaRef, isEmbedUser }) => {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue, bridge } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type || "",
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.variables || [],
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || ""
    }));
    
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640);
    const [oldContent, setOldContent] = useState(reduxPrompt);
    const [newContent, setNewContent] = useState('');
    const [keyName, setKeyName] = useState('');
    const suggestionListRef = useRef(null);
    const textareaRef = useRef(null);
    const editorRef = useRef(null);
    const easyMDERef = useRef(null);
    const editorContainerRef = useRef(null);
    const [prompt, setPrompt] = useState(reduxPrompt);
    const [editorHeight, setEditorHeight] = useState(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [isPromptHelperOpen, setIsPromptHelperOpen] = useState(false);

    // Memoize coordinates to prevent recalculation on every render
    const [suggestionCoords, setSuggestionCoords] = useState({ top: 0, left: 0 });

    // Debounce timer ref
    const debounceTimerRef = useRef(null);

    const initialThreadId = bridge?.thread_id || generateRandomID();
    const [thread_id, setThreadId] = useState(initialThreadId);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(setIsFocusReducer(isPromptHelperOpen));
    }, [isPromptHelperOpen, dispatch]);

    // Ensure thread_id exists in Redux for this bridge/version on mount
    useEffect(() => {
        if (!bridge?.thread_id && initialThreadId) {
            setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                bridgeId: params?.id,
                versionId: searchParams?.version,
                thread_id: initialThreadId,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const textareaElement = promptTextAreaRef?.current?.querySelector('textarea') || promptTextAreaRef?.current?.querySelector('.CodeMirror');
            if (textareaElement && isPromptHelperOpen) {
                promptTextAreaRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [isPromptHelperOpen, prompt]);

    // Separate effect to update EasyMDE when reduxPrompt changes
    useEffect(() => {
        if (easyMDERef.current && easyMDERef.current.value() !== reduxPrompt) {
            // Temporarily disable change event to avoid infinite loop
            const currentValue = easyMDERef.current.value();
            if (currentValue !== reduxPrompt) {
                easyMDERef.current.value(reduxPrompt);
                setPrompt(reduxPrompt);
                setHasUnsavedChanges(false);
            }
        } else if (!easyMDERef.current) {
            // If editor not initialized yet, just update the state
            setPrompt(reduxPrompt);
            setHasUnsavedChanges(false);
        }
    }, [reduxPrompt]);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handleResize = () => {
            const isSmallScreen = window.innerWidth < 710; // Changed to 640 to match initial state
            if (!isMobileView && !isSmallScreen && typeof window.openTechDoc === 'function' && isPromptHelperOpen) {
                window.openTechDoc();
            } else if (isMobileView && isSmallScreen && typeof window.closeTechDoc === 'function') {
                window.closeTechDoc();
            }
            setIsMobileView(isSmallScreen);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isMobileView, isPromptHelperOpen]);

    const savePrompt = useCallback((newPrompt) => {
        const newValue = (newPrompt || "").trim();
        setShowSuggestions(false);

        if (newValue !== reduxPrompt.trim()) {
            dispatch(updateBridgeVersionAction({
                versionId: searchParams?.version,
                dataToSend: {
                    configuration: {
                        prompt: newValue
                    }
                }
            }));
        }
    }, [dispatch, searchParams?.version, reduxPrompt]);

    // Optimized caret position calculation with caching for EasyMDE
    const getCaretCoordinatesAdjusted = useCallback(() => {
        if (!easyMDERef.current) return { top: 0, left: 0 };

        const cm = easyMDERef.current.codemirror;
        const cursor = cm.getCursor();
        const coords = cm.cursorCoords(cursor, 'local');
        const editorRect = cm.getWrapperElement().getBoundingClientRect();
        
        return {
            top: coords.top + 20,
            left: coords.left
        };
    }, []);

    // Debounced suggestion trigger to prevent excessive calculations
    const triggerSuggestions = useCallback((shouldShow, cursorPos = 0) => {
        // Clear existing timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        if (shouldShow) {
            // Small delay to batch multiple character inputs
            debounceTimerRef.current = setTimeout(() => {
                const coords = getCaretCoordinatesAdjusted();
                setSuggestionCoords(coords);
                setShowSuggestions(true);
                setActiveSuggestionIndex(0);
            }, 50); // 50ms debounce
        } else {
            setShowSuggestions(false);
        }
    }, [getCaretCoordinatesAdjusted]);

    // This function is now handled by EasyMDE change event
    const handlePromptChange = useCallback((value) => {
        setPrompt(value);

        if (value.trim() !== reduxPrompt.trim()) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }
    }, [reduxPrompt]);

    // This function is now handled by EasyMDE keydown event
    const handleKeyDown = useCallback((e) => {
        // This is now handled in the EasyMDE initialization
    }, []);

    const handleSuggestionClick = useCallback((suggestion) => {
        if (!easyMDERef.current) return;

        const cm = easyMDERef.current.codemirror;
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        const cursorPosition = cursor.ch;
        let newText;
        let newCursorPos;

        if (suggestion === 'add_variable') {
            const handleTabKey = (cm, event) => {
                if (event.key === 'Tab') {
                    event.preventDefault();
                    const currentValue = easyMDERef.current.value();
                    const start = currentValue.lastIndexOf('{{', cursorPosition);
                    const end = currentValue.indexOf('}}', cursorPosition);

                    if (start !== -1 && end !== -1) {
                        const textBetweenBraces = currentValue.slice(start + 2, end);
                        setKeyName(textBetweenBraces);
                        openModal(MODAL_TYPE.CREATE_VARIABLE);
                    }
                    cm.off('keydown', handleTabKey);
                }
            };

            cm.on('keydown', handleTabKey);
            const isDoubleBrace = line.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? line.slice(0, cursorPosition - 2) : line.slice(0, cursorPosition - 1);
            const afterCursor = line.slice(cursorPosition);
            newText = `${beforeCursor}{{}}${afterCursor}`;
            newCursorPos = isDoubleBrace ? cursorPosition : cursorPosition + 1;
        } else {
            const isDoubleBrace = line.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? line.slice(0, cursorPosition - 2) : line.slice(0, cursorPosition - 1);
            const afterCursor = line.slice(cursorPosition);
            newText = `${beforeCursor}{{${suggestion}}}${afterCursor}`;
            newCursorPos = beforeCursor.length + suggestion.length + 4;
        }

        // Replace the line content
        cm.replaceRange(newText, { line: cursor.line, ch: 0 }, { line: cursor.line, ch: line.length });
        
        setShowSuggestions(false);
        setActiveSuggestionIndex(0);

        // Set cursor position
        requestAnimationFrame(() => {
            cm.setCursor({ line: cursor.line, ch: newCursorPos });
            cm.focus();
        });
    }, []);

    const handleMouseDownOnSuggestion = useCallback((e) => {
        e.preventDefault();
    }, []);

    const updateEditorLayout = useCallback(() => {
        if (typeof window === 'undefined') return;

        const viewportHeight = window.innerHeight;
        const containerElement = editorContainerRef.current;
        const containerRect = containerElement?.getBoundingClientRect();
        const containerTop = containerRect?.top ?? 0;
        const bottomOffset = isPromptHelperOpen ? 0 : 24;
        const minHeight = isPromptHelperOpen ? 320 : 500;

        let nextHeight = viewportHeight - containerTop - bottomOffset;
        if (!Number.isFinite(nextHeight)) {
            nextHeight = minHeight;
        } else {
            nextHeight = Math.max(minHeight, nextHeight);
        }

        setEditorHeight((prev) => (prev === nextHeight ? prev : nextHeight));

        if (easyMDERef.current) {
            const cmInstance = easyMDERef.current.codemirror;
            const wrapperEl = cmInstance.getWrapperElement();
            const scrollerEl = cmInstance.getScrollerElement();

            cmInstance.setSize('100%', nextHeight);

            if (wrapperEl) {
                wrapperEl.style.height = `${nextHeight}px`;
                wrapperEl.style.minHeight = `${nextHeight}px`;
                wrapperEl.style.maxHeight = `${nextHeight}px`;
            }

            if (scrollerEl) {
                scrollerEl.style.height = `${nextHeight}px`;
                scrollerEl.style.minHeight = `${nextHeight}px`;
                scrollerEl.style.maxHeight = `${nextHeight}px`;
            }

            cmInstance.refresh();
        }
    }, [isPromptHelperOpen]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            window.requestAnimationFrame(updateEditorLayout);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [updateEditorLayout]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (easyMDERef.current) {
                easyMDERef.current.codemirror.refresh();
            }
            updateEditorLayout();
        }, 150);

        return () => clearTimeout(timeoutId);
    }, [isPromptHelperOpen, updateEditorLayout]);

    // Memoize suggestions to prevent unnecessary re-renders
    const suggestionItems = useMemo(() => {
        return variablesKeyValue?.map((variable, index) => ({
            key: variable.key,
            index,
            isActive: index === activeSuggestionIndex
        })) || [];
    }, [variablesKeyValue, activeSuggestionIndex]);

    const renderSuggestions = () => {
        if (!showSuggestions) return null;

        return (
            <div
                className="dropdown dropdown-open z-high"
                style={{
                    position: 'absolute',
                    top: suggestionCoords.top + 4,
                    left: suggestionCoords.left + 8,
                    willChange: 'transform', // Optimize for animations
                }}
            >
                <ul
                    ref={suggestionListRef}
                    tabIndex={0}
                    role="listbox"
                    className="dropdown-content menu menu-dropdown-toggle bg-base-100 rounded-md z-high w-60 p-2 shadow-xl border border-base-300 overflow-scroll overflow-y-auto"
                >
                    <div className="flex flex-col w-full">
                        <label className="label label-text-alt">Available variables</label>
                        {suggestionItems.map((item) => (
                            <li
                                key={item.key}
                                tabIndex={-1}
                                className={`list-item ${item.isActive ? 'bg-base-200' : ''}`}
                                onMouseDown={handleMouseDownOnSuggestion}
                                onClick={() => handleSuggestionClick(item.key)}
                            >
                                <a className='gap-3'>
                                    <span className="inline-block w-2 h-2 bg-primary rounded-full"></span>
                                    <span className="text-base-content">{item.key}</span>
                                </a>
                            </li>
                        ))}
                        <li
                            tabIndex={-1}
                            className={`list-item ${variablesKeyValue?.length === activeSuggestionIndex ? 'bg-base-200' : ''}`}
                            onMouseDown={handleMouseDownOnSuggestion}
                            onClick={() => handleSuggestionClick('add_variable')}
                        >
                            <a className='flex flex-col items-start'>
                                <span>+ Add New variable</span>
                            </a>
                        </li>
                    </div>
                </ul>
            </div>
        );
    };
    const togglePromptHelper = useCallback(() => {
        const newState = !isPromptHelperOpen;
        setIsPromptHelperOpen(newState);

        if (!newState && !isMobileView && typeof window.openTechDoc === 'function') {
            window.openTechDoc();
        } else if (newState && typeof window.closeTechDoc === 'function') {
            window.closeTechDoc();
        }
    }, [isPromptHelperOpen, isMobileView]);

    const handleCloseTextAreaFocus = useCallback(() => {
        if (typeof window.closeTechDoc === 'function') {
            window.closeTechDoc();
        }
        setIsPromptHelperOpen(false);
    }, []);

    const handleSavePrompt = useCallback(() => {
        savePrompt(prompt);
        setOldContent(prompt);
        setNewContent('');
        setHasUnsavedChanges(false);
        handleCloseTextAreaFocus();
    }, [prompt, savePrompt, handleCloseTextAreaFocus]);

    const handleOpenDiffModal = () => {
        openModal(MODAL_TYPE?.DIFF_PROMPT);
    }

    // Initialize EasyMDE
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (editorRef.current && !easyMDERef.current) {
            const easyMDE = new EasyMDE({
                element: editorRef.current,
                initialValue: prompt || '',
                spellChecker: false,
                status: false,
                toolbar: false, // Remove toolbar completely
                placeholder: 'Enter your prompt here...',
                autofocus: false,
                tabSize: 4,
                indentWithTabs: false,
                lineWrapping: true,
                styleSelectedText: false,
                forceSync: true
            });

            // EasyMDE is now ready for use

            easyMDE.codemirror.on('change', () => {
                const value = easyMDE.value();
                setPrompt(value);
                
                // Use a callback to get the latest reduxPrompt value
                setHasUnsavedChanges(prev => {
                    const currentReduxPrompt = reduxPrompt;
                    return value.trim() !== currentReduxPrompt.trim();
                });

                // Handle variable suggestions
                const cursor = easyMDE.codemirror.getCursor();
                const line = easyMDE.codemirror.getLine(cursor.line);
                const cursorPos = cursor.ch;
                const lastChar = line.slice(cursorPos - 1, cursorPos);
                const lastTwoChars = line.slice(cursorPos - 2, cursorPos);

                if (lastChar === '{' || lastTwoChars === '{{') {
                    // Use setTimeout to avoid blocking typing
                    setTimeout(() => triggerSuggestions(true, cursorPos), 0);
                } else {
                    // Check if we should close suggestions
                    const isInVariablePattern = line.slice(0, cursorPos).match(/\{\{[^}]*$/);
                    if (!isInVariablePattern || (lastChar !== '{' && lastChar !== '}')) {
                        setTimeout(() => triggerSuggestions(false), 0);
                    }
                }
            });

            easyMDE.codemirror.on('focus', () => {
                if (!isPromptHelperOpen) {
                    setIsPromptHelperOpen(true);
                    if (typeof window.closeTechDoc === 'function') {
                        window.closeTechDoc();
                    }
                }
            });

            easyMDE.codemirror.on('keydown', (cm, event) => {
                // Only handle suggestion-related keys when suggestions are visible
                if (showSuggestions && suggestionListRef.current) {
                    const suggestionItems = suggestionListRef.current.querySelectorAll('.list-item');
                    const totalItems = suggestionItems.length;
                    
                    if (totalItems > 0) {
                        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                            event.preventDefault();
                            setActiveSuggestionIndex((prevIndex) => {
                                return event.key === 'ArrowDown'
                                    ? (prevIndex + 1) % totalItems
                                    : (prevIndex - 1 + totalItems) % totalItems;
                            });
                        } else if (event.key === 'Enter') {
                            event.preventDefault();
                            suggestionItems[activeSuggestionIndex]?.click();
                        } else if (event.key === 'Escape') {
                            setShowSuggestions(false);
                        }
                    }
                }
            });

            easyMDERef.current = easyMDE;
            textareaRef.current = easyMDE.codemirror.getInputField();
            if (typeof window !== 'undefined') {
                window.requestAnimationFrame(() => {
                    updateEditorLayout();
                });
            }
        }

        return () => {
            if (easyMDERef.current) {
                easyMDERef.current.toTextArea();
                easyMDERef.current = null;
            }
        };
    }, []); // Only initialize once

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    if (service === "google" && serviceType === "chat") return null;

    return (
        <div ref={promptTextAreaRef}>
            <div className="flex justify-between items-center mb-2">
                <div className="label flex items-center gap-2">
                    <span className="label-text capitalize font-medium">Prompt</span>
                    <div className="h-4 w-px bg-base-300 mx-2"></div>
                    <div className="flex items-center justify-center">
                        <button
                            onClick={() => {
                                openModal(MODAL_TYPE?.PROMPT_SUMMARY);
                            }}
                        >
                            <InfoTooltip tooltipContent={"Prompt Summary is a brief description of the agent's prompt and applies to all versions of the agent, not just one."}>
                                <span className='label-text  capitalize font-medium bg-gradient-to-r from-blue-800 to-orange-600 text-transparent bg-clip-text'>Prompt Summary</span>
                            </InfoTooltip>
                        </button>

                    </div>
                </div>

                <div
                    className="label cursor-pointer gap-1 sm:gap-2"
                >
                    <button
                        className={`btn btn-sm ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                        onClick={handleSavePrompt}
                        disabled={!hasUnsavedChanges || prompt.trim() === reduxPrompt.trim()}
                    >
                        Save
                    </button>
                    {isPromptHelperOpen &&
                        <>
                            {!isMobileView && <button
                                className={`btn text-xs sm:text-sm btn-sm`}
                                onClick={handleOpenDiffModal}
                            >
                                Diff
                            </button>}
                            <button
                                className={`btn text-xs sm:text-sm btn-sm btn-error`}
                                onClick={handleCloseTextAreaFocus}
                            >
                                Close
                            </button>
                        </>
                    }
                </div>
            </div>
            <div className="form-control h-full">
                <div
                    ref={editorContainerRef}
                    className={`relative w-full EasyMDEContainer transition-all duration-300 ${
                        isPromptHelperOpen
                            ? "fixed left-0 right-0 bottom-0 z-40 bg-base-100"
                            : "relative"
                    }`}
                    style={{
                        height: editorHeight ? `${editorHeight}px` : undefined,
                    }}
                >
                    <textarea
                        ref={editorRef}
                        className="hidden"
                        defaultValue={prompt}
                    />
                </div>
                {showSuggestions && renderSuggestions()}
                <div className="collapse bg-gradient-to-r bg-base-1 border-t-0 border border-base-300 rounded-t-none">
                    <input type="checkbox" className="min-h-[0.75rem]" />
                    <div className="collapse-title min-h-[0.75rem] text-xs font-medium flex items-center gap-1 p-2">
                        <div className="flex items-center gap-2 ">
                            <span className="text-nowrap">Default Variables</span>
                            <p role="alert" className="label-text-alt alert p-2 bg-base-200">
                                <InfoIcon size={16} className="" />
                                Use these variables in prompt to get their functionality
                            </p>
                        </div>
                        <div className="ml-auto">
                            <ChevronDownIcon className="collapse-arrow" size={12} />
                        </div>
                    </div>
                    <div className="collapse-content">
                        <div className="text-xs">
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black rounded-full"></span>
                                    <span>&#123;&#123;current_time_and_date&#125;&#125;</span>
                                    <span className="ml-2">- To access the current date and time</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black rounded-full"></span>
                                    <span>&#123;&#123;pre_function&#125;&#125;</span>
                                    <span>- Use this variable if you are using the pre_function</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span className="inline-block w-1 h-1 bg-black  rounded-full"></span>
                                    <span>&#123;&#123;timezone&#125;&#125;</span>
                                    <span>- Access the timezone using a timezone identifier</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <span>
                                        Use custom variables like <code>&#123;&#123;your_custom_variable&#125;&#125;</code>, created from the <strong>Add Variable</strong> section, to insert dynamic values.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex flex-row gap-2 mt-8'>
                <ToneDropdown params={params} searchParams={searchParams} />
                <ResponseStyleDropdown params={params} searchParams={searchParams} />
            </div>

            <Diff_Modal oldContent={oldContent} newContent={newContent} />
            <PromptSummaryModal modalType={MODAL_TYPE.PROMPT_SUMMARY} params={params} searchParams={searchParams} />

            <PromptHelper
                isVisible={isPromptHelperOpen && !isMobileView}
                params={params}
                onClose={handleCloseTextAreaFocus}
                savePrompt={savePrompt}
                setPrompt={setPrompt}
                messages={messages}
                setMessages={setMessages}
                thread_id={thread_id}
                onResetThreadId={() => {
                    const newId = generateRandomID();
                    setThreadId(newId);
                    setThreadIdForVersionReducer && dispatch(setThreadIdForVersionReducer({
                        bridgeId: params?.id,
                        versionId: searchParams?.version,
                        thread_id: newId,
                    }));
                }}
                prompt={prompt}
                hasUnsavedChanges={hasUnsavedChanges}
                setHasUnsavedChanges={setHasUnsavedChanges}
                setNewContent={setNewContent}
                isEmbedUser={isEmbedUser}
            />
        </div>
    );
};

export default InputConfigComponent;
