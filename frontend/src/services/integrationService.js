import { axiosInstance } from '../config/axios';
import { ENDPOINT_MAPPING } from '../constants/integrations';

export const loadIntegrationData = async (integrationType, credentials) => {
  const endpoint = ENDPOINT_MAPPING[integrationType];
  if (!endpoint) {
    throw new Error('Invalid integration type');
  }

  const formData = new FormData();
  formData.append('credentials', JSON.stringify(credentials || {}));
  
  const response = await axiosInstance.post(`integrations/${endpoint}/load`, formData);
  
  if (!response.data) {
    throw new Error('No data received from server');
  }

  const data = Array.isArray(response.data) 
    ? response.data.filter(item => item !== null)
    : [response.data].filter(item => item !== null);

  if (data.length === 0) {
    throw new Error('No valid data found in the response');
  }

  return data;
};
