from django.urls import path
from .views import CreateRoomView, RoomView, GetRoom, JoinRoom, UserInRoom, LeaveRoom, UpdateRoom

urlpatterns = [
    path('room', RoomView.as_view()), # Path to view existing rooms
    path('create-room', CreateRoomView.as_view()), # Path to create new rooms view
    path('get-room', GetRoom.as_view()), # Path to room controller view
    path('join-room', JoinRoom.as_view()), # Path to join room view
    path('user-in-room', UserInRoom.as_view()), # Path to view users in rooms
    path('leave-room', LeaveRoom.as_view()), # Path to leave room view
    path('update-room', UpdateRoom.as_view()) # Path to update room view

]