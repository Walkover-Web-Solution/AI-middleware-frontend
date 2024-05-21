import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { handleResponseFormat, updatedData } from "@/utils/utility";
import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

const initialState = {
  allBridgesMap: {},
  org: {},
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
      state.allBridgesMap[response.bridge_id] = { ...state.allBridgesMap[response.bridge_id], ...response }
    },
    fetchSingleBridgeReducer: (state, action) => {
      const { bridges, integrationData } = action.payload;
      const { _id, configuration: { model: { default: modelDefault } }, service, type } = bridges;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = { ...state.allBridgesMap[_id], ...response, integrationData, responseFormat: handleResponseFormat(bridges) };
      state.loading = false;
    },

    fetchAllBridgeReducer: (state, action) => {
      state.org = { ...state.org, [action.payload.orgId]: [...action.payload.bridges] }
      state.loading = false;
    },

    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId].push(action.payload.data.data.bridge)
    },
    updateBridgeReducer: (state, action) => {
      const { bridges } = action.payload;
      const { _id, configuration, service, type } = bridges;
      const modelDefault = configuration.model.default;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = {
        ...response,
        responseFormat: handleResponseFormat(bridges)
      };
    },
    deleteBridgeReducer: (state, action) => {
      const { bridgeId, orgId } = action.payload;
      delete state.allBridgesMap[bridgeId];
      state.org[orgId] = state.org[orgId].filter(bridge => bridge._id !== bridgeId);
    },
    integrationReducer: (state, action) => {
      const { intregration, id } = action.payload;
      const newdata = { ...state.allBridgesMap[id], integrationData: intregration }
      state.allBridgesMap[id] = newdata;
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
  deleteBridgeReducer,
  integrationReducer
} = bridgeReducer.actions;
export default bridgeReducer.reducer;
