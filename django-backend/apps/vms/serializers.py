from rest_framework import serializers
from .models import VM
from ..users.models import User

# Serializer for gettong the VM owner details.

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        extra_kwargs = {'password': {'write_only': True}}
        exclude = ['id', 'username', 'firstname', 'lastname', 'last_login', 'is_superuser', 'is_staff', 'is_active', 'groups', 'user_permissions']

# Serializer for viewing VM details.

class VMSerializer(serializers.ModelSerializer):
    class Meta:
        model = VM
        fields = ['id', 'name', 'vmid', 'os', 'cpu_cores', 'memory', 'disk']

    def create(self, validated_data, vmid, user):
        vm = VM(**validated_data, vmid=vmid, user=user)
        vm.save()
        return vm

    def to_internal_value(self, data):
        return super().to_internal_value(data)

# Serializer for listing VMs with their owner details.

class VMListSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = VM
        fields = ['name', 'vmid', 'os', 'cpu_cores', 'memory', 'disk', 'user']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        expire = representation['user']['expire']
        representation['expire'] = expire
        representation['user'] = representation['user']['email']
        
        return representation