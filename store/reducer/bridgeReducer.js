import { createSlice } from "@reduxjs/toolkit";
import { useRouter } from "next/navigation";

const initialState = {
 allBridgesMap : {} ,
 allBridges : [],
  loading: false,
};

export const bridgeReducer = createSlice({
  
  name: "Bridge",
  initialState,
  reducers: {
    fetchSingleBridgeReducer : (state, action) => {
      state.allBridgesMap[ action.payload?.bridges?._id] = action.payload ; 
    } ,
    fetchAllBridgeReducer : (state, action) => {
      state.allBridges = action.payload;
      const allBridgesMap = {}
      // action.payload?.map((singleBridge)=>{
      //   allBridgesMap[ singleBridge?._id ] = singleBridge ; 
      // });
      action.payload?.map((singleBridge)=>{
        allBridgesMap[ singleBridge?._id ] = singleBridge ; 
      });
      state.allBridgesMap = allBridgesMap ;

    } ,

  createBridgeReducer : (state, action) => {
    return action.payload._id
      // state.allBridges = [...state.allBridges , action.payload] 
      // state.singleBridgeData = action.payload
    },
    updateBridgeReducer : (state, action) => {
      
    },
    deleteBridgeReducer: (state, action) => {
      const bridgeId = action.payload;
      const updatedBridges = state.allBridges.filter(bridge => bridge._id !== bridgeId);
      const updatedBridgesMap = { ...state.allBridgesMap };
      delete updatedBridgesMap[bridgeId];
      state.allBridges = updatedBridges;
      state.allBridgesMap = updatedBridgesMap;
    },
    
  },
});

export const {
    fetchAllBridgeReducer, 
    fetchSingleBridgeReducer,
    createBridgeReducer,
    updateBridgeReducer
} = bridgeReducer.actions;
export default bridgeReducer.reducer;
