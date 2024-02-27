
import { userdetails } from "@/api";
import { fetchUserDetails } from "../reducer/userDetailsReducer";



export const userDetails = () => async (dispatch, getState) => {
    try {
      const data = await userdetails();
      dispatch(fetchUserDetails(data.data.data));
    } catch (error) {
      console.error(error);
    }
  };
