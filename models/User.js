import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    spotifyId: { type: String, required: true },
    displayName: { type: String, required: true, unique: true },
    email: { type: String, required: true },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;