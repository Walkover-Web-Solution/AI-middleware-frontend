import ModelsConfig from "@/customSelector/modelConfiguration";
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { updatedData } from "@/utils/utility";
import { createSlice } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";

const initialState = {
  allBridgesMap: {},
  org: {},
  allBridges: [],
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
      state.allBridges = action.payload.bridges;
    },

    createBridgeReducer: (state, action) => {
      state.allBridges.push(action.payload.data.bridge)
      return action.payload._id
      // state.allBridges = [...state.allBridges , action.payload] 
      // state.singleBridgeData = action.payload
    },
    updateBridgeReducer: (state, action) => {
      const obj1 = action.payload.bridges  // obj1
      const model = action.payload.bridges.configuration.model.default
      const service = action.payload.bridges.service
      const obj2 = modelInfo[service][model]  // obj2
      const response = updatedData(obj1, obj2, action.payload.bridges.type)



      state.allBridgesMap = { ...state.allBridgesMap, [action.payload.bridges._id]: { ...response } }
      // state.allBridgesMap = { ...state.allBridgesMap, [action.payload._id]: { ...action.payload } }
    },
    deleteBridgeReducer: (state, action) => {
      const bridgeId = action.payload;
      const updatedBridges = state.allBridges.filter(bridge => bridge._id !== bridgeId);
      const updatedBridgesMap = { ...state.allBridgesMap };
      delete updatedBridgesMap[bridgeId];
      state.allBridges = updatedBridges;
      state.allBridgesMap = updatedBridgesMap;
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
