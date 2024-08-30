import { createSlice } from "@reduxjs/toolkit"


const initialState ={
    webhookAlert:[],
    loading:false
}

export  const webhookAlertReducer = createSlice({
    name:"webhookAlert",
    initialState,
    reducers:{
        webhookDataReducer:(state,action)=>{
           const {data} = action.payload
           if(!state.webhookAlert)
           {
              state.webhookAlert=[]
           }
           state.webhookAlert = data;
           
        },
        createWebhookAlertReducer:(state,action)=>{
            state.webhookAlert.push(action.payload) 
        },
        updateWebhookAlertReducer:(state,action)=>{
          const {_id} = action.payload;
           if(state.webhookAlert)
           {
            const index = state.webhookAlert.findIndex(alert => alert._id === _id);
           
           if (index !== -1) {
            state.webhookAlert[index]=action.payload;
          }}
        },
        deleteWebhookAlertReducer: (state, action) => {
            const {id} = action.payload;
            if (state.webhookAlert) {
                  state.webhookAlert = state.webhookAlert.filter(alert => alert._id !== id);
                }
        }
    }
})

export const {
    createWebhookAlertReducer,
    webhookDataReducer,
    updateWebhookAlertReducer,
    deleteWebhookAlertReducer
} = webhookAlertReducer.actions

export default webhookAlertReducer.reducer;