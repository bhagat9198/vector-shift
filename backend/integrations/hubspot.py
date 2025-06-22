# hubspot.py

import json
import secrets
from datetime import datetime
from fastapi import Request, HTTPException
from fastapi.responses import HTMLResponse
import httpx
import asyncio
import base64
import hashlib
import requests
from urllib.parse import urlencode
from integrations.integration_item import IntegrationItem

from redis_client import add_key_value_redis, get_value_redis, delete_key_redis
from config import settings

# HubSpot OAuth Configuration
CLIENT_ID = settings.hubspot_client_id
CLIENT_SECRET = settings.hubspot_client_secret
REDIRECT_URI = f"{settings.base_url}/integrations/hubspot/oauth2callback"
authorization_url = f"https://app.hubspot.com/oauth/authorize?client_id={CLIENT_ID}&response_type=code&redirect_uri={settings.encoded_base_url}%2Fintegrations%2Fhubspot%2Foauth2callback"

# Define the scopes needed for your integration
SCOPES = ['crm.objects.contacts.read', 'crm.objects.contacts.write']

async def authorize_hubspot(user_id, org_id):
    print(f"hubspot :: authorize_hubspot :: user_id: {user_id}")
    print(f"hubspot :: authorize_hubspot :: org_id: {org_id}")

    # Generate state to prevent CSRF attacks
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode('utf-8')).decode('utf-8')

    # Generate PKCE code verifier and code challenge
    code_verifier = secrets.token_urlsafe(32)
    m = hashlib.sha256()
    m.update(code_verifier.encode('utf-8'))
    code_challenge = base64.urlsafe_b64encode(m.digest()).decode('utf-8').replace('=', '')

    # Build the authorization URL with the state, code challenge, and scopes
    auth_url = f'https://app-na2.hubspot.com/oauth/authorize?&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=oauth&optional_scope={" ".join(SCOPES)}&state={encoded_state}'
    print(f"hubspot :: authorize_hubspot :: auth_url: {auth_url}")

    temp_auth_url = 'https://app-na2.hubspot.com/oauth/authorize?&client_id=5bbf576e-d634-4436-a5ea-e8760c9c1942&https://app-na2.hubspot.com/oauth/authorize?client_id=5bbf576e-d634-4436-a5ea-e8760c9c1942&redirect_uri=https://e4d7-103-173-211-17.ngrok-free.app/integrations/hubspot/oauth2callback&scope=oauth&optional_scope=crm.objects.contacts.write%20crm.schemas.contacts.write%20crm.schemas.contacts.read%20crm.objects.contacts.read'

    if temp_auth_url == auth_url:
        print("hubspot :: authorize_hubspot :: auth_url is equal to temp_auth_url")
    else:
        print("hubspot :: authorize_hubspot :: auth_url is not equal to temp_auth_url")
        
    # Store the state and code verifier in Redis for later use in the callback
    await asyncio.gather(
        add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', json.dumps(state_data), expire=600),
        add_key_value_redis(f'hubspot_verifier:{org_id}:{user_id}', code_verifier, expire=600)
    )

    # Return the authorization URL
    return auth_url
    
    # return 

async def oauth2callback_hubspot(request: Request):
    print(f"hubspot :: oauth2callback_hubspot :: request.query_params {request.query_params}")

    # Check for errors
    if request.query_params.get('error'):
        raise HTTPException(status_code=400, detail=request.query_params.get('error'))
    
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    state_data = json.loads(base64.urlsafe_b64decode(encoded_state).decode('utf-8'))

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    saved_state_str = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')
    
    if not saved_state_str:
        raise HTTPException(status_code=400, detail='No saved state found. Please try authorizing again.')
        
    saved_state = json.loads(saved_state_str)
    if original_state != saved_state.get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')

    async with httpx.AsyncClient() as client:
        response, _ = await asyncio.gather(
            client.post(
                'https://api.hubapi.com/oauth/v1/token',
                data={
                    'grant_type': 'authorization_code',
                    'code': code,
                    'redirect_uri': REDIRECT_URI,
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET
                },
                headers={
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            ),
            delete_key_redis(f'hubspot_state:{org_id}:{user_id}')
        )

    await add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', json.dumps(response.json()), expire=600)
    
    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)

