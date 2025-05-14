import { pickFields } from "@/utils/utility";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: {},
  organizations: [],
  loading: false,
  success: false
};

const userFields = [
  "id", "name", "email", "created_at"
];


const companyFields = [
  "id", "name", "email", "timezone", "created_at",
  "meta"
];

export const userDetailsReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserDetails: (state, action) => {
      const user = action.payload;

      // 1. Set trimmed userDetails
      state.userDetails = pickFields(user, userFields);

      // 2. Map companies with filtered fields
      state.organizations = (user.c_companies || []).reduce((acc, company) => {
        acc[company.id] = pickFields(company, companyFields);
        return acc;
      }, {});

      // 3. Set currentCompany
      state.currentCompany = user.currentCompany
        ? pickFields(user.currentCompany, companyFields)
        : null;

      // 4. Set success flag
      state.success = user.success ?? true;
    },
    updateUserDetails: (state, action) => {
      const { orgId, updatedUserDetails } = action.payload;

      // Update the organization with only selected fields
      state.organizations[orgId] = {
        ...state.organizations[orgId], // Preserve existing values
        ...pickFields(updatedUserDetails, companyFields), // Merge updates
      };
    },
    updateToken: (state, action) => {
      const { auth_token, orgId } = action.payload;
      state.organizations[orgId] = {
        ...state.organizations[orgId],
        meta: {
          ...state.organizations[orgId]?.meta,
          auth_token: auth_token
        }
      }
    }
  },
});

export const {
  fetchUserDetails,
  updateUserDetails,
  updateToken
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;