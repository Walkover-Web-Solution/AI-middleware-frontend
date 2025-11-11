import { 
  initializeChannel,
  addUserMessage,
  addAssistantMessage,
  updateAssistantMessage,
  editMessage,
  setChannelLoading,
  setChannelError,
  clearChannelMessages,
  loadTestCaseMessages,
  setUploadedFiles,
  setUploadedImages,
  addRtLayerMessage,
  addErrorMessage,
  updateRtLayerMessage,
  setChatTestCaseId,
  clearChatTestCaseId,
  clearChannelData
} from '../reducer/chatReducer';

// Initialize chat channel
export const initializeChatChannel = (channelId) => (dispatch) => {
  dispatch(initializeChannel({ channelId }));
};

// Send user message (for dry run API)
export const sendUserMessage = (channelId, messageContent, messageId) => (dispatch) => {
  const timestamp = Date.now();
  const userMessage = {
    id: messageId || `user_${timestamp}`,
    sender: "user",
    playground: true,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    content: messageContent.replace(/\n/g, "  \n"), // Markdown line break
  };

  dispatch(addUserMessage({ channelId, message: userMessage }));
  return userMessage;
};

// Add loading assistant message
export const addLoadingAssistantMessage = (channelId, messageId) => (dispatch) => {
  const timestamp = Date.now();
  const loadingMessage = {
    id: messageId || `assistant_${timestamp}`,
    sender: "assistant",
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    content: "",
    isLoading: true,
  };

  dispatch(addAssistantMessage({ channelId, message: loadingMessage }));
  return loadingMessage;
};

// Update assistant message with response
export const updateAssistantMessageWithResponse = (channelId, messageId, responseData) => (dispatch) => {
  const content = responseData?.content || "";
  const additionalData = {
    fallback: responseData?.fallback,
    firstAttemptError: responseData?.firstAttemptError,
    image_urls: responseData?.image_urls || [],
    model: responseData?.model,
    finish_reason: responseData?.finish_reason,
    role: responseData?.role || "assistant"
  };

  dispatch(updateAssistantMessage({ 
    channelId, 
    messageId, 
    content, 
    additionalData 
  }));
};

// Edit message action
export const editChatMessage = (channelId, messageId, newContent) => (dispatch) => {
  dispatch(editMessage({ channelId, messageId, newContent }));
};

// Set loading state
export const setChatLoading = (channelId, loading) => (dispatch) => {
  dispatch(setChannelLoading({ channelId, loading }));
};

// Set error state
export const setChatError = (channelId, error) => (dispatch) => {
  dispatch(setChannelError({ channelId, error }));
};

// Clear chat messages
export const clearChatMessages = (channelId) => (dispatch) => {
  dispatch(clearChannelMessages({ channelId }));
};

// Load test case into chat
export const loadTestCaseIntoChat = (channelId, testCaseConversation, expected, testCaseId) => (dispatch) => {
  const convertedMessages = [];
  const baseTimestamp = Date.now();

  testCaseConversation.forEach((msg, index) => {
    const chatMessage = {
      id: `testcase_${msg.role}_${baseTimestamp}_${index}`,
      sender: msg.role === 'user' ? 'user' : 'assistant',
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
    };
    convertedMessages.push(chatMessage);
  });

  if (expected?.response) {
    const expectedMessage = {
      id: `testcase_expected_${baseTimestamp}`,
      sender: 'expected',
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      content: expected.response,
      isExpected: true,
    };
    convertedMessages.push(expectedMessage);
  }

  // Convert to conversation format for the backend
  const backendConversation = testCaseConversation.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  dispatch(loadTestCaseMessages({ 
    channelId, 
    messages: convertedMessages, 
    conversation: backendConversation,
    testCaseId 
  }));
};

// Set uploaded files
export const setChatUploadedFiles = (channelId, files) => (dispatch) => {
  dispatch(setUploadedFiles({ channelId, files }));
};

// Set uploaded images
export const setChatUploadedImages = (channelId, images) => (dispatch) => {
  dispatch(setUploadedImages({ channelId, images }));
};

// RT Layer Actions

// Add error message as chat message (for RT layer errors only)
export const addChatErrorMessage = (channelId, error) => (dispatch) => {
  dispatch(addErrorMessage({ channelId, error }));
  // Clear loading state when error occurs
  dispatch(setChatLoading(channelId, false));
};

// Handle incoming RT layer message
export const handleRtLayerMessage = (channelId, socketMessage) => (dispatch) => {
  const timestamp = Date.now();
  
  // Determine message type and create UI message
  const messageType = socketMessage.role || socketMessage.sender || 'assistant';
  
  const uiMessage = {
    id: socketMessage.id || `rt_${messageType}_${timestamp}`,
    sender: messageType,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    content: socketMessage.content || "",
    isLoading: socketMessage.isStreaming || false,
    // Include additional RT layer data
    ...socketMessage
  };

  dispatch(addRtLayerMessage({ 
    channelId, 
    message: uiMessage, 
    messageType 
  }));

  // Clear loading state when RT layer message is received
  dispatch(setChatLoading(channelId, false));
  return uiMessage;
};

// Handle RT layer streaming update
export const handleRtLayerStreamingUpdate = (channelId, messageId, content, isComplete = false) => (dispatch) => {
  dispatch(updateRtLayerMessage({ 
    channelId, 
    messageId, 
    content, 
    isComplete 
  }));

  // Clear loading state when streaming is complete
  if (isComplete) {
    dispatch(setChatLoading(channelId, false));
  }
};

// Clear all channel data (when switching agents)
export const clearChatChannelData = (channelId) => (dispatch) => {
  dispatch(clearChannelData({ channelId }));
};

// Combined action for sending message and handling RT response
export const sendMessageWithRtLayer = (channelId, messageContent, apiCall, isOrchestralModel = false) => async (dispatch) => {
  try {
    // Set loading state
    dispatch(setChatLoading(channelId, true));
    
    // Send user message
    const userMessage = dispatch(sendUserMessage(channelId, messageContent));
    
    // Add loading assistant message
    const loadingMessage = dispatch(addLoadingAssistantMessage(channelId));
    
    // Make API call (this should trigger RT layer response)
    const response = await apiCall({
      conversation: [], // Will be populated from Redux state
      user: messageContent
    });

    // For orchestral models, handle immediately and clear loading
    if (isOrchestralModel) {
      dispatch(updateAssistantMessageWithResponse(channelId, loadingMessage.id, response));
      dispatch(setChatLoading(channelId, false)); // Clear loading only for orchestral models
    }
    // For all other responses (including RT layer), loading will ONLY be cleared when RT message is received
    // Do NOT clear loading based on API response - wait for actual RT layer message
    
    return { userMessage, loadingMessage, response };
  } catch (error) {
    dispatch(setChatError(channelId, error.message));
    dispatch(setChatLoading(channelId, false)); // Clear loading on error
    throw error;
  }
  // Note: No finally block - loading cleared only when RT response received or on error
};

// Set testcase_id for channel (persisted until manual clear)
export const setChatTestCaseIdAction = (channelId, testCaseId) => (dispatch) => {
  dispatch(setChatTestCaseId({ channelId, testCaseId }));
};

// Clear testcase_id for channel (manual clear only)
export const clearChatTestCaseIdAction = (channelId) => (dispatch) => {
  dispatch(clearChatTestCaseId({ channelId }));
};
