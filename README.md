# Proxmox Project

This project is part of my bachelor thesis that i redacted for Harokopio Univercity with the topic __"A centralized web system for administering virtual machines of the institution"__.
My thesis revolves around crafting a specialized web application using Django and React, designed to provide a simple user interface for Proxmox Virtual Environment (VE). The focal point of the application is to enable users to effortlessly create virtual machines with predefined time limits. This feature proves invaluable for scenarios requiring temporary computing resources, offering a flexible and cost-effective solution. Leveraging Django for the backend ensures a secure and scalable foundation, while React enhances the frontend with responsiveness and user-friendly interactions. The outcome is an efficient tool that simplifies the deployment, monitoring, and management of time-limited virtual machines within the Proxmox VE environment.

## Prerequisites

The project in order to run requires the below:

- Proxmox VE installation
- Docker Desktop
- Virt-Manager
- OpenSSL

## Certificates

Because the project is not in production in order to run it locally it requires a trusted Certificate Authority and Self-Signed certificates for both the frontend and the backend.

1. Add the CA certificate to the trusted root certificates
    - For __Windows__, just double click the `devCA.crt` file inside `Cert Authority` folder
        1. Click __Install Certificate__
        2. Choose any __Store Location__
        3. Select Place all certificates in the following store, choose __Trusted Root Certificate Authorities__.

        Verify it by running `certmgr.msc`.
    - For __Linux (Ubuntu)__

        ```bash
        sudo apt install -y ca-certificates
        sudo cp devCA.crt /usr/local/share/ca-certificates
        sudo update-ca-certificates
        ```

    - For __Linux (Fedora/CentOS)__

        ```bash
        sudo cp devCA.crt /etc/pki/ca-trust/source/anchors/devCA.crt
        sudo update-ca-trust
        ```

2. Creating SSL Certificate signed using Root Certificate Private Key
    - Create a SSL certificate for both the backend and the frontend. This will create a new RSA key pair for private and public keys.

        ```bash
        # For Linux
        openssl req -new -nodes -out <cert name>.csr -newkey rsa:4096 -keyout <cert name>.key
        ```

        ```powershell
        # For Windows
        openssl req -new -nodes -out <cert name>.csr -newkey rsa:4096 -keyout <cert name>.key
        ```

    - Create a file to add Subject Alternative Name (SAN) to SSL certificate for both the backend and the frontend.
        1. Create a new ext file with `<cert name>.v3.ext` name to add SAN properties.
            - For Windows, run notepad `<cert name>.v3.ext`
            - For Linux, run touch `<cert name>.v3.ext`

        2. Copy the below content in that file.

            ```text
            authorityKeyIdentifier=keyid,issuer
            basicConstraints=CA:FALSE
            keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
            subjectAltName = @alt_names

            [alt_names]
            DNS.1 = localhost
            ```

        3. Sign the CSR using CA private key to generate final certificate

            ```bash
            # For Linux
            openssl x509 -req -in <cert name>.csr -CA devCA.crt -CAkey devCA.key -CAcreateserial -out <cert name>.crt -days 730 -sha256 -extfile <cert name>.v3.ext
            ```

            ```bash
            # For Windows
            openssl x509 -req -in <cert name>.csr -CA devCA.crt -CAkey devCA.key -CAcreateserial -out <cert name>.crt -days 730 -sha256 -extfile <cert name>.v3.ext
            ```

    - Add both certificate pairs to the project.
        - For the Django backend:
            1. Navigate to `/django-backend` folder
            2. Create a new folder named `ssl`
            3. Add the `<cert name>.crt` and `<cert name>.key` to the `ssl` folder
            4. Navigate to `/django-backend`
            5. Edit the `Dockerfile` by specifing the `.crt` & `.key` files

                ```docker
                # Rest of file
                CMD [ "python", "manage.py", "runsslserver", "0.0.0.0:8000", "--certificate", "/app/ssl/<your .crt file>", "--key", "/app ssl/<your .key file>" ]
                ```

        - For the React frontend:
            1. Edit the `docker-compose.yml` again by specifing the `.crt` & `.key` files

                ```yml
                ---Rest of file---
                react-frontend:
                    environment:
                        - HTTPS=true
                        - SSL_CRT_FILE=/app/ssl/<your .crt file>
                        - SSL_KEY_FILE=/app/ssl/<your .key file>
                ```

## Before starting the application

Before starting the application we need to make a few small changes inside some files.

1. Navigate to `/django-backend/backend/settings.py`
2. Open the `settings.py` file
3. Change the `HOST`, `PROXMOX_NODE` and `PROXMOX_STORAGE` values

    ```python
    # Rest of file

    PROXMOX = {
        'HOST': "<your proxmox host address>",
        'SSL_VERIFICATION': False,
        'PROXMOX_NODE': "<your proxmox node>",
        'PROXMOX_STORAGE': "<your proxmox node>"
    }

    # Rest of file
    ```

4. Navigate to `/django-backend/apps/users/utils.py`
5. Open the `utils.py` file
6. Change the proxmox root password

    ```python
    # Rest of file

    def getTicket(request):
        creds = {"username": "root@pam", "password": "<proxmox root password>"}

    # Rest of file
    ```

7. Navigate to `django-backend\apps\vms\views.py`
8. Open the `views.py` file
9. Change the Proxmox VE ip address

    ```python
    # Rest of file

    class VmConsoleByVmid(APIView):
        @method_decorator(require_http_methods(["GET"]))
        @method_decorator(permission_classes([IsAuthenticated,]))

        def get(self, request, vmid):
            # Rest of file

            config = vm_spice_config(vmid, "<your Proxmox VE ip address>", headers)
            # Rest of file

    # Rest of file
    ```

10. Ready to go !!!!

## Starting the application

All you have to do is to run the below command:

```bash
docker-compose up -d
```

- The Django backend is running at `https://localhost:8000`
- The React frontend is running at `https://localhost:3000`

## Links

Docker [https://www.docker.com]\
Proxmox VE [https://www.proxmox.com]\
Virt-Manager [https://virt-manager.org/]

Bachelor thesis for Harokopio Univercity, [Department of Informatics and Telematics](https://dit.hua.gr/index.php/en/), Athens, Greece.\

Copyright &copy; Ioannis Ntinos 2024
