import { createSlice } from "@reduxjs/toolkit";

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
      // state.allBridges = [...state.allBridges , action.payload] 
      // state.singleBridgeData = action.payload
    },
    updateBridgeReducer : (state, action) => {
      
    }
  },
});

export const {
    fetchAllBridgeReducer, 
    fetchSingleBridgeReducer,
    createBridgeReducer,
    updateBridgeReducer
} = bridgeReducer.actions;
export default bridgeReducer.reducer;
