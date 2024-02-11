from django.conf import settings

from apps.vms.serializers import VMSerializer
from .models import VM

from datetime import datetime
from datetime  import timedelta

import json, requests, datetime

proxmoxUrl = settings.PROXMOX['HOST']
proxnode = settings.PROXMOX['PROXMOX_NODE']
proxstorage  = settings.PROXMOX['PROXMOX_STORAGE']
ssl_verification = settings.PROXMOX['SSL_VERIFICATION']

# Function for configuring the storage for the virtual machine.
def disk_config(request, vmid, headers):
    url = f"{proxmoxUrl}/nodes/{proxnode}/storage/{proxstorage}/content"
    
    data = request.data
    
    config = {
        "filename": f"vm-{vmid}-{data['name']}-disk",
        "vmid": vmid,
        "size": data['disk'],
        "storage": proxstorage,
        "node": proxnode
    }
    
    try:
        response = requests.request(method="POST", url=url, headers=headers, json=config, verify=ssl_verification)
        if response.status_code == 200:
            return json.loads(response.content)['data']
        else:
            return None
    except requests.exceptions.RequestException as e:
        raise e

# Function for creating the json config for creating the virtual machine.
def vm_config(request, vmid, disk):
    data = request.data
    
    if data['os'] == "Linux":
        ostype = "l26"
    
    if data['os'] == "Ubuntu":
        ostype = "l26"
        iso = "ubuntu-20.04.3-desktop-amd64.iso,media=cdrom"
    
    config = {
        "node": proxnode,
        "vmid": vmid,
        "name": data['name'],
        "memory": data['memory'],
        "sockets": 1,
        "cpu": "qemu64",
        "cores": data['cpu_cores'],
        "vga": "virtio,memory=512",
        "ostype": ostype,
        "scsihw":"virtio-scsi-pci",
        "scsi0": disk,
        "sata0": f"vmISOS:iso/{iso}",
        "net0": "virtio,bridge=0,firewall=1",
        "startdate": "now",
        "localtime": 1,
        "kvm": 0,
        "boot": "order=scsi0;sata0"
    }
    
    return config

# Function for executing the power actions of a virtual machine.
def power(headers, vmid, option):
    url = f"{proxmoxUrl}/nodes/{proxnode}/qemu/{vmid}/status/{option}"
    op = requests.request("POST", url, headers=headers, verify=ssl_verification).status_code
    if op == 200:
        return True
    else:
        return False

# Function for getting the virtual machine status and performance.
def get_vm_status(vmid, headers):
    url = f"{proxmoxUrl}/nodes/{proxnode}/qemu/{vmid}/status/current"

    data = json.loads(requests.request("GET", url, headers=headers, verify=False).content)['data']

    response = {
        "vmid": data['vmid'],
        "vmname": data['name'],
        "uptime": "{:0>8}".format(str(timedelta(seconds=data['uptime']))),
        "status": data['status'],
        "cpu": {
            "cores": data['cpus'],
            "usage": round(data['cpu'] * 100, 2)
        },
        "memory": {
            "unit": "GiB",
            "mem-usage": round(data['mem'] / pow(1024, 3), 2),
            "maxmem": round(data['maxmem'] / pow(1024, 3), 2)
        },
        "disk": {
            "unit": "GiB",
            "size": round(data['maxdisk'] / pow(1024, 3), 2)
        }
    }

    return response

# Function for getting a SPICE configuration to connect to the virtual machine.
def vm_spice_config(vmid, proxy, headers):
    url = f"{proxmoxUrl}/nodes/{proxnode}/qemu/{vmid}/spiceproxy"
    
    data = json.loads(requests.request("POST", url, headers=headers, json={"proxy": proxy}, verify=ssl_verification).content)['data']
    
    config = (
        f"""[virt-viewer]
        proxy={data['proxy']}
        host-subject={data['host-subject']}
        toggle-fullscreen={data['toggle-fullscreen']}
        ca={data['ca']}
        title={data['title']}
        password={data['password']}
        release-cursor={data['release-cursor']}
        type={data['type']}
        tls-port={data['tls-port']}
        delete-this-file={data['delete-this-file']}
        secure-attention={data['secure-attention']}
        host={data['host']}
        """
    )
    
    return config