from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator
from apps.users.models import User

OS_CHOICES = (
    ("Linux","Linux"),
    ("Ubuntu","Ubuntu"),
    ("Windows","Windows")
)

# Create your models here.
class VM(models.Model):
    vmid = models.IntegerField(default=1, null=False, blank=True)
    name = models.CharField(max_length=150, null=True, blank=True)
    os = models.CharField(max_length=20, choices=OS_CHOICES, default='Ubuntu', null=True, blank=True)
    cpu_cores = models.IntegerField(default=1, null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(4)])
    memory = models.IntegerField(null=False, blank=True)
    disk = models.CharField(max_length=20, null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vms", null=True)
    
    REQUIRED_FIELDS = ["vmid"]
    
    class Meta:
        ordering = ["vmid"]
        verbose_name = "VM"
        verbose_name_plural = "VMs"

    def __str__(self):
        return str(self.vmid) +" - "+ self.name
