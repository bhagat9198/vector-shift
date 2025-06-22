import React from 'react';
import {
  Box,
  TextField,
  Paper,
  Alert,
  Button,
  Typography,
  CircularProgress
} from '@mui/material';
import MuiRowRadioButtonsGroup from '../forms/MuiRowRadioButtonsGroup';
import CollapsibleTable from '../tables/CollapsibleTable';
import { INTEGRATION_TYPES } from '../../constants/integrations';
import { loadIntegrationData } from '../../services/integrationService';
import useIntegrationForm from '../../hooks/useIntegrationForm';
import { NotionIntegration } from '../../integrations/notion';
import { AirtableIntegration } from '../../integrations/airtable';
import { HubSpotIntegration } from '../../integrations/hubspot';
import MuiAppBar from '../ui/MuiAppBar';

const IntegrationForm = () => {
  const {
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
  } = useIntegrationForm();

  const handleLoad = async () => {
    if (!integrationParams?.type) {
      alert('Please select an integration type first');
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadIntegrationData(integrationParams.type, integrationParams.credentials);
      setLoadedData(data);
      setError(null);
    } catch (e) {
      console.error('Error loading data:', e);
      setError(e.message || 'Failed to load data');
      setLoadedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderIntegrationComponent = () => {
    switch (currType) {
      case INTEGRATION_TYPES.NOTION:
        return <NotionIntegration user={user} org={org} integrationParams={integrationParams} setIntegrationParams={setIntegrationParams} />;
      case INTEGRATION_TYPES.AIRTABLE:
        return <AirtableIntegration user={user} org={org} integrationParams={integrationParams} setIntegrationParams={setIntegrationParams} />;
      case INTEGRATION_TYPES.HUBSPOT:
        return <HubSpotIntegration user={user} org={org} integrationParams={integrationParams} setIntegrationParams={setIntegrationParams} />;
      default:
        return null;
    }
  };

  return (
    <>
      <MuiAppBar />
      <Paper elevation={3} sx={{ px: 5, py: 1, m: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexDirection="row">
          <Box display="flex" justifyContent="center" alignItems="center">
            <TextField
              label="User"
              value={user}
              onChange={handleUserChange}
              sx={{ m: 1 }}
            />
            <TextField
              label="Organization"
              value={org}
              onChange={handleOrgChange}
              sx={{ m: 1 }}
            />
          </Box>
          <Box>
            <MuiRowRadioButtonsGroup
              label="Integration Type"
              options={Object.values(INTEGRATION_TYPES)}
              value={currType}
              onChange={handleTypeChange}
            />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ px: 5, py: 1, m: 2 }}>
        {!currType ? (
          <Alert severity="error">Please select an integration type.</Alert>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>{renderIntegrationComponent()}</Box>
            {integrationParams?.credentials && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isLoading ? (
                  <Button
                    variant="contained"
                    disabled
                    startIcon={<CircularProgress size={20} />}
                  >
                    Loading...
                  </Button>
                ) : !loadedData || loadedData?.error ? (
                  <Button
                    onClick={handleLoad}
                    variant="contained"
                  >
                    Load Data
                  </Button>
                ) : null}
                {loadedData && !loadedData.error && (
                  <Button onClick={clearData} variant="outlined">
                    Clear Data
                  </Button>
                )}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {error && (
        <Box sx={{ px: 5, py: 1, m: 2, textAlign: 'center' }}>
          <Alert severity="error">
            <Typography variant="subtitle1">Error Loading Data</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Box>
      )}

      {loadedData?.length > 0 && (
        <Box sx={{ px: 5, py: 1, m: 2 }}>
          <CollapsibleTable data={loadedData} />
        </Box>
      )}
    </>
  );
};

export default IntegrationForm;
