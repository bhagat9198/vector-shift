import { useState } from 'react';
import {
  Box,
  Autocomplete,
  TextField,
  Paper,
  Alert,
  Button,
  Typography,
} from '@mui/material';
import { AirtableIntegration } from './integrations/airtable';
import { NotionIntegration } from './integrations/notion';
import { DataForm } from './data-form';
import { HubSpotIntegration } from './integrations/hubspot';
import MuiAppBar from './components/ui/MuiAppBar';
import MuiRowRadioButtonsGroup from './components/forms/MuiRowRadioButtonsGroup';
import { axiosInstance } from './config/axios';
import StickyHeadTable from './components/tables/StickyHeadTable';
import CollapsibleTable from './components/CollapsibleTable';

const integrationMapping = {
  'Notion': NotionIntegration,
  'Airtable': AirtableIntegration,
  'HubSpot': HubSpotIntegration,
};

const endpointMapping = {
  'Notion': 'notion',
  'Airtable': 'airtable',
  'Hubspot': 'hubspot',
};

export const IntegrationForm = () => {
  const [integrationParams, setIntegrationParams] = useState({});
  const [user, setUser] = useState('TestUser');
  const [org, setOrg] = useState('TestOrg');
  const [currType, setCurrType] = useState(null);
  const [loadedData, setLoadedData] = useState(null);
  const CurrIntegration = integrationMapping[currType];

  console.log("IntegrationForm :: loadedData :: ", loadedData);
  console.log("IntegrationForm :: integrationParams :: ", integrationParams);

  const handleLoad = async () => {
    if (!integrationParams?.type) {
      alert('Please select an integration type first');
      return;
    }

    const endpoint = endpointMapping[integrationParams.type];
    if (!endpoint) {
      alert('Invalid integration type');
      return;
    }

    try {
      setLoadedData([]);
      const formData = new FormData();
      formData.append('credentials', JSON.stringify(integrationParams.credentials || {}));
      const response = await axiosInstance.post(`integrations/${endpoint}/load`, formData);

      // Check for null/undefined or empty response
      if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
        throw new Error('No data found for the given parameters');
      }

      // Filter out any null items
      const data = Array.isArray(response.data)
        ? response.data.filter(item => item !== null)
        : [response.data].filter(item => item !== null);

      if (data.length === 0) {
        throw new Error('No valid data found in the response');
      }

      setLoadedData(data);
    } catch (e) {
      console.error('Error loading data:', e);
      const errorMessage = e.response?.data?.detail || e.message || 'Failed to load data';
      setLoadedData({ error: errorMessage });
    }
  }

  return (
    <>
      <MuiAppBar />
      <Paper elevation={3} sx={{ px: 5, py: 1, m: 2 }} >
        <Box display='flex' justifyContent='space-between' alignItems='center' flexDirection='row' >
          <Box display='flex' justifyContent='center' alignItems='center'>
            <TextField
              label="User"
              value={user}
              onChange={(e) => {
                setUser(e.target.value)
                setIntegrationParams({})
                setLoadedData(null)
                setCurrType(null)
              }}
              sx={{ m: 1 }}
            />
            <TextField
              label="Organization"
              value={org}
              onChange={(e) => {
                setIntegrationParams({})
                setLoadedData(null)
                setOrg(e.target.value)
                setCurrType(null)
              }}
              sx={{ m: 1 }}
            />
          </Box>
          <Box>
            <MuiRowRadioButtonsGroup
              label="Integration Type"
              options={Object.keys(integrationMapping)}
              onChange={(e, value) => {
                setIntegrationParams({})
                setCurrType(value)
                setLoadedData(null)
              }}
            />
          </Box>
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ px: 5, py: 1, m: 2 }}>
        {!currType &&
          <Box>
            <Alert severity="error">Please select an integration type.</Alert>
          </Box>
        }

        <Box display='flex' alignItems='center' justifyContent='space-between' >
          {currType &&
            <Box>
              <CurrIntegration
                user={user}
                org={org}
                integrationParams={integrationParams}
                setIntegrationParams={setIntegrationParams}
              />
            </Box>
          }

          {integrationParams?.credentials &&
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              {!loadedData &&
                <Button
                  onClick={handleLoad}
                  variant='contained'
                >
                  Load Data
                </Button>
              }
              {loadedData && loadedData?.length > 0 &&
                <Button
                  onClick={() => setLoadedData(null)}
                  variant='outlined'
                >
                  Clear Data
                </Button>
              }
            </Box>
          }

        </Box>
      </Paper>
      {loadedData?.length > 0 &&
        <Box sx={{ px: 5, py: 1, m: 2 }}>
          <CollapsibleTable data={loadedData} />
        </Box>
      }
      {loadedData?.error && (
        <Box sx={{ px: 5, py: 1, m: 2, textAlign: 'center' }}>
          <Typography color="error" variant="subtitle1" gutterBottom>
            Error Loading Data
          </Typography>
          <Typography color="textSecondary">
            {loadedData.error}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Please check your parameters and try again.
          </Typography>
        </Box>
      )}
    </>

  );
}
