from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import Group

# Simple manager for creating regular users and superusers.
class UserManager(BaseUserManager):
    def create_user(self, email, username, firstname, lastname, password=None, **other_fields):
        if not email:
            raise ValueError("The Email must be set")
        
        email = self.normalize_email(email)
        
        other_fields.setdefault("is_staff", False)
        other_fields.setdefault("is_superuser", False)
        other_fields.setdefault("is_active", True)
        
        user = self.model(
            email=email, username=username, firstname=firstname, lastname=lastname, **other_fields
        )
        
        user.password = make_password(password)
        user.save()
        
        if other_fields.get("is_superuser") is not True:
            group = Group.objects.get(name="regular-user")
            group.user_set.add(user)
        
        return user

    def create_superuser(self, email, username, firstname, lastname, password=None, **other_fields):
        other_fields.setdefault("is_staff", True)
        other_fields.setdefault("is_superuser", True)
        other_fields.setdefault("is_active", True)

        if other_fields.get("is_staff") is not True:
            raise ValueError("Superuser must be assigned to is_staff=True.")
        if other_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must be assigned to is_superuser=True.")

        return self.create_user(
            email, username, firstname, lastname, password, **other_fields
        )
