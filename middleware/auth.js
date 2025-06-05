const jwt = require('jsonwebtoken');
const User = require('../models/user-model');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key');
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'Invalid token. User not found.' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated.' });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired.' });
        }
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Access denied. Admin role required.' });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during authorization.' });
    }
};

const managerAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (!['admin', 'manager'].includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied. Manager role or higher required.' });
            }
            next();
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during authorization.' });
    }
};

module.exports = { auth, adminAuth, managerAuth }; 