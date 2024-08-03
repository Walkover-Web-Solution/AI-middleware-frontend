import { createSlice } from "@reduxjs/toolkit";
import { modelInfo } from "@/jsonFiles/allModelsConfig (1)";
import { handleResponseFormat, updatedData } from "@/utils/utility";

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
        configuration: { ...state.allBridgesMap[_id].configuration, ...configuration }
      };
      
      // if (bridgeType) {
      //   const allData = state.org[bridges.org_id];
      //   const foundBridge = allData.find(bridge => bridge._id === _id);
      //   if (foundBridge) {
      //     foundBridge.bridgeType = bridges.bridgeType;
      //   }
      // }
      state.loading = false;
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
  integrationReducer,
  updateVariables,
  duplicateBridgeReducer
} = bridgeReducer.actions;

export default bridgeReducer.reducer;



