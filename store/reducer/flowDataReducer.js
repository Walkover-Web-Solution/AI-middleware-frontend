const { createSlice } = require("@reduxjs/toolkit");

const initialState={
    flowData:{
        tutorialData:[],
        apiKeyGuideData:[],
        guardrailsTemplatesData:[],
        descriptionsData:[],
        finishReasonsData:[]
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
          },
          getDescriptionsData:(state,action)=>{
              state.flowData.descriptionsData=action.payload;
          },
          getFinishReasonsData:(state,action)=>{
              state.flowData.finishReasonsData=action.payload;
          }
    }
});
export const{ getTutorialData, getApiKeyGuideData, getGuardrailsTemplatesData,getDescriptionsData, getFinishReasonsData} =flowDataReducer.actions;
export default flowDataReducer.reducer;

