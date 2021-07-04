from django.urls import path
from .views import index

urlpatterns = [
    path('', index), # load index view (home page)
    path('join', index), # load join room page
    path('create', index), # load the create room page
    path('room/<str:roomCode>', index) # load the specified room page
]