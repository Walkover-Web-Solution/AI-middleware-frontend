import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allBridgesMap: {},
  bridgeVersionMapping: {},
  org: {},
  apikeys: {},
  loading: false,
};

export const bridgeReducer = createSlice({
  name: "Bridge",
  initialState,
  reducers: {
    isPending: (state) => {
      state.loading = true;
    },
    isError: (state) => {
      state.loading = false;
    },
    addorRemoveResponseIdInBridgeReducer: (state, action) => {
      const { response } = action.payload;
      state.allBridgesMap[response.bridge_id] = { ...state.allBridgesMap[response.bridge_id], ...response };
    },

    // new format
    fetchSingleBridgeReducer: (state, action) => {
      const { bridge } = action.payload;
      const { _id } = bridge;
      state.allBridgesMap[_id] = { ...(state.allBridgesMap[_id] || {}), ...bridge };
      state.loading = false;
    },
    fetchSingleBridgeVersionReducer: (state, action) => {
      const { bridge } = action.payload;
      const { _id, parent_id } = bridge;
      if (!state.bridgeVersionMapping[parent_id]) {
        state.bridgeVersionMapping[parent_id] = {};
      }
      state.bridgeVersionMapping[parent_id][_id] = { ...(state.bridgeVersionMapping[parent_id][_id] || {}), ...bridge };
      state.loading = false;
    },
    fetchAllBridgeReducer: (state, action) => {
      const { bridges, orgId, integrationData, embed_token } = action.payload;
      state.org = { ...state.org, [orgId]: { ...state.org?.[orgId], orgs: [...bridges], integrationData, embed_token } };
      state.loading = false;
    },
    fetchAllFunctionsReducer: (state, action) => {
      const { orgId, functionData } = action.payload;
      state.org = { ...state.org, [orgId]: { ...state.org?.[orgId], functionData } };
      state.loading = false;
    },
    updateFunctionReducer: (state, action) => {
      const { org_id, data } = action.payload;
      const id = data._id;
      if (state.org[org_id].functionData) {
        state.org[org_id].functionData[id] = data
      }
    },
    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId]?.orgs?.push(action.payload.data.data.bridge);
    },
    createBridgeVersionReducer: (state, action) => {
      const { newVersionId, parentVersionId, bridgeId } = action.payload;
      if (!state.bridgeVersionMapping[bridgeId]) {
        state.bridgeVersionMapping[bridgeId] = {};
      }
      state.bridgeVersionMapping[bridgeId][newVersionId] = {
        ...(state.bridgeVersionMapping[bridgeId][parentVersionId] || {}),
        _id: newVersionId
      };
      state.allBridgesMap[bridgeId].versions.push(newVersionId);
    },
    updateBridgeReducer: (state, action) => {
      const { bridges, functionData } = action.payload;
      const { _id, configuration, ...extraData } = bridges;

      state.allBridgesMap[_id] = {
        ...state.allBridgesMap[_id],
        ...extraData,
        configuration: { ...configuration }
      };

      if (extraData?.bridgeType) {
        const allData = state.org[bridges.org_id]?.orgs;
        if (allData) {
          // Find the index of the bridge to update
          const index = allData.findIndex(bridge => bridge._id === _id);
          if (index !== -1) {
            // Update the specific bridge object within the array immutably
            state.org[bridges.org_id].orgs[index] = {
              ...state.org[bridges.org_id].orgs[index],
              ...bridges
            };
          }
        }
      }
      if (functionData) {
        const existingBridgeIds = state.org[bridges.org_id].functionData[functionData.function_id]?.bridge_ids || [];

        if (functionData?.function_operation) {
          // Create a new array with the added bridge_id
          state.org[bridges.org_id].functionData[functionData.function_id].bridge_ids = [...existingBridgeIds, _id];
        } else {
          // Create a new array without the removed bridge_id
          state.org[bridges.org_id].functionData[functionData.function_id].bridge_ids = existingBridgeIds.filter(id => id !== _id);
        }
      }
      state.loading = false;
    },
    updateBridgeVersionReducer: (state, action) => {
      const { bridges, functionData } = action.payload;
      const { _id, configuration, ...extraData } = bridges;
      state.bridgeVersionMapping[bridges.parent_id][bridges._id] = {
        ...state.bridgeVersionMapping[bridges.parent_id][bridges._id],
        ...extraData,
        configuration: { ...configuration }
      };
      if (functionData) {
        const existingBridgeIds = state.org[bridges.org_id].functionData[functionData.function_id]?.bridge_ids || [];

        if (functionData?.function_operation) {
          // Create a new array with the added bridge_id
          state.org[bridges.org_id].functionData[functionData.function_id].bridge_ids = [...existingBridgeIds, _id];
        } else {
          // Create a new array without the removed bridge_id
          state.org[bridges.org_id].functionData[functionData.function_id].bridge_ids = existingBridgeIds.filter(id => id !== _id);
        }
      }
      state.loading = false;
    },

    updateBridgeActionReducer: (state, action) => {
      const { bridgeId, actionData, versionId } = action.payload;
      // state.allBridgesMap[bridgeId] = { ...state.allBridgesMap[bridgeId], actions: actionData };
      state.bridgeVersionMapping[bridgeId][versionId].actions = actionData;
    },
    updateBridgeToolsReducer: (state, action) => {
      const { orgId, functionData = {} } = action.payload;
      state.org[orgId].functionData[functionData._id] = { ...(state.org[orgId].functionData[functionData._id] || {}), ...functionData };
    },

    deleteBridgeReducer: (state, action) => {
      const { bridgeId, orgId } = action.payload;
      delete state.allBridgesMap[bridgeId];
      state.org[orgId].orgs = state.org[orgId]?.orgs?.filter(bridge => bridge._id !== bridgeId);
    },
    integrationReducer: (state, action) => {
      const { dataToSend, orgId } = action.payload;
      state.org[orgId].integrationData[dataToSend.id] = dataToSend
    },
    updateVariables: (state, action) => {
      const { data, bridgeId, versionId = "" } = action.payload;
      if (versionId) {
        state.bridgeVersionMapping[bridgeId][versionId].variables = data;
      } else {
        state.allBridgesMap[bridgeId].variables = data;
      }
    },
    publishBrigeVersionReducer: (state, action) => {
      const { bridgeId = null, versionId = null, orgId = null } = action.payload;
      state.allBridgesMap[bridgeId].published_version_id = versionId;
      state.bridgeVersionMapping[bridgeId][versionId].is_drafted = false;
      state.org[orgId].orgs = state.org[orgId].orgs.map(bridge => {
        if (bridge._id === bridgeId) {
          return { ...bridge, published_version_id: versionId };
        }
        return bridge;
      });
    },
    duplicateBridgeReducer: (state, action) => {
      state.allBridgesMap[action.payload.result._id] = action.payload.result;
      state.org[action.payload.result.org_id].orgs.push(action.payload.result);
      state.loading = false;
    },
    apikeyDataReducer: (state, action) => {
      const { org_id, data } = action.payload;
      if (!state.apikeys) {
        state.apikeys = {};
      }

      if (!state.apikeys[org_id]) {
        state.apikeys[org_id] = [];
      }
      state.apikeys[org_id] = data;
    },
    createApiKeyReducer: (state, action) => {
      const { org_id, data } = action.payload;
      if (state.apikeys[org_id]) {
        state.apikeys[org_id].push(data);
      } else {
        state.apikeys[org_id] = [data];
      }
    },
    apikeyUpdateReducer: (state, action) => {
      const { org_id, id, data, name, comment } = action.payload;
      if (state.apikeys[org_id]) {
        const index = state.apikeys[org_id].findIndex(apikey => apikey._id === id);
        if (index !== -1) {
          state.apikeys[org_id][index].name = name || state.apikeys[org_id][index].name;
          state.apikeys[org_id][index].apikey = data || state.apikeys[org_id][index].apikey;
          state.apikeys[org_id][index].comment = comment || state.apikeys[org_id][index].comment;
        }
      }
    },
    apikeyDeleteReducer: (state, action) => {
      const { org_id, name } = action.payload;
      if (state.apikeys[org_id]) {
        state.apikeys[org_id] = state.apikeys[org_id].filter(apiKey => apiKey.name !== name);
      }
    },
    optimizePromptReducer: (state, action) => {
      const { bridgeId, prompt = "No optimized prompt" } = action.payload;
      state.allBridgesMap[bridgeId]['optimizePromptHistory'] = [...(state.allBridgesMap?.[bridgeId]?.['optimizePromptHistory'] || []), prompt];
    },
  },
});

export const {
  isPending,
  isError,
  fetchAllBridgeReducer,
  fetchAllFunctionsReducer,
  fetchSingleBridgeReducer,
  fetchSingleBridgeVersionReducer,
  createBridgeVersionReducer,
  createBridgeReducer,
  updateBridgeReducer,
  updateBridgeVersionReducer,
  publishBrigeVersionReducer,
  updateBridgeToolsReducer,
  deleteBridgeReducer,
  integrationReducer,
  updateVariables,
  duplicateBridgeReducer,
  apikeyDataReducer,
  apikeyUpdateReducer,
  createApiKeyReducer,
  apikeyDeleteReducer,
  updateBridgeActionReducer,
  updateFunctionReducer,
  optimizePromptReducer
} = bridgeReducer.actions;

export default bridgeReducer.reducer;