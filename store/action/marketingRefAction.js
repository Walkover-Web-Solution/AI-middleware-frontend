import { storeMarketingRefUser } from "@/config";

export const storeMarketingRefUserAction = (data) => async () => {
  try {
    const response = await storeMarketingRefUser(data);
    return response.data;


  } catch (error) {
    console.error(error);
    return error;
  }
};
