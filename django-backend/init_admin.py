import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def main():
    # print(get_user_model())
    username = "admin"
    email = "admin@email.com"
    firstname = "Admin"
    lastname = "User"
    password = "admin"
    
    get_user_model().objects.create_superuser(username=username, email=email, firstname=firstname, lastname=lastname, password=password)
    print(f'Superuser created successfully.')
    
if __name__ == "__main__":
    main()