import Session from "../models/sessionModel.js";

// Save a session of tabs
export const saveSession = async (req, res) => {
    console.log("in save ")
    const { tabs, name } = req.body;

    try {
        let session = new Session({
            user: req.user.id,
            tabs,
            name
        });

        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: 'Failed to save session', error });
    }
};

// Get all sessions for a user
export const getSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ user: req.user.id });
        res.status(200).json(sessions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch sessions', error });
    }
};

// Delete a session
export const deleteSession = async (req, res) => {
    try {
        await Session.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete session', error });
    }
};