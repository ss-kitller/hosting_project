from django.urls import path
from . import views
from .views import LoginView, TestView, SimpleLoginView

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup_view, name='signup'),
    path('test/', TestView.as_view(), name='test'),
    path('simple-login/', SimpleLoginView.as_view(), name='simple-login'),
    path('login/', LoginView.as_view(), name='login'),
] 