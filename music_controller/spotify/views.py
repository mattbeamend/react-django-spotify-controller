from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import is_spotify_authenticated, update_or_create_user_tokens, is_spotify_authenticated

# View to allow requests for authorization to access data from Spotify
class AuthURL(APIView):
    def get(self, request, format=None):
        # Defining what we want the Spotify to allow us to do.
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'
        # Generate the url for requesting authorization from spotify.
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes, 
            'response_type': 'code', 
            'redirect_uri': REDIRECT_URI, 
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


# Handling the response data recieved back from Spotify after requesting authorization
# Then send a request back to Spotify asking for the access and refresh tokens.
# Once recieved, we store the access tokens in a database (SpotifyToken model) alongside the users session key
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code', 'code': code, 'redirect_uri': REDIRECT_URI, 'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)

    # Redirect back to the homepage on the frontend app
    return redirect('frontend:')


# Call the util function: is_spotify_authenticated, and return a JSON response informing 
# if the user is authenticated or not
class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
