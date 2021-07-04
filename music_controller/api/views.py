from django.http.response import JsonResponse
from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.serializers import Serializer
from rest_framework.utils import serializer_helpers
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# All view objects in the Django REST framework utilise JSON serializers to convert 
# object data into data types understandable to the JavaScript and front-end frameworks.
# (serializers are found in serializers.py)

# View object for returning existing Room objects
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

# View object for returning a specified Room page (using the ID code)
class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    # Search the database for a room with matching code to input
    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)
            # If the room code is valid, then retrieve and return Room data from database.
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response({'Bad Request': 'Code parameter not found in resquest'}, status=status.HTTP_400_BAD_REQUEST)

# View object for joining a room, find using the room ID code
class JoinRoom(APIView):
    lookup_url_kwarg = 'code'
    def post(self, request, format=None):
        # Check if user does not have a session key.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Request users input code and search database for matching room ID
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)
            # If match found then retrieve all of room information
            if len(room_result) > 0:
                room = room_result[0]
                self.request.session['room_code'] = code # Track which room the users in this session
                return Response({'message': 'Room Joined!'}, status=status.HTTP_200_OK)
            
            return Response({'Bad Request': 'Invalid Room Code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'Bad Request': 'Invalid post data, did not find a code key'}, status=status.HTTP_400_BAD_REQUEST)



# View object for creating a new room, returns in serialised JSON
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer
    
    def post(self, request, format=None):
        # Check if user does not have a session key.
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # Check serialised data is complete and valid
        # If valid then create a room, and identify host using session key
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key

            # Check if host already has a room created
            # If host already has a room, just update values
            # Serialise updated data for existing room, and post back to call with a status response
            queryset = Room.objects.filter(host=host)
            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
            # Else, create a new host and values
            # Serialise data for new created room, and post back to call with a status response
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)               
                room.save()
                self.request.session['room_code'] = room.code
                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
            
        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)

# Check if current user is within a room for the session
# If the user is within a room, redirect them to the room, else do nothing
class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        data = {
            'code': self.request.session.get('room_code')
        }

        return JsonResponse(data, status=status.HTTP_200_OK)


# When user clicks to leave room, we remove the room code associated with the session
# allowing the user to move back to the home page.
# Need to check if user leaving room is host, in which case we need to then delete the room.
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()

        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)

# View object for the hosts room settings, they can adjust whether pausing is allowed
# and how many votes are needed to skip.
# Need to check the serializer brings back valid data, then check room code is valid
# and that only the host of the room use this view.
class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer
    def patch(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)
            if not queryset.exists():
                return Response({'msg': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
            
            room = queryset[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({'msg': "You are not the host of the room."}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request': "Invalid Data..."}, status=status.HTTP_400_BAD_REQUEST)