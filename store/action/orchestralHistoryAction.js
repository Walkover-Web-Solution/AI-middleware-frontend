import { getOrchestralHistory, getOrchestralHistoryThread } from "@/config";
import { setError, setHistoryData, setLoading, setThreadData, addHistoryData } from "../reducer/orchestralHistoryReducer";

const normalizeOrchestralHistory = (payload) => {
  const threads = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.threads || payload?.history || [];

  return threads
    .map((thread) => ({
      thread_id: thread?.thread_id || thread?.id || thread?.threadId,
      updated_at: thread?.updated_at || thread?.updatedAt,
      created_at: thread?.created_at || thread?.createdAt,
      thread_name: thread?.thread_name || thread?.name || thread?.title,
      sub_thread: Array.isArray(thread?.sub_thread) ? thread.sub_thread : []
    }))
    .filter((thread) => thread?.thread_id);
};

const getAgentValue = (value, agentId) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (agentId && value[agentId] !== undefined) return value[agentId];
    const firstKey = Object.keys(value)[0];
    return firstKey ? value[firstKey] : '';
  }
  return '';
};

const getLastAgentValue = (value, agentsPath) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (Array.isArray(agentsPath) && agentsPath.length > 0) {
      const lastAgentId = agentsPath[agentsPath.length - 1];
      if (lastAgentId && value[lastAgentId] !== undefined) return value[lastAgentId];
    }
    const keys = Object.keys(value);
    const lastKey = keys[keys.length - 1];
    return lastKey ? value[lastKey] : '';
  }
  return '';
};

const normalizeOrchestralThread = (payload, agentId) => {
  const items = Array.isArray(payload)
    ? payload
    : payload?.data || payload?.threads || payload?.history || [];

  return items.map((item) => {
    const agentsPath = item?.agents_path || [];
    const firstAgentId = agentsPath[0];
    const lastAgentId = agentsPath[agentsPath.length - 1];
    
    // Helper to get agent name from bridge_id or tools_call_data
    const getAgentName = (currentAgentId, index) => {
      // Try to get name from tools_call_data (for connected agents)
      if (item?.tools_call_data) {
        const toolsData = item.tools_call_data[currentAgentId];
        if (Array.isArray(toolsData)) {
          for (const tool of toolsData) {
            if (tool?.transfer_agent_config?.tool_name) {
              return tool.transfer_agent_config.tool_name.replace('Agent_', '').replace(/_/g, ' ');
            }
            // Check for agent name in tool keys
            const toolKeys = Object.keys(tool || {});
            for (const key of toolKeys) {
              if (tool[key]?.name) {
                return tool[key].name;
              }
            }
          }
        }
      }
      // Fallback to generic name
      return `Agent ${index + 1}`;
    };
    
    // Construct agent flow from agents_path and tools_call_data
    const agentFlow = agentsPath.length > 0 ? {
      flow_id: `orchestral_flow_${item?.message_id?.[lastAgentId] || item?.id}`,
      agents_involved: agentsPath,
      agents_path: agentsPath,
      // Include the complete data objects for the visualization
      llm_message: item?.llm_message || {},
      user: item?.user || {},
      tools_call_data: item?.tools_call_data || {},
      flow_steps: agentsPath.map((agentId, index) => ({
        agent: agentId,
        agent_name: getAgentName(agentId, index),
        action: item?.prompt?.[agentId] ? 'process_query' : 'delegate',
        status: 'completed',
        timestamp: item?.created_at,
        level: index,
        parent: index > 0 ? agentsPath[index - 1] : null,
        children: index < agentsPath.length - 1 ? [agentsPath[index + 1]] : [],
        query: getAgentValue(item?.user, agentId),
        response: getAgentValue(item?.llm_message, agentId),
        prompt: getAgentValue(item?.prompt, agentId),
        tools_call_data: item?.tools_call_data?.[agentId] || []
      })),
      user_query: getAgentValue(item?.user, firstAgentId),
      final_response: getLastAgentValue(item?.llm_message, agentsPath)
    } : null;

    return {
      ...item,
      user: getAgentValue(item?.user, firstAgentId),
      llm_message: getLastAgentValue(item?.llm_message, agentsPath),
      chatbot_message: getLastAgentValue(item?.chatbot_message, agentsPath),
      updated_llm_message: getLastAgentValue(item?.updated_llm_message, agentsPath),
      agent_flow: agentFlow,
      // Keep original data for details view
      AiConfig: item?.AiConfig,
      variables: item?.variables,
      tokens: item?.tokens,
      latency: item?.latency,
      model: item?.model,
      service: item?.service,
      prompt: item?.prompt,
      tools_call_data: item?.tools_call_data,
      agents_path: agentsPath
    };
  });
};

export const getOrchestralHistoryAction = (agentId, page = 1, limit = 30) => async (dispatch) => {
  if (!agentId) return [];
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const payload = await getOrchestralHistory(agentId, page, limit);
    const normalized = normalizeOrchestralHistory(payload);
    
    // If page is 1, replace the data; otherwise append
    if (page === 1) {
      dispatch(setHistoryData(normalized));
    } else {
      dispatch(addHistoryData(normalized));
    }
    
    return normalized;
  } catch (error) {
    dispatch(setError(error?.message || "Failed to load orchestral history"));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};

export const getOrchestralHistoryThreadAction = ({ agentId, threadId, subThreadId }) => async (dispatch) => {
  if (!agentId || !threadId || !subThreadId) return [];
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const payload = await getOrchestralHistoryThread(agentId, threadId, subThreadId);
    const normalized = normalizeOrchestralThread(payload, agentId);
    dispatch(setThreadData(normalized));
    return normalized;
  } catch (error) {
    dispatch(setError(error?.message || "Failed to load orchestral thread"));
    return [];
  } finally {
    dispatch(setLoading(false));
  }
};
