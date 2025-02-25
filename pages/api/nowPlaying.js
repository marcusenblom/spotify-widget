import axios from "axios";
import connectToDatabase from '../../lib/mongodb';
import User from '../../models/User';

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

export default async function handler(req, res) {
    const spotify_id = process.env.SPOTIFY_ID;

    console.log("Fetching data for user: ", spotify_id);

    if (!spotify_id) {
        return res.status(400).json({ message: 'displayName is required' });
    }

    try {
        // Connect to MongoDB (this will only do it once)
        await connectToDatabase();

        // Find user by username
        let user = await User.findOne({ spotifyId: spotify_id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user = user?.toObject();

        const isTokenExpired = Date.now() / 1000 >= (user?.token_received_time + user?.expires_in);

        if (isTokenExpired){
            user = await refreshAccessToken(user);
        }

        try {
            const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${user.access_token}` }
            });

            console.log("response: ", response);
    
            if (response.data && response.data.is_playing) {
                return res.status(200).json(response?.data);
            } else {
                // If no song is playing, respond with last played information
                const lastPlayed = {
                    message: 'No track currently playing',
                    last_played_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                return res.status(200).json(lastPlayed);
            }
        } catch (error) {
            console.error('Error fetching now-playing data:', error.response.data);
            return res.status(error.status).send('Error fetching now-playing data');
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// Function to refresh the access token
const refreshAccessToken = async (user) => {

    try {
        if (!user.refresh_token) throw new Error('No refresh token available');

        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('refresh_token', user.refresh_token);
        formData.append('client_id', client_id);
        formData.append('client_secret', client_secret);

        const response = await axios.post('https://accounts.spotify.com/api/token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        if (response.data.access_token) {
            user.access_token = response.data.access_token;
            user.expires_in = response.data.expires_in || 3600; // Default to 1800 seconds if not provided
            user.token_received_time = Math.floor(Date.now() / 1000);
            user.refresh_token_last_used = user.token_received_time;

            console.log('Access token refreshed:', user.access_token);

            const updatedUser = await User.findOneAndUpdate(
                { spotifyId: user.spotifyId },
                { $set: user },
                { new: true }
            );

            return updatedUser;
        } else {
            console.error('Failed to refresh access token:', response.data);
        }
    } catch (error) {
        console.error('Error refreshing access token:', error.message);
    }
};