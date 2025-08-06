from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions

# Create your views here.

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def home(request):
    return JsonResponse({'message': 'Bienvenue sur l\'espace RH !'})
