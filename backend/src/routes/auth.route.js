import express from 'express'
import { login, signup, logout, refreshToken } from '../controllers/auth.controller.js';
let router = express.Router()

router.post('/login', async (req, res) => {

    const data = req.body;

    if (!data || data.length == 0) {
        res.status(500).json({
            status: "failed",
            message: "Parameters not found"
        })
    }

    try {
        const response = await login(data);

        if (response && response.token) {
            res.cookie('authToken', response.token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: process.env.MAX_TOKEN_AGE
            })

            res.status(200).json({
                message: "user successfully signed up",
                status: "successful",
            });
        } else {
            res.status(401).json({
                message: "Wrong password",
                status: "failed",
            });
        }

    } catch (error) {
        console.log("Login error:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to register user",
        })
    }
});

router.post('/signup', async (req, res) => {

    const data = req.body;

    if (!data || data.length == 0) {
        res.status(500).json({
            status: "failed",
            message: "Parameters not found"
        })
    };

    try {
        const response = await signup(data);

        res.cookie('authToken', response.token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: process.env.MAX_TOKEN_AGE
        })

        res.status(200).json({
            message: "user successfully signed up",
            status: "successful",
        })
    } catch (error) {
        console.log("Signup error:::", error.message);
        res.status(500).json({
            status: "failed",
            message: "Unable to register user",
        })
    }
});

export default router