async def get_hubspot_credentials(user_id, org_id):
    print(f"hubspot :: get_hubspot_credentials :: user_id: {user_id}")
    print(f"hubspot :: get_hubspot_credentials :: org_id: {org_id}")

    # Check if credentials exist
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    credentials = json.loads(credentials)
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')

    return credentials

def create_integration_item_metadata_object(contact_data, item_type='Contact'):
    """
    Creates an IntegrationItem from HubSpot contact data
    
    Args:
        contact_data (dict): Raw contact data from HubSpot API
        item_type (str): Type of the item (default: 'Contact')
        
    Returns:
        IntegrationItem: Standardized integration item
    """
    properties = contact_data.get('properties', {})
    contact_id = contact_data.get('id')
    created_at = contact_data.get('createdAt')
    updated_at = contact_data.get('updatedAt')
    
    # Format name
    first_name = properties.get('firstname', '')
    last_name = properties.get('lastname', '')
    full_name = f"{first_name} {last_name}".strip() or properties.get('email', 'Unnamed Contact')
    
    # Format timestamps
    creation_time = datetime.fromisoformat(created_at.rstrip('Z')) if created_at else None
    last_modified_time = datetime.fromisoformat(updated_at.rstrip('Z')) if updated_at else None
    
    # Create and return IntegrationItem
    return IntegrationItem(
        id=contact_id,
        type=item_type,
        name=full_name,
        creation_time=creation_time,
        last_modified_time=last_modified_time,
        url=f"https://app.hubspot.com/contacts/contacts/{contact_id}",
        mime_type='application/vnd.hubspot.contact',
        # Add any additional HubSpot specific fields to properties
        delta=json.dumps({
            'source': 'hubspot',
            'last_updated': updated_at,
            'company': properties.get('company')
        })
    )

async def get_items_hubspot(credentials):
    """
    Fetches contacts from HubSpot and converts them to IntegrationItem objects
    
    Args:
        credentials (str): JSON string containing access token and other credentials
        
    Returns:
        List[IntegrationItem]: List of standardized contact items
        
    Raises:
        HTTPException: If there's an error fetching data from HubSpot
    """
    try:
        print(f"hubspot :: get_items_hubspot :: Fetching contacts from HubSpot")
        credentials = json.loads(credentials)
        access_token = credentials.get('access_token')
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Missing access token in credentials")
        
        # HubSpot API endpoint for contacts
        url = 'https://api.hubapi.com/crm/v3/objects/contacts'
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Add pagination parameters
        params = {
            'limit': 100,  # Maximum allowed by HubSpot
            'properties': ['firstname', 'lastname', 'email', 'company', 'createdate', 'lastmodifieddate']
        }
        
        all_contacts = []
        has_more = True
        after = None
        
        # Handle pagination
        while has_more:
            if after:
                params['after'] = after
                
            response = requests.get(url, headers=headers, params=params)
            
            if response.status_code != 200:
                error_detail = response.json().get('message', 'Unknown error')
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error fetching contacts from HubSpot: {error_detail}"
                )
            
            data = response.json()
            contacts = data.get('results', [])
            all_contacts.extend(contacts)
            
            # Check for more pages
            paging = data.get('paging', {})
            if 'next' in paging:
                after = paging['next'].get('after')
                has_more = bool(after)
            else:
                has_more = False
        
        # Convert all contacts to IntegrationItem objects
        integration_items = [
            create_integration_item_metadata_object(contact) 
            for contact in all_contacts
        ]
        
        print(f"hubspot :: get_items_hubspot :: Successfully fetched {len(integration_items)} contacts")
        return integration_items
        
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid credentials format: {str(e)}")
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error connecting to HubSpot: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")