const { createSlice } = require("@reduxjs/toolkit");

const initialState={
    tutorialData:[]
}
const tutorialReducer=createSlice({
    name:"totrial",
    initialState,
    reducers:{
          getTutorialData:(state,action)=>{
              state.tutorialData=action.payload;
          }
    }
});
export const{ getTutorialData} =tutorialReducer.actions;
export default tutorialReducer.reducer;

