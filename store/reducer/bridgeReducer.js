import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { updatedData } from "@/utils/utility";
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
    fetchSingleBridgeReducer: (state, action) => {
      const obj1 = action.payload.bridges  // obj1
      const model = action.payload.bridges.configuration.model.default
      const service = action.payload.bridges.service
      const obj2 = modelInfo[service][model]  // obj2
      const response = updatedData(obj1, obj2, action.payload.bridges.type)
      state.allBridgesMap = { ...state.allBridgesMap, [action.payload.bridges._id]: { ...response, integrationData: action.payload.integrationData } }
    },

    fetchAllBridgeReducer: (state, action) => {
      state.org = { ...state.org, [action.payload.orgId]: [...action.payload.bridges] }
    },

    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId].push(action.payload.data.data.bridge)
    },
    updateBridgeReducer: (state, action) => {
      const obj1 = action.payload.bridges  // obj1
      const model = action.payload.bridges.configuration.model.default
      const service = action.payload.bridges.service
      const obj2 = modelInfo[service][model]  // obj2
      const response = updatedData(obj1, obj2, action.payload.bridges.type)
      state.allBridgesMap = { ...state.allBridgesMap, [action.payload.bridges._id]: { ...response } }
    },
    deleteBridgeReducer: (state, action) => {
      const bridgeId = action.payload.bridgeId;
      const orgId = action.payload.orgId;
      const BridgeClone = cloneDeep(state.allBridgesMap);
      if (BridgeClone[bridgeId]) delete BridgeClone[bridgeId]
      const updatedBridges = state.org[orgId].filter(bridge => bridge._id !== bridgeId);
      state.org[orgId] = updatedBridges
      state.allBridgesMap = BridgeClone;
    },
    integrationReducer: (state, action) => {
      const { intregration, id } = action.payload;
      const newdata = { ...state.allBridgesMap[id], integrationData: intregration }
      state.allBridgesMap[id] = newdata;
    }
  },
});

export const {
  fetchAllBridgeReducer,
  fetchSingleBridgeReducer,
  createBridgeReducer,
  updateBridgeReducer,
  deleteBridgeReducer,
  integrationReducer
} = bridgeReducer.actions;
export default bridgeReducer.reducer;
