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
    setKeyValuePair: (state, action) => {
      const bridge_id = action.payload.bridge_id;
      const { key, value } = action.payload.keyValuePair;
      if (!state.allBridgesMap[bridge_id]) {
        state.allBridgesMap[bridge_id] = { variable: [] };
      }
      if (!Array.isArray(state.allBridgesMap[bridge_id].variable)) {
        state.allBridgesMap[bridge_id].variable = [];
      }
      const existingPairIndex = state.allBridgesMap[
        bridge_id
      ].variable.findIndex((pair) => key in pair);

      if (existingPairIndex !== -1) {
        state.allBridgesMap[bridge_id].variable[existingPairIndex][key] = value;
      } else {
        state.allBridgesMap[bridge_id].variable.push({ [key]: value });
      }
    },

    removeKeyValuePair: (state, action) => {
      const { bridge_id, key } = action.payload;

      state.allBridgesMap[bridge_id].variable = state.allBridgesMap[
        bridge_id
      ].variable.filter((pair) => Object.keys(pair)[0] !== key);

      // console.log(action.payload);
    },
    isPending: (state) => {
      state.loading = true;
    },
    isError: (state) => {
      state.loading = false;
    },
    addorRemoveResponseIdInBridgeReducer: (state, action) => {
      const { response } = action.payload;
      state.allBridgesMap[response.bridge_id] = {
        ...state.allBridgesMap[response.bridge_id],
        ...response,
      };
    },
    fetchSingleBridgeReducer: (state, action) => {
      const { bridges, integrationData } = action.payload;
      const responseFormat = handleResponseFormat(bridges);
      const {
        _id,
        configuration: {
          model: { default: modelDefault },
        },
        service,
        type,
      } = bridges;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = {
        ...state.allBridgesMap[_id],
        ...response,
        integrationData,
        responseFormat,
      };
      state.loading = false;
    },
    fetchAllBridgeReducer: (state, action) => {
      state.org = {
        ...state.org,
        [action.payload.orgId]: [...action.payload.bridges],
      };
      state.loading = false;
    },
    createBridgeReducer: (state, action) => {
      state.org[action.payload.orgId].push(action.payload.data.data.bridge);
    },
    updateBridgeReducer: (state, action) => {
      const { bridges, bridgeType } = action.payload;
      const responseFormat = handleResponseFormat(bridges);
      const { _id, configuration, service, type } = bridges;
      const modelDefault = configuration.model.default;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = {
        ...state.allBridgesMap[_id],
        ...response,
        responseFormat,
      };

      if (bridgeType) {
        const allData = state.org[bridges.org_id];
        const foundBridge = allData.find((bridge) => bridge._id === _id);
        if (foundBridge) {
          foundBridge.bridgeType = bridges.bridgeType;
        }
      }
    },
    deleteBridgeReducer: (state, action) => {
      const { bridgeId, orgId } = action.payload;
      delete state.allBridgesMap[bridgeId];
      state.org[orgId] = state.org[orgId].filter(
        (bridge) => bridge._id !== bridgeId
      );
    },
    integrationReducer: (state, action) => {
      const { dataToSend, id } = action.payload;
      state.allBridgesMap[id].integrationData[dataToSend.id] = dataToSend;
    },
    updateVariables: (state, action) => {
      const { data, bridgeId } = action.payload;
      state.allBridgesMap[bridgeId].variables = data;
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
  setKeyValuePair,
  removeKeyValuePair,
  integrationReducer,
  updateVariables,
} = bridgeReducer.actions;

export default bridgeReducer.reducer;
