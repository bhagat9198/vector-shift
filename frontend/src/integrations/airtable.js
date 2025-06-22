// airtable.js

import { useState, useEffect } from 'react';
import {
    Alert,
    Box,
    Button,
    CircularProgress
} from '@mui/material';
import axios from 'axios';
import { axiosInstance } from '../config/axios';

export const AirtableIntegration = ({ user, org, integrationParams, setIntegrationParams }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    // Function to open OAuth in a new window
    const handleConnectClick = async () => {
        try {
            setIsConnecting(true);
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axiosInstance.post(`integrations/airtable/authorize`, formData);
            const authURL = response?.data;

            const newWindow = window.open(authURL, 'Airtable Authorization', 'width=600, height=600');

            // Polling for the window to close
            const pollTimer = window.setInterval(() => {
                if (newWindow?.closed !== false) { 
                    window.clearInterval(pollTimer);
                    handleWindowClosed();
                }
            }, 200);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    // Function to handle logic when the OAuth window closes
    const handleWindowClosed = async () => {
        try {
            const formData = new FormData();
            formData.append('user_id', user);
            formData.append('org_id', org);
            const response = await axiosInstance.post(`integrations/airtable/credentials`, formData);
            const credentials = response.data; 
            if (credentials) {
                setIsConnecting(false);
                setIsConnected(true);
                setIntegrationParams(prev => ({ ...prev, credentials: credentials, type: 'Airtable' }));
            }
            setIsConnecting(false);
        } catch (e) {
            setIsConnecting(false);
            alert(e?.response?.data?.detail);
        }
    }

    useEffect(() => {
        setIsConnected(integrationParams?.credentials ? true : false)
    }, []);

    return (
        <>
        {/* <Box sx={{mt: 2}}>
            Parameters
            <Box display='flex' alignItems='center' justifyContent='center' sx={{mt: 2}}>
                <Button 
                    variant='contained' 
                    onClick={isConnected ? () => {} :handleConnectClick}
                    color={isConnected ? 'success' : 'primary'}
                    disabled={isConnecting}
                    style={{
                        pointerEvents: isConnected ? 'none' : 'auto',
                        cursor: isConnected ? 'default' : 'pointer',
                        opacity: isConnected ? 1 : undefined
                    }}
                >
                    {isConnected ? 'Airtable Connected' : isConnecting ? <CircularProgress size={20} /> : 'Connect to Airtable'}
                </Button>
            </Box>
        </Box> */}

               <Box sx={{my: 2, width: '100%'}}>
                    {!isConnected && !isConnecting && 
                        <Button 
                            variant='contained' 
                            onClick={isConnected ? () => {} :handleConnectClick}
                            color={isConnected ? 'success' : 'primary'}
                            disabled={isConnecting}
                            style={{
                                pointerEvents: isConnected ? 'none' : 'auto',
                                cursor: isConnected ? 'default' : 'pointer',
                                opacity: isConnected ? 1 : undefined
                            }}
                        >
                            Connect to Airtabl  e
                        </Button>
                    }
                    {isConnected && <Alert sx={{width: '100%'}} severity="success">Airtable Connected</Alert>}
                    {isConnecting && <Box display='flex' alignItems='center' justifyContent='center' sx={{width: '100%'}}><CircularProgress size={20} /><Alert severity="info" sx={{mx: 2}}>Connecting...</Alert></Box>}
                </Box>

      </>
    );
}
