import { configureStore } from "@reduxjs/toolkit"; 
import  bridgeReducer  from "./reducer/bridgeReducer";
import  modelReducer  from "./reducer/modelReducer";
import  historyReducer  from "./reducer/historyReducer";
import  dryRunReducer  from "./reducer/dryRunReducer";



// import thunk from 'redux-thunk'; // Import Redux Thunk
export const store = configureStore({
    reducer:{
        bridgeReducer ,
        modelReducer ,
        historyReducer, 
        dryRunReducer
    },
})