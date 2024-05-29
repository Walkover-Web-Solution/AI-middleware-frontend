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
      const responseFormat = handleResponseFormat(bridges)
      const { _id, configuration: { model: { default: modelDefault } }, service, type } = bridges;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = { ...state.allBridgesMap[_id], ...response, integrationData, responseFormat: responseFormat };
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
      const { bridges } = action.payload.bridge;
      const bridgeType = action.payload.bridgeType
      const responseFormat = handleResponseFormat(bridges)
      const { _id, configuration, service, type } = bridges;
      const modelDefault = configuration.model.default;
      const obj2 = modelInfo[service][modelDefault];
      const response = updatedData(bridges, obj2, type);
      state.allBridgesMap[_id] = {
        ...state.allBridgesMap[_id],
        ...response,
        responseFormat: responseFormat,
      };

      if (bridgeType) {
        const allData = state.org[bridges.org_id]
        const foundBridge = allData.find(bridge => bridge._id === _id);
        if (foundBridge) {
          foundBridge.bridgeType = bridges.bridgeType;
        }
      }

    },
    deleteBridgeReducer: (state, action) => {
      const { bridgeId, orgId } = action.payload;
      delete state.allBridgesMap[bridgeId];
      state.org[orgId] = state.org[orgId].filter(bridge => bridge._id !== bridgeId);
    },
    integrationReducer: (state, action) => {
      const { dataToSend, id } = action.payload;
      let flows = state.allBridgesMap[id].integrationData.flows;
      const index = flows.findIndex(flow => flow.id === dataToSend.id);

      if (index !== -1) {
        flows[index] = dataToSend;
      } else {
        flows.push(dataToSend);
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
  deleteBridgeReducer,
  integrationReducer
} = bridgeReducer.actions;
export default bridgeReducer.reducer;
