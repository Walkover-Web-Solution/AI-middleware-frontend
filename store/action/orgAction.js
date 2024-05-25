import { createOrg, createReponseTypeInOrg, getAllOrg } from "@/config";
import { organizationCreated, organizationsFetched, setCurrentOrgId } from "../reducer/orgReducer";
import { getAllResponseTypeSuccess } from "../reducer/responseTypeReducer";

export const createOrgAction = (dataToSend, onSuccess) => async (dispatch) => {
  try {
    const data = await createOrg(dataToSend);
    onSuccess(data);
    dispatch(organizationCreated(data));
    const orgId = data.data.data.id;
    const response = await createReponseTypeInOrg(orgId);
    dispatch(getAllResponseTypeSuccess({ responseTypes: response.data?.chatBot?.responseTypes, orgId: orgId }));
  } catch (error) {
    console.error(error);
  }
}

export const getAllOrgAction = () => async (dispatch, getState) => {
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
