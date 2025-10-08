const { createSlice } = require("@reduxjs/toolkit");

const initialState={
    flowData:{
        tutorialData:[],
        apiKeyGuideData:[],
        guardrailsTemplatesData:[],
        descriptionsData:[]
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
          }
    }
});
export const{ getTutorialData, getApiKeyGuideData, getGuardrailsTemplatesData,getDescriptionsData} =flowDataReducer.actions;
export default flowDataReducer.reducer;

