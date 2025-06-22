export const INTEGRATION_TYPES = {
  NOTION: 'Notion',
  AIRTABLE: 'Airtable',
  HUBSPOT: 'Hubspot'
};

export const ENDPOINT_MAPPING = {
  [INTEGRATION_TYPES.NOTION]: 'notion',
  [INTEGRATION_TYPES.AIRTABLE]: 'airtable',
  [INTEGRATION_TYPES.HUBSPOT]: 'hubspot'
};

export const INTEGRATION_COMPONENTS = {
  [INTEGRATION_TYPES.NOTION]: 'NotionIntegration',
  [INTEGRATION_TYPES.AIRTABLE]: 'AirtableIntegration',
  [INTEGRATION_TYPES.HUBSPOT]: 'HubSpotIntegration'
};
