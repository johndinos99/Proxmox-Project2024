from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from django.conf import settings
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import permission_required

from .models import VM
from ..users.models import User
from apps.users.utils import getTicket
from .serializers import VMSerializer, VMListSerializer
from .utils import disk_config, vm_config, power, get_vm_status, vm_spice_config

import requests, json, mimetypes

proxmoxUrl = settings.PROXMOX['HOST']
proxnode = settings.PROXMOX['PROXMOX_NODE']
proxstorage  = settings.PROXMOX['PROXMOX_STORAGE']
ssl_verification = settings.PROXMOX['SSL_VERIFICATION']

# Create your views here.
class VMs(APIView):
    @method_decorator(csrf_exempt)
    @method_decorator(require_http_methods(["POST"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["vms.add_vm"], raise_exception=True))
    # Create a virtual machine.
    def post(self, request):
        headers = getTicket(request=request)
        
        vm = VMSerializer(data=request.data)
        
        url = [
            f"{proxmoxUrl}/cluster/nextid",
            f"{proxmoxUrl}/nodes/{proxnode}/qemu"
        ]
        
        nextvmid = json.loads(requests.get(url=url[0], headers=headers, verify=ssl_verification).content)["data"]
        
        disk = disk_config(request=request, vmid=nextvmid, headers=headers)
        vmconf = vm_config(request=request, vmid=nextvmid, disk=disk)
        
        try:
            response = requests.post(url=url[1], headers=headers, data=vmconf, verify=ssl_verification)
        except requests.exceptions.RequestException or requests.exceptions.Timeout as e:
            print("Error: ", e)
            return Response({"status": 500, "message": "An error occurred while creating the VM."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if response.status_code == 200:
            if vm.is_valid():
                vm_obj = vm.create(vm.validated_data, vmid=nextvmid, user=request.user)
                res = VMSerializer(instance=vm_obj, many=False)
            return Response({"status": 201, "data": res.data},status=status.HTTP_201_CREATED)
        else:
            return Response({"status": 500, "message": "Error while creating the VM.", "reason": response.reason},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated, IsAdminUser]))
    # Get all virtual machines (Only for debug).
    def get(self, request):
        if request.user.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        q_set = VM.objects.all()
        if q_set:
            serializer = VMListSerializer(q_set, many=True)
            return Response({"status": 200, "message": "Viewing VMs list (Only for debug)", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": 204, "message": f"VMs list empty!"}, status=status.HTTP_204_NO_CONTENT)

class VmByVmid(APIView):
    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["vms.view_vm"], raise_exception=True))
    # Get a virtual machine by its vmid.
    def get(self, request, vmid):
        try:
            vm = VM.objects.get(vmid=vmid)
            owner = request.user
        except VM.DoesNotExist:
            return Response({"status": 404, "message": f"No VM with vmid: {vmid} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.is_superuser == False and vm.user != owner:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or vm.user == owner:
            pass
        
        serializer = VMSerializer(instance=vm, many=False)
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)

    @method_decorator(require_http_methods(["DELETE"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["vms.delete_vm"], raise_exception=True))
    # Delete a virtual machine by its vmid.
    def delete(self, request, vmid):
        try:
            vm = VM.objects.get(vmid=vmid)
            owner = request.user
        except VM.DoesNotExist:
            return Response({"status": 404, "message": f"No VM with vmid: {vmid} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.is_superuser == False and vm.user != owner:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or vm.user == owner:
            pass
        
        urls = [
            f"{proxmoxUrl}/nodes/{proxnode}/qemu/{vmid}",
            f"{proxmoxUrl}/nodes/{proxnode}/storage/{proxstorage}/content/{proxstorage}:vm-{vmid}-{vm.name}-disk"
        ]
        
        headers = getTicket(request=request)
        
        for url in urls:
            try:
                response = requests.delete(url=url, headers=headers, verify=ssl_verification)
            except requests.exceptions.RequestException or requests.exceptions.Timeout as e:
                print("Error: ", e)
                return Response({"status": 500, "message": "An error occurred while deleting the VM."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            if response.status_code == 200:
                print(f"Request to {url} successful")
            else:
                return Response({"status": 500, "message": "Error while deleting the VM.", "reason": response.reason},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            vm.delete()
            return Response({"status": 200, "message": f"VM: {vmid} deleted."},status=status.HTTP_200_OK)

class VmByUsername(APIView):
    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["vms.view_vm"], raise_exception=True))
    # Get all virtual machines by its owners username.
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            owner = request.user
        except User.DoesNotExist:
            return Response({"status": 404, "message": f"No user with username: {username} found."})
        
        if owner.username != user.username and owner.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or owner.username == user.username:
            pass
        
        q_set = VM.objects.all().filter(user=user)
        if q_set:
            serializer = VMListSerializer(q_set, many=True)
            headers = getTicket(request=request)
            for s in serializer.data:
                status_data = get_vm_status(vmid=s['vmid'], headers=headers)
                s['status'] = status_data['status'].capitalize()
                
            return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": 204, "message": f"No VMs for user: {username}."}, status=status.HTTP_204_NO_CONTENT)

class VmActionByVmid(APIView):
    @method_decorator(csrf_exempt)
    @method_decorator(require_http_methods(["POST"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    # Perform power action to a virtual machine by its vmid.
    def post(self, request, vmid, action):
        url = f"{proxmoxUrl}/nodes/{proxnode}/qemu/{vmid}/status/current"
        actions = ["start", "stop", "reboot", "suspend", "resume", "reset"]
        
        try:
            vm = VM.objects.get(vmid=vmid)
            owner = request.user
        except VM.DoesNotExist:
            return Response({"status": 404, "message": f"No VM with vmid: {vmid} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.is_superuser == False and vm.user != owner:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or vm.user == owner:
            pass
        
        headers = getTicket(request=request)
        
        vm_status = json.loads(requests.get(url=url, headers=headers, verify=ssl_verification).content)['data']['status']
        
        if action not in actions:
            return Response({"status": 404, "message": "No such action."}, status=status.HTTP_400_BAD_REQUEST)

        if action == "start":
            if vm_status == "running":
                return Response({"status": 400, "message": f"VM with id: {vmid} already running!"}, status=status.HTTP_400_BAD_REQUEST)
            
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} started!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to start the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == "stop":
            if vm_status == "stopped":
                return Response({"status": 400, "message": f"VM with id: {vmid} already stopped!"}, status=status.HTTP_400_BAD_REQUEST)
                
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} stoped!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to stop the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == "reboot":
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} is rebooting!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to reboot the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == "suspend":
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} paused!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to pause the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == "resume":
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} is resuming!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to resume the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if action == "reset":
            op = power(headers=headers, vmid=vmid, option=action)
            if op:
                return Response({"status": 200, "message": f"VM with id: {vmid} is reseting!"}, status=status.HTTP_200_OK)
            else:
                return Response({"status": 500, "message": "Failed to reset the VM!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VmConsoleByVmid(APIView):
    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    # Get virtual machine console by its vmid.
    def get(self, request, vmid):
        try:
            vm = VM.objects.get(vmid=vmid)
            owner = request.user
        except VM.DoesNotExist:
            return Response({"status": 404, "message": f"No VM with vmid: {vmid} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.is_superuser == False and vm.user != owner:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or vm.user == owner:
            pass
        
        headers = getTicket(request=request)
        config = vm_spice_config(vmid, "<your Proxmox VE ip address>", headers)
        
        return Response(config, status=status.HTTP_200_OK)

class VmStatusByVmid(APIView):
    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    # Get virtual machine status and performance by its vmid.
    def get(self, request, vmid):
        try:
            vm = VM.objects.get(vmid=vmid)
            owner = request.user
        except VM.DoesNotExist:
            return Response({"status": 404, "message": f"No VM with vmid: {vmid} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.is_superuser == False and vm.user != owner:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or vm.user == owner:
            pass
        
        headers = getTicket(request=request)
        
        status_data = get_vm_status(vmid=vmid, headers=headers)
        if status:
            return Response({"status":200, "data": status_data}, status=status.HTTP_200_OK)
        else:
            return Response({"status":500 , "message": "Status not available."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)