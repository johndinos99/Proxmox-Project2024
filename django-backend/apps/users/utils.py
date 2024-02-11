# from .models import User
from django.conf import settings

import json, requests

proxmoxUrl = settings.PROXMOX['HOST']
ssl_verification = settings.PROXMOX['SSL_VERIFICATION']

# Function for generating PVE Auth ticket for Proxmox api calls that requires a key.
def getTicket(request):
    creds = {"username": "root@pam", "password": "<proxmox root password>"}
    url = f"{proxmoxUrl}/access/ticket"
    
    try:
        response = requests.request("POST", url, verify=ssl_verification, data=creds)
        if response.status_code != 200:
            raise Exception("Something went wrong!")
        
        data = json.loads(response.content)
        headers = {"CSRFPreventionToken": data['data']['CSRFPreventionToken'], "Cookie": f"PVEAuthCookie={data['data']['ticket']}"}
        
        return headers
    except requests.exceptions.RequestException as err:
        print("Error: ", err)

