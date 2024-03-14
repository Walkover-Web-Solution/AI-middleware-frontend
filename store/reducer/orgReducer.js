import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  organizations: [], 
  loading: false,
  error: null,
};

const orgReducer = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    organizationCreated: (state, action) => {
      if (!state.organizations) {
        state.organizations = [];
      }
      state.organizations.push(action.payload);
      // return action.payload._id
    },
    organizationsFetched: (state, action) => {
        state.organizations = action.payload.data.data; 

        const allOrgMap = {}
      
      action.payload.data.data?.map((singleOrg)=>{
        allOrgMap[ singleOrg?._id ] = singleOrg ; 
      });
      state.allOrgMap = allOrgMap ;
      },
  },
});


export const { organizationCreated, organizationsFetched} = orgReducer.actions;

export default orgReducer.reducer;
