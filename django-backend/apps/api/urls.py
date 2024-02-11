from rest_framework_simplejwt.views import TokenRefreshView

from django.urls import path

from . import views
from .token_init import MyTokenObtainPairView

urlpatterns = [
    # Paths for the jwt tokens for login and auth-permission functions.
    path('token', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
