import express from 'express'
import { login, signup, forgotPassword } from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
let router = express.Router()

function getCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: Number(process.env.MAX_TOKEN_AGE) || 21600000
    };
}

router.post('/login', async (req, res) => {

    const data = req.body;

    if (!data || !data.password || (!data.email && !data.user)) {
        return res.status(400).json({
            status: "failed",
            message: "Parameters not found"
        })
    }

    try {
        const response = await login(data);

        if (response && response.token) {
            res.cookie('authToken', response.token, getCookieOptions())

            res.status(200).json({
                message: "user successfully logged in",
                status: "successful",
                user: response.user
            });
        } else {
            res.status(401).json({
                message: "Wrong email or password",
                status: "failed",
            });
        }

    } catch (error) {
        console.log("Login error:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to login user",
        })
    }
});

router.post('/signup', async (req, res) => {

    const data = req.body;

    if (!data || !data.password || (!data.email && !data.user)) {
        return res.status(400).json({
            status: "failed",
            message: "Parameters not found"
        })
    };

    try {
        const response = await signup(data);

        if (!response) {
            return res.status(409).json({
                message: "User already exists",
                status: "failed",
            });
        }

        res.cookie('authToken', response.token, getCookieOptions())

        res.status(200).json({
            message: "user successfully signed up",
            status: "successful",
            user: response.user
        })
    } catch (error) {
        console.log("Signup error:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to register user",
        })
    }
});

router.get('/me', authMiddleware, async (req, res) => {
    res.status(200).json({
        status: "successful",
        user: {
            id: req.user.id,
            email: req.user.email
        }
    })
});

router.post('/logout', async (req, res) => {
    res.clearCookie('authToken', getCookieOptions());

    res.status(200).json({
        status: "successful",
        message: "user successfully logged out"
    })
});

router.post('/forgot-password', async (req, res) => {
    const data = req.body;

    if (!data || (!data.email && !data.user)) {
        return res.status(400).json({
            status: "failed",
            message: "Email not found"
        })
    }

    try {
        await forgotPassword(data);

        res.status(200).json({
            status: "successful",
            message: "If this email exists, password reset instructions will be sent"
        })
    } catch (error) {
        console.log("Forgot password error:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to process forgot password request",
        })
    }
});

export default router
