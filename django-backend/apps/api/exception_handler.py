from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework.exceptions import NotAuthenticated, AuthenticationFailed

from django.core.exceptions import PermissionDenied

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if isinstance(exc, AuthenticationFailed):
        return Response({"status": 401, "detail": "Invalid Username or Password."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if isinstance(exc, NotAuthenticated):
        return Response({"status": 401, "detail": "Unauthorized Access."}, status=status.HTTP_401_UNAUTHORIZED)
    
    if isinstance(exc, PermissionDenied):
        return Response({"status": 403, "detail": "Access Denied."}, status=status.HTTP_403_FORBIDDEN)
    
    return response