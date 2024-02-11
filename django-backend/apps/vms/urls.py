from django.urls import path

from . import views
from .views import VMs, VmByVmid, VmByUsername, VmActionByVmid, VmStatusByVmid, VmConsoleByVmid

urlpatterns = [
    path("vms", VMs.as_view()),
    path("vms/vm/<int:vmid>", VmByVmid.as_view()),
    path("vms/vm/<str:username>", VmByUsername.as_view()),
    path("vms/vm/<int:vmid>/action/<str:action>", VmActionByVmid.as_view()),
    path("vms/vm/<int:vmid>/console", VmConsoleByVmid.as_view()),
    path("vms/vm/<int:vmid>/status", VmStatusByVmid.as_view())
]
