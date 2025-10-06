
import { userdetails } from "@/config";
import { fetchUserDetails } from "../reducer/userDetailsReducer";



export const userDetails = () => async (dispatch, getState) => {
  try {
    const data = await userdetails();
    dispatch(fetchUserDetails(data.data.data[0]));
    return data;
  } catch (error) {
    console.error(error);
  }
};
