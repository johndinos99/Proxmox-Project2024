FROM python:3.10-slim-buster

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . /app/

EXPOSE 8000

RUN python manage.py makemigrations

RUN python manage.py migrate

RUN python init_admin.py

RUN python init_groups.py

CMD [ "python", "manage.py", "runsslserver", "0.0.0.0:8000", "--certificate", "/app/ssl/<your .crt file>", "--key", "/app/ssl/<your .key file>" ]