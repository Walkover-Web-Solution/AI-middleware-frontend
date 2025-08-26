const { createSlice } = require("@reduxjs/toolkit");

const initialState={
    flowData:{
        tutorialData:[],
        apiKeyGuideData:[]
    }
}
const flowDataReducer=createSlice({
    name:"flowData",
    initialState,
    reducers:{
          getTutorialData:(state,action)=>{
              state.flowData.tutorialData=action.payload;
          },
          getApiKeyGuideData:(state,action)=>{
              state.flowData.apiKeyGuideData=action.payload;
          }
    }
});
export const{ getTutorialData, getApiKeyGuideData} =flowDataReducer.actions;
export default flowDataReducer.reducer;

