
import { userdetails } from "@/config/index";
import { fetchUserDetails } from "../reducer/userDetailsReducer";
import posthog from "@/utils/posthog";



export const userDetails = () => async (dispatch, getState) => {
  try {
    const data = await userdetails();
    dispatch(fetchUserDetails(data.data.data[0]));
    if (data?.data?.data[0]) {
      const userData = data.data.data[0];
      posthog.identify(userData.id, {
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`
      });

      // Check if user is new (created within last minute)
      const createdAt = new Date(userData.created_at);
      const now = new Date();
      // Allow 60 seconds buffer for signup process
      if (userData.created_at && (now - createdAt) < 60000) {
        posthog.capture('User Signed Up');
      }
    }
    return data.data.data[0];
  } catch (error) {
    console.error(error);
  }
};

