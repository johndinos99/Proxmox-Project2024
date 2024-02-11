from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.decorators import authentication_classes, permission_classes

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import permission_required

from .models import User
from .utils import getTicket
from .serializers import UserSerializer, UserUpdateSerializer, UserListSerializer

import requests

proxmoxUrl = settings.PROXMOX['HOST']
ssl_verification = settings.PROXMOX['SSL_VERIFICATION']

requests.packages.urllib3.disable_warnings()
# Create your views here.
class Users(APIView):
    @method_decorator(csrf_exempt)
    @method_decorator(require_http_methods(["POST"]))
    @method_decorator(permission_classes([AllowAny,]))
    # Create a new user.
    def post(self, request):
        url = f"{proxmoxUrl}/access/users"
        headers = getTicket(request=request)
        
        user = UserSerializer(data=request.data)
        
        if not user.is_valid():
            return Response({"status": 400, "message": user.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        user_obj = user.create(validated_data=user.validated_data)
        
        if user_obj.is_active == True:
            enable = 1
        else:
            enable = 0
            
        data = {"userid": f"{user_obj.username}@pve", "password": request.data['password'], "enable": enable, "expire": user_obj.expire}
        
        try:
            response = requests.post(url=url, headers=headers, data=data, verify=ssl_verification)
        except requests.exceptions.RequestException or requests.exceptions.Timeout as e:
            print("Error: ", e)
            user_obj.delete()
            return Response({"status": 500, "message": "An error occurred while creating the user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if response.status_code == 200:
            res = UserSerializer(instance=user_obj, many=False)
            return Response({"status": 201, "data": res.data},status=status.HTTP_201_CREATED)
        else:
            user_obj.delete()
            return Response({"status": 400, "message": "Error while creating the user.", "reason": response.reason},status=status.HTTP_400_BAD_REQUEST)

    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated, IsAdminUser]))
    # Get all users (Only for debug).
    def get(self, request):
        if request.user.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        q_set = User.objects.all()
        if q_set:
            serializer = UserListSerializer(q_set, many=True)
            return Response({"status": 200, "message": "Viewing users list (Only for debug)", "data": serializer.data}, status=status.HTTP_200_OK)
        else:
            return Response({"status": 204, "message": f"Users list empty!"}, status=status.HTTP_204_NO_CONTENT)

class UserByUsername(APIView):
    @method_decorator(require_http_methods(["GET"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["users.view_user"], raise_exception=True))
    # Get user details by its username.
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
            owner = request.user
        except User.DoesNotExist:
            return Response({"status": 404, "message": f"No user with username: {username} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.username != user.username and owner.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or owner.username == user.username:
            pass
        
        serializer = UserSerializer(instance=user, many=False)
        
        return Response({"status": 200, "data": serializer.data}, status=status.HTTP_200_OK)
    
    @method_decorator(require_http_methods(["PUT"]))
    @method_decorator(permission_classes([IsAuthenticated,]))
    @method_decorator(permission_required(["users.change_user"], raise_exception=True))
    # Update user details by its username.
    def put(self, request, username):
        try:
            user = User.objects.get(username=username)
            owner = request.user
        except User.DoesNotExist:
            return Response({"status": 404, "message": f"No user with username: {username} found."}, status=status.HTTP_404_NOT_FOUND)
        
        if owner.username != user.username and owner.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        elif owner.is_superuser == True or owner.username == user.username:
            pass
        
        updated_user = UserUpdateSerializer(instance=user, data=request.data, partial=True)
        print(F"BEFORE => User: {UserSerializer(instance=user).data}")
        
        if not updated_user.is_valid():
            return Response({"status": 400, "message": updated_user.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"DATA RECIEVED => User: {updated_user.validated_data}")
        
        updated_user.update(instance=user, validated_data=updated_user.validated_data)
        print(F"UPDATED => User: {updated_user.data}")
        
        return Response({"status": 200, "message": f"User: {username} updated."}, status=status.HTTP_200_OK)

    @method_decorator(require_http_methods(["DELETE"]))
    @permission_classes([IsAuthenticated, IsAdminUser])
    # Delete a user by its username.
    def delete(self, request, username):
        if request.user.is_superuser == False:
            return Response({"status": 403, "message": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"status": 404, "message": f"No user: {username} found."}, status=status.HTTP_404_NOT_FOUND)
        
        userid = f"{user.username}@pve"
        url = f"{proxmoxUrl}/access/users/{userid}"
        headers = getTicket(request=request)
        
        try:
            response = requests.delete(url=url, headers=headers, verify=ssl_verification)
        except requests.exceptions.RequestException or requests.exceptions.Timeout as e:
            print("Error: ", e)
            return Response({"status": 500, "message": "An error occurred while deleting the user."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        if response.status_code == 200:
            user.delete()
            return Response({"status": 200, "message": f"User: {username} deleted."},status=status.HTTP_200_OK)
        else:
            return Response({"status": 400, "message": "Error while deleting the user.", "reason": response.reason},status=status.HTTP_400_BAD_REQUEST)
