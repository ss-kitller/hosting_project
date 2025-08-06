from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Engin
from .serializers import EnginSerializer

# Create your views here.

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def home(request):
    return JsonResponse({'message': 'Bienvenue sur l\'espace Dev Tech !'})

class EnginViewSet(viewsets.ModelViewSet):
    queryset = Engin.objects.all()
    serializer_class = EnginSerializer
    lookup_field = 'code_engin'
    permission_classes = [permissions.AllowAny]
