import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.users.models import User

def main():
    regular_user_group, created = Group.objects.get_or_create(name='regular-user')
    
    user_content_type = ContentType.objects.get(app_label='users', model='user')
    vm_content_type = ContentType.objects.get(app_label='vms', model='vm')
    
    add_user_permission, created = Permission.objects.get_or_create(codename='add_user', name='Can add User', content_type=user_content_type)
    view_user_permission, created = Permission.objects.get_or_create(codename='view_user', name='Can view User', content_type=user_content_type)
    
    add_vm_permission, created = Permission.objects.get_or_create(codename='add_vm', name='Can add VM', content_type=vm_content_type)
    view_vm_permission, created = Permission.objects.get_or_create(codename='view_vm', name='Can view VM', content_type=vm_content_type)
    delete_vm_permission, created = Permission.objects.get_or_create(codename='delete_vm', name='Can delete VM', content_type=vm_content_type)
    
    regular_user_group.permissions.add(add_user_permission)
    regular_user_group.permissions.add(view_user_permission)
    regular_user_group.permissions.add(change_user_permission)
    
    regular_user_group.permissions.add(add_vm_permission)
    regular_user_group.permissions.add(view_vm_permission)
    regular_user_group.permissions.add(delete_vm_permission)

if __name__ == "__main__":
    main()