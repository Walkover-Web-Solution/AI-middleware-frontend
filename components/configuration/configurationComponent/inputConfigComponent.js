import CreateVariableModal from '@/components/modals/createVariableModal';
import OptimizePromptModal from '@/components/modals/optimizePromptModal';
import { useCustomSelector } from '@/customHooks/customSelector';
import { updateBridgeVersionAction } from '@/store/action/bridgeAction';
import { MODAL_TYPE } from '@/utils/enums';
import { generateRandomID, openModal } from '@/utils/utility';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import PromptSummaryModal from '../../modals/PromptSummaryModal';
import ToneDropdown from './toneDropdown'; 
import ResponseStyleDropdown from './responseStyleDropdown'; // Import the new component
import GuardrailSelector from './guardrailSelector'; // Import the new component
import { ChevronDownIcon, InfoIcon } from '@/components/Icons';
import InfoTooltip from '@/components/InfoTooltip';
import PromptHelper from '../../PromptHelper';
import { setIsFocusReducer } from '@/store/reducer/bridgeReducer';
import Diff_Modal from '@/components/modals/Diff_Modal';

const InputConfigComponent = ({ params, searchParams, promptTextAreaRef  }) => {
    const { prompt: reduxPrompt, service, serviceType, variablesKeyValue, bridge } = useCustomSelector((state) => ({
        prompt: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.prompt || "",
        serviceType: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.configuration?.type || "",
        service: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.service || "",
        variablesKeyValue: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version]?.variables || [],
        bridge: state?.bridgeReducer?.bridgeVersionMapping?.[params?.id]?.[searchParams?.version] || ""
    }));
    useEffect(() => {
        if (!bridge.guardrails) {
            dispatch(updateBridgeVersionAction({
                versionId: searchParams?.version,
                dataToSend: {
                    guardrails:{
                    is_enabled:false,
                    guardrails_configuration: {
                        data_leakage: false,
                        prompt_injection: false,
                        jailbreaking: false,
                        bias: false,
                        toxicity: false,
                        privacy: false,
                        hallucination: false,
                        violence: false,
                        illegal_activity: false,
                        misinformation: false,
                    },
                    guardrails_custom_prompt:""
                }
            }}))
        }
    }, [bridge]);    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

    const [oldContent, setOldContent] = useState(reduxPrompt);
    const [newContent, setNewContent] = useState('');
    const [keyName, setKeyName] = useState('');
    const suggestionListRef = useRef(null);
    const textareaRef = useRef(null);
    const [prompt, setPrompt] = useState(reduxPrompt);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const thread_id = useMemo(() => generateRandomID(), []);
    const dispatch = useDispatch();
    const [isTextareaFocused, setIsTextareaFocused] = useState(false);
   
    useEffect(() => {
        dispatch(setIsFocusReducer(isTextareaFocused));
    }, [isTextareaFocused]);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
          const textareaElement = promptTextAreaRef?.current?.querySelector('textarea');
          if (textareaElement&&isTextareaFocused) {
              promptTextAreaRef.current.scrollIntoView({ behavior: 'smooth' });
             
          }
      }, 100);
      return () => clearTimeout(timeoutId);
  }, [isTextareaFocused]);
    useEffect(() => {
        setPrompt(reduxPrompt);
        setHasUnsavedChanges(false);
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
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
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
    const getCaretCoordinatesAdjusted = () => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const { selectionStart, scrollTop, scrollLeft, offsetTop, offsetLeft } = textarea;

            // Create a temporary element
            const div = document.createElement('div');
            document.body.appendChild(div);

            // Copy the styles of the textarea to the temporary div
            const styles = window.getComputedStyle(textarea);
            for (let style of styles) {
                div.style[style] = styles.getPropertyValue(style);
            }

            // Set specific styles for accurate position calculation
            div.style.position = 'absolute';
            div.style.visibility = 'hidden';
            div.style.whiteSpace = 'pre-wrap';
            div.style.overflow = 'hidden';

            // Copy text up to the caret position to the div
            const text = textarea.value.substring(0, selectionStart);
            div.textContent = text;

            // Insert a special character to mark the caret position
            const caretMarker = document.createElement('span');
            caretMarker.textContent = '|';
            div.appendChild(caretMarker);

            // Get the position of the caret marker
            const { offsetTop: markerTop, offsetLeft: markerLeft } = caretMarker;

            // Clean up by removing the temporary element
            document.body.removeChild(div);

            return {
                top: markerTop + offsetTop - scrollTop,
                left: markerLeft + offsetLeft - scrollLeft,
            };
        }

        return { top: 0, left: 0 };
    };

    const handlePromptChange = useCallback((e) => {
        const value = e.target.value;
        setPrompt(value);
        
        if (value.trim() !== reduxPrompt.trim()) {
            setHasUnsavedChanges(true);
        } else {
            setHasUnsavedChanges(false);
        }

        const cursorPos = e.target.selectionStart;
        const lastChar = value.slice(cursorPos - 1, cursorPos);
        const lastTwoChars = value.slice(cursorPos - 2, cursorPos);

        if (lastChar === '{' || lastTwoChars === '{{') {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }, [reduxPrompt]);

    const handleKeyDown = useCallback((e) => {
        if (!suggestionListRef.current) return;

        const suggestionItems = suggestionListRef.current.querySelectorAll('.list-item');
        const totalItems = suggestionItems.length;
        if (totalItems === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((prevIndex) => {
                return e.key === 'ArrowDown'
                    ? (prevIndex + 1) % totalItems
                    : (prevIndex - 1 + totalItems) % totalItems;
            });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            suggestionItems[activeSuggestionIndex]?.click();
        }
    }, [activeSuggestionIndex]);

    const handleSuggestionClick = useCallback((suggestion) => {
        const textarea = textareaRef.current;
        const cursorPosition = textarea.selectionStart;

        let newPrompt;
        let newCursorPosition;

        if (suggestion === 'add_variable') {
            const handleTabKey = (e) => {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    // Find the last `{{` before the cursor position
                    const start = textarea.value.lastIndexOf('{{', cursorPosition);
                    // Find the first `}}` after the cursor position
                    const end = textarea.value.indexOf('}}', cursorPosition);

                    // Ensure both `{{` and `}}` exist
                    if (start !== -1 && end !== -1) {
                        // Extract the text between `{{` and `}}`
                        const textBetweenBraces = textarea.value.slice(start + 2, end);

                        setKeyName(textBetweenBraces);
                        openModal(MODAL_TYPE.CREATE_VARIABLE)
                    }
                    // Remove event listener after showing modal
                    textarea.removeEventListener('keydown', handleTabKey);
                }
            };

            textarea.addEventListener('keydown', handleTabKey);
            const isDoubleBrace = prompt.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? prompt.slice(0, cursorPosition - 2) : prompt.slice(0, cursorPosition - 1);
            const afterCursor = prompt.slice(cursorPosition);
            newPrompt = `${beforeCursor}{{}}${afterCursor}`;
            // newCursorPosition = cursorPosition + 1; // Position cursor between the brackets
            newCursorPosition = isDoubleBrace ? cursorPosition : cursorPosition + 1;
        } else {
            const isDoubleBrace = prompt.slice(cursorPosition - 2, cursorPosition) === '{{';
            const beforeCursor = isDoubleBrace ? prompt.slice(0, cursorPosition - 2) : prompt.slice(0, cursorPosition - 1);
            const afterCursor = prompt.slice(cursorPosition);
            newPrompt = `${beforeCursor}{{${suggestion}}}${afterCursor}`;
            newCursorPosition = beforeCursor.length + suggestion.length + 4; // Adjust for `{{}}`
        }

        setPrompt(newPrompt);
        setShowSuggestions(false);
        setActiveSuggestionIndex(0);

        textarea.focus();

        setTimeout(() => {
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }, [prompt]);

    const handleMouseDownOnSuggestion = useCallback((e) => {
        e.preventDefault();
    }, []);

    const renderSuggestions = () => {
        return (
            <div className="dropdown dropdown-open z-high" style={{
                position: 'absolute',
                top: getCaretCoordinatesAdjusted().top + 4,
                left: getCaretCoordinatesAdjusted().left + 8,
            }}>
                <ul
                    ref={suggestionListRef}
                    tabIndex={0}
                    role="listbox"
                    className="dropdown-content menu menu-dropdown-toggle bg-base-100 rounded-md z-high w-60 p-2 shadow-xl border border-base-300 overflow-scroll overflow-y-auto"
                >
                    <div className="flex flex-col w-full">
                        <label className="label label-text-alt">Available variables</label>
                        {(variablesKeyValue || []).map((suggestion, index) => (
                            <li

                                tabIndex={-1}
                                className={`list-item ${index === activeSuggestionIndex ? 'bg-blue-100' : ''} `}
                                key={index}
                                onMouseDown={handleMouseDownOnSuggestion}
                                onClick={() => handleSuggestionClick(suggestion.key)}
                            >
                                <a className='gap-3'>
                                    <span className="inline-block w-2 h-2 bg-blue-300 rounded-full"></span>
                                    <span>{suggestion.key}
                                    </span>
                                </a>
                            </li>
                        ))}
                        <li

                            tabIndex={-1}
                            className={`list-item ${variablesKeyValue?.length === activeSuggestionIndex ? 'bg-blue-100' : ''} `}
                            onMouseDown={handleMouseDownOnSuggestion}
                            onClick={() => handleSuggestionClick('add_variable')}
                        >
                            <a className='flex flex-col items-start'>
                                <span>+ Add New variable</span>
                                {variablesKeyValue?.length === activeSuggestionIndex && <p className='text-xs'>Press Tab after writing key name</p>}
                            </a>
                        </li>
                    </div>
                </ul>
            </div>
        );
    };

    const handleTextareaFocus = useCallback(() => {
    
        setIsTextareaFocused(true);
    }, []);

    const handleCloseTextAreaFocus = useCallback((e) => {
        setIsTextareaFocused(false);
        setTimeout(() => {
            window.closeTechDoc();
        }, 150);
    }, []);

    const handleSavePrompt = useCallback(() => {
        savePrompt(prompt);
        setOldContent(prompt);
        setNewContent('');
        setHasUnsavedChanges(false);
        handleCloseTextAreaFocus();
    }, [prompt, savePrompt]);

    const handleOpenDiffModal = () => {
        openModal(MODAL_TYPE?.DIFF_PROMPT);
    }

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
          <div className='flex gap-4'>
           {isTextareaFocused&& <div
              className="label cursor-pointer gap-2"
            >
              <button
                className={`btn btn-sm ${hasUnsavedChanges ? 'btn-primary' : 'btn-disabled'}`}
                onClick={handleSavePrompt}
                disabled={!hasUnsavedChanges||prompt.trim() === reduxPrompt.trim()}
              >
                Save
              </button>
              <button
                className={`btn btn-sm`}
                disabled={!isTextareaFocused}
                onClick={handleCloseTextAreaFocus}
              >
                Close
              </button>
              {!isMobileView&&<button
                className={`btn btn-sm`}
                onClick={handleOpenDiffModal}
              >
                Diff
              </button>}
            </div>
           }
          </div>
        </div>
        <div className="form-control h-full">
          <textarea
            ref={textareaRef}
            className={`textarea border border-base-content/20 w-full resize-y relative bg-transparent z-low caret-base-content p-2 rounded-b-none ${
              isTextareaFocused 
              ? "h-[calc(100vh-60px)] border-primary shadow-md" 
              : "min-h-[80px]"
            } transition-all duration-300 ease-in-out`}
            value={prompt}
            onChange={handlePromptChange}
            onFocus={handleTextareaFocus}
          />
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

                {/* Uncomment if needed later
                      <div className="flex items-center gap-1">
                        <span className="inline-block w-1 h-1 bg-yellow-500 rounded-full"></span>
                          <span>&#123;&#123;memory&#125;&#125;</span>
                           <span>- Access GPT memory context when enabled</span>
                     </div> 
                 */}

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
      <div className=' mt-4'>  
        <GuardrailSelector params={params} searchParams={searchParams} />
      </div>
      <div className='flex flex-row gap-2 mt-8'>
       
          <ToneDropdown params={params} searchParams={searchParams} />
          <ResponseStyleDropdown params={params} searchParams={searchParams} />
        
      </div>
      <Diff_Modal oldContent={oldContent} newContent={newContent} />
      {/* <CreateVariableModal keyName={keyName} setKeyName={setKeyName} params={params} searchParams={searchParams} /> */}
      {/* <OptimizePromptModal savePrompt={savePrompt} setPrompt={setPrompt} params={params} searchParams={searchParams} messages={messages} setMessages={setMessages} thread_id={thread_id} /> */}
      <PromptSummaryModal params={params} searchParams={searchParams} />
      
      {/* PromptHelper component that appears when textarea is focused */}
      <PromptHelper 
        isVisible={isTextareaFocused&&!isMobileView}
        params={params}
        onClose={handleCloseTextAreaFocus}
        savePrompt={savePrompt}
        setPrompt={setPrompt}
        messages={messages}
        setMessages={setMessages}
        thread_id={thread_id}
        prompt={prompt}
        hasUnsavedChanges={hasUnsavedChanges}
        setHasUnsavedChanges={setHasUnsavedChanges}
        setNewContent={setNewContent}

      />
    </div>
  );
};

export default InputConfigComponent;
