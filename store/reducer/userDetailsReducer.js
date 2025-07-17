import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDetails: {},
  organizations: [],
  loading: false,
  success: false
};

export const userDetailsReducer = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUserDetails: (state, action) => {
      state.userDetails = action.payload
      const org = {}
      action.payload.c_companies.forEach(element => {
        org[element.id] = element
      });
      state.organizations = org
      state.success = action.payload.success
    },
    updateUserDetails: (state, action) => {
      const { orgId, updatedUserDetails } = action.payload;
      state.organizations[orgId] = updatedUserDetails;
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
    },
    updateGtwyAccessToken: (state, action) => {
      const { gtwyAccessToken, orgId } = action.payload;
      state.organizations[orgId] = {
        ...state.organizations[orgId],
        meta: {
          ...state.organizations[orgId]?.meta,
          gtwyAccessToken: gtwyAccessToken
        }
      }
    },
    updateUserMeta: (state, action) => {
      const { user_id, user } = action.payload;
      state.userDetails = {
        ...state.userDetails,
        meta: {
          ...state.userDetails.meta,
          onboarding: user?.meta?.onboarding
        }
      }
    },
    updateUserDetialsForEmbedUser: (state, action) => {
      const validUpdates = Object.entries(action.payload).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});
      state.userDetails = {
        ...state.userDetails,
        ...validUpdates
      };
    },

  }
}
);

export const {
  fetchUserDetails,
  updateUserDetails,
  updateToken,
  updateGtwyAccessToken,
  updateUserMeta,
  updateUserDetialsForEmbedUser
} = userDetailsReducer.actions;
export default userDetailsReducer.reducer;