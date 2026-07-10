import jwt from 'jsonwebtoken';

export default function authenticate(req, res, next) {

    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ status: 'failed', message: "Access Denied. No token provided." });
    }

    try {

        jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ message: 'Token expired' });
                }
                return res.status(403).json({ message: 'Invalid token' });
            }
            req.user = decoded;
            next()
        })
    } catch (error) {
        console.log("Error: JWT authentication error:", error.message);
        res.status(500).json({
            message: "unable to authenticate user, server error",
            status: "failed"
        })
    }


}
