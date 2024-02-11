from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin

from .managers import UserManager

# Create your models here.
class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, null=True, blank=False)
    username = models.CharField(unique=True, max_length=150, blank=False)
    password = models.CharField(max_length=128, null=True, blank=False)
    firstname = models.CharField(max_length=150, null=True, blank=True)
    lastname = models.CharField(max_length=150, null=True, blank=True)
    expire = models.IntegerField(default=0, null=True, blank=True)
    is_staff = models.BooleanField(default=False, null=True, blank=False)
    is_active = models.BooleanField(default=False, null=True, blank=False)

    objects = UserManager()

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ["email"]
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return self.email

