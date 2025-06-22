import { useState } from 'react';
import { INTEGRATION_TYPES, ENDPOINT_MAPPING } from '../constants/integrations';

const useIntegrationForm = () => {
  const [integrationParams, setIntegrationParams] = useState({});
  const [user, setUser] = useState('TestUser');
  const [org, setOrg] = useState('TestOrg');
  const [currType, setCurrType] = useState(null);
  const [loadedData, setLoadedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetForm = () => {
    setIntegrationParams({});
    setLoadedData(null);
    setError(null);
  };

  const handleUserChange = (e) => {
    setUser(e.target.value);
    resetForm();
    setCurrType(null);
  };

  const handleOrgChange = (e) => {
    setOrg(e.target.value);
    resetForm();
    setCurrType(null);
  };

  const handleTypeChange = (e, value) => {
    resetForm();
    setCurrType(value);
  };

  const clearData = () => {
    setLoadedData(null);
    setError(null);
  };

  return {
    user,
    org,
    currType,
    integrationParams,
    loadedData,
    isLoading,
    error,
    setIntegrationParams,
    handleUserChange,
    handleOrgChange,
    handleTypeChange,
    clearData,
    setIsLoading,
    setError,
    setLoadedData,
  };
};

export default useIntegrationForm;
