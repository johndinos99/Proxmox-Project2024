from django.urls import path
from . import views
from .views import Users, UserByUsername

urlpatterns = [
    path("users", Users.as_view()),
    path("users/user/<str:username>", UserByUsername.as_view()),
]
