import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  allBridgesMap: {},
  org: {},
  apikeys:{},
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
    // fetchSingleBridgeReducer: (state, action) => {
    //   const { bridges, integrationData } = action.payload;
    //   const responseFormat = handleResponseFormat(bridges);
    //   const { _id, configuration: { model: { default: modelDefault } }, service, type } = bridges;
    //   const obj2 = modelInfo[service][modelDefault];
    //   const response = updatedData(bridges, obj2, type);
    //   state.allBridgesMap[_id] = { ...(state.allBridgesMap[_id] || {}), ...response, integrationData, responseFormat };
    //   state.loading = false;
    // },

    // new format
    fetchSingleBridgeReducer: (state, action) => {
      const { bridge } = action.payload;
      const { _id } = bridge;
      state.allBridgesMap[_id] = { ...(state.allBridgesMap[_id] || {}), ...bridge };
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
    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId]?.orgs?.push(action.payload.data.data.bridge);
    },
    updateBridgeReducer: (state, action) => {
      const { bridges, functionData } = action.payload;
      // const responseFormat = handleResponseFormat(bridges);
      const { _id, configuration, ...extraData } = bridges;
      // const modelDefault = configuration.model.default;
      // const obj2 = modelInfo[service][modelDefault];
      // const response = updatedData(bridges, obj2, type);

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
        const bridgeIds = state.org[bridges.org_id].functionData[functionData.function_id]?.['bridge_ids'] || [];
        if (functionData?.function_operation) {
          bridgeIds.push(_id);
        } else {
          // i want to remove function_id from function_ids array
          const index = bridgeIds?.indexOf(_id);
          if (index !== -1) {
            bridgeIds?.splice(index, 1);
          }
        }
      }
      state.loading = false;
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
      const { data, bridgeId } = action.payload;
      state.allBridgesMap[bridgeId].variables = data;
    },
    duplicateBridgeReducer: (state, action) => {
      state.allBridgesMap[action.payload.result._id] = action.payload.result;
      state.org[action.payload.result.org_id].orgs.push(action.payload.result);
      state.loading = false;
    },
    apikeyDataReducer: (state, action) => {
      const { org_id,data } = action.payload;
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
      const { org_id, id, data,name,comment } = action.payload;
      if (state.apikeys[org_id]) {
      const index = state.apikeys[org_id].findIndex(apikey => apikey._id === id);
      if (index !== -1) {
          state.apikeys[org_id][index].name = name || state.apikeys[org_id][index].name;
          state.apikeys[org_id][index].apikey = data || state.apikeys[org_id][index].apikey;
          state.apikeys[org_id][index].comment = comment ||state.apikeys[org_id][index].comment;
        }
      }
    },
      apikeyDeleteReducer: (state, action) => {
      const {org_id,name} = action.payload;
      if (state.apikeys[org_id]) {
            state.apikeys[org_id] = state.apikeys[org_id].filter(apiKey => apiKey.name !== name);
          }
        }
        
      },
});

export const {
  isPending,
  isError,
  fetchAllBridgeReducer,
  fetchAllFunctionsReducer,
  fetchSingleBridgeReducer,
  createBridgeReducer,
  updateBridgeReducer,
  updateBridgeToolsReducer,
  deleteBridgeReducer,
  integrationReducer,
  updateVariables,
  duplicateBridgeReducer,
  apikeyDataReducer,
  apikeyUpdateReducer,
  createApiKeyReducer,
  apikeyDeleteReducer
} = bridgeReducer.actions;

export default bridgeReducer.reducer;



