const { createSlice } = require("@reduxjs/toolkit");

const initialState={
    flowData:{
        tutorialData:[],
        apiKeyGuideData:[],
        guardrailsTemplatesData:[]
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
          },
          getGuardrailsTemplatesData:(state,action)=>{
              state.flowData.guardrailsTemplatesData=action.payload;
          }
    }
});
export const{ getTutorialData, getApiKeyGuideData, getGuardrailsTemplatesData} =flowDataReducer.actions;
export default flowDataReducer.reducer;

