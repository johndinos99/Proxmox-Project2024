from rest_framework import serializers
from .models import User
from django.contrib.auth.models import Group

# Serializer for viewing User details (Used for creating a user).
class UserSerializer(serializers.ModelSerializer):    
    class Meta:
        model = User
        extra_kwargs = {
            'password': {'write_only': True},
        }
        exclude = [
            "last_login",
            "is_superuser",
            "is_staff",
            "is_active",
            "groups",
            "user_permissions"
        ]
    
    def to_internal_value(self, data):
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
    def delete(self, instance):
        instance.delete()

    def validate(self, data):
        errors = {}
        
        if not data:
            raise serializers.ValidationError({"body": "Request body is empty."})     
        
        if "password" not in data:
            errors["password"] = "This field is required."
        else:
            pass
        
        if "firstname" not in data:
            pass
        elif data["firstname"]:
            res = any(char.isdigit() for char in data["firstname"])
            if res:
                errors["firstname"] = "This field can't contain numbers."
            else:
                pass
        else:
            pass
        
        if "lastname" not in data:
            pass
        elif data["lastname"]:
            res = any(char.isdigit() for char in data["lastname"])
            if res:
                errors["lastname"] = "This field can't contain numbers."
            else:
                pass
        else:
            pass
        
        if errors:
            raise serializers.ValidationError(errors)
        else:
            del errors
            return data

# Serializer for viewing User details (Used for updating a user).
class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        extra_kwargs = {
            'password': {'write_only': True},
        }
        exclude = [
            "last_login",
            "is_superuser",
            "is_staff",
            "is_active",
            "groups",
            "user_permissions"
        ]
        
    def to_internal_value(self, data):
        return super().to_internal_value(data)
    
    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for key, value in validated_data.items():
            setattr(instance, key, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance
    
    def validate(self, attrs):
        return attrs
    

# Serializer for listing all User details.
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        extra_kwargs = {
            'password': {'write_only': True},
        }
        exclude = [
            "id",
            "last_login",
            "is_superuser",
            "is_staff",
            "is_active",
            "groups",
            "user_permissions"
        ]