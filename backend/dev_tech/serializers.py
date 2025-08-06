from rest_framework import serializers
from .models import Engin

class EnginSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engin
        fields = '__all__' 