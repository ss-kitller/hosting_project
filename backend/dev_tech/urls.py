from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EnginViewSet, home

router = DefaultRouter()
router.register(r'engins', EnginViewSet, basename='engin')

urlpatterns = [
    path('', home, name='dev_tech_home'),
    path('', include(router.urls)),
] 