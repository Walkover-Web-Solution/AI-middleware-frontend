import { pickFields } from "@/utils/utility";
import { createSlice } from "@reduxjs/toolkit";
import { cloneDeep } from "lodash";

const initialState = {
 authData : [] ,
  loading: false
};

const authFields = [
  "authkey",
  "created_at",
  "name",
  "id"
];

export const authDataReducer = createSlice({
  name: "authData",
  initialState,
  reducers: {
     fetchAllAuthData : (state, action) => {
      const cleanedAuthData = action.payload.map(auth =>
        pickFields(auth, authFields)
      );
   
      state.authData = cleanedAuthData;
    } ,
     addAuthData : (state, action) => {
      const newAuth = pickFields(action.payload.data, authFields);
      state.authData = [newAuth, ...state.authData];
    },
    removeAuthData: (state, action) => {
      const id = action.payload;
      state.authData = state.authData.filter(item => item.id !== id);
    }
   
  },
});

export const {
    fetchAllAuthData ,
    addAuthData,
    removeAuthData
} = authDataReducer.actions;
export default authDataReducer.reducer;


