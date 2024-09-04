import { createSlice } from "@reduxjs/toolkit";
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { handleResponseFormat, updatedData } from "@/utils/utility";

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
      const { bridge, integrationData } = action.payload;
      // const responseFormat = handleResponseFormat(bridges);
      const { _id } = bridge;
      // const obj2 = modelInfo[service][modelDefault];
      // const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = { ...(state.allBridgesMap[_id] || {}), ...bridge, integrationData };
      state.loading = false;
    },
    fetchAllBridgeReducer: (state, action) => {
      state.org = { ...state.org, [action.payload.orgId]: [...action.payload.bridges] };
      state.loading = false;
    },
    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId].push(action.payload.data.data.bridge);
    },
    updateBridgeReducer: (state, action) => {
      const { bridges } = action.payload;
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
        const allData = state.org[bridges.org_id];
        if (allData) {
          // Find the index of the bridge to update
          const index = allData.findIndex(bridge => bridge._id === _id);
          if (index !== -1) {
            // Update the specific bridge object within the array immutably
            state.org[bridges.org_id][index] = {
              ...state.org[bridges.org_id][index],
              ...bridges
            };
          }
        }
      }
      state.loading = false;
    },
    updateBridgeToolsReducer: (state, action) => {
      const { bridgeId, tools } = action.payload;
      state.allBridgesMap[bridgeId] = { ...state.allBridgesMap[bridgeId], configuration: { ...state.allBridgesMap[bridgeId].configuration, tools } };
    },

    deleteBridgeReducer: (state, action) => {
      const { bridgeId, orgId } = action.payload;
      delete state.allBridgesMap[bridgeId];
      state.org[orgId] = state.org[orgId].filter(bridge => bridge._id !== bridgeId);
    },
    integrationReducer: (state, action) => {
      const { dataToSend, id } = action.payload;
      state.allBridgesMap[id].integrationData[dataToSend.id] = dataToSend
    },
    updateVariables: (state, action) => {
      const { data, bridgeId } = action.payload;
      state.allBridgesMap[bridgeId].variables = data;
    },
    duplicateBridgeReducer: (state, action) => {
      state.allBridgesMap[action.payload.result._id] = action.payload.result;
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



