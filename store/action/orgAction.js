import { createOrg, generateAccessKey, generateGtwyAccessTokenApi, getAllOrg, updateOrganizationData, updateUser } from "@/config";
import { organizationCreated, organizationsFetched, setCurrentOrgId } from "../reducer/orgReducer";
import {  updateGtwyAccessToken, updateToken, updateUserDetails, updateUserMeta } from "../reducer/userDetailsReducer";

export const createOrgAction = (dataToSend, onSuccess) => async (dispatch) => {
  try {
    const data = await createOrg(dataToSend);
    onSuccess(data.data.data);
    dispatch(organizationCreated(data));
  } catch (error) {
    console.error(error);
  }
}

export const getAllOrgAction = () => async (dispatch) => {
  try {
    const response = await getAllOrg();
    dispatch(organizationsFetched(response.data));
  } catch (error) {
    console.error(error);
  }
};


export const setCurrentOrgIdAction = (orgId) => (dispatch) => {
  try {
    dispatch(setCurrentOrgId(orgId));
  } catch (error) {
    console.error(error);

  }
};

export const updateOrgTimeZone = (orgId, orgDetails) => async (dispatch) => {
  try {
    const response = await updateOrganizationData(orgId, orgDetails);
    dispatch(updateUserDetails({ orgId, updatedUserDetails: response?.data?.data?.company }));
  } catch (error) {
    console.error('Error updating organization timezone:', error);
    throw error;
  }
}
export const updateUserMetaOnboarding = (userId, user) => async (dispatch) => {
  try {
    const response = await updateUser({ user_id: userId, user });
    dispatch(updateUserMeta({ userId, user: response?.data?.data?.user }))
    return response
  }
  catch (error) {
    console.error("error updating user meta");
    throw error
  }
}

export const generateAccessKeyAction = (orgId) => async (dispatch) => {
  try {
    const response = await generateAccessKey();


    dispatch(updateToken({ orgId, auth_token: response?.data?.auth_token }));
  } catch (error) {
    console.error('Error updating organization timezone:', error);
    throw error;
  }
}

export const generateGtwyAccessTokenAction = (orgId) => async (dispatch) => {
  try {
    const response = await generateGtwyAccessTokenApi();
    if (response) {
      dispatch(updateGtwyAccessToken({ orgId, gtwyAccessToken: response?.data?.gtwyAccessToken }));
    }
  } catch (error) {
    console.error('Error updating organization timezone:', error);
    throw error;
  }
}

export const updateOrgMetaAction = (orgId, orgDetails) => async (dispatch) => {
  try {
    const response = await updateOrganizationData(orgId, orgDetails);
    dispatch(updateUserDetails({ orgId, updatedUserDetails: response?.data?.data?.company }));
    return response;
  } catch (error) {
    console.error('Error updating organization meta:', error);
    throw error;
  }
}
