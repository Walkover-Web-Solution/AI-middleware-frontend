import { getAllServices } from "@/config";
import { fetchServiceReducer } from "../reducer/serviceReducer";


export const getServiceAction = () => async (dispatch) => {
  try {
    const data = await getAllServices();
    
    if (data && data.services) {
      // Format service names by replacing underscores with spaces
      data.services = data.services.map(service => {
        if (service) {
          return {
            value: service,
            displayName: service.replace(/_/g, ' ').charAt(0).toUpperCase() + service.replace(/_/g, ' ').slice(1)
          };
        }
        return service;
      });
    }
    dispatch(fetchServiceReducer({ data: data.services }));
  } catch (error) {
    console.error(error);
  }
};