import jwt from 'jsonwebtoken';
import userScehma from '../models/user.model.js';
import bcrypt from 'bcrypt'


async function login(loginCredentials) {

    const { user, password } = loginCredentials;
    const userCredentials = await userScehma.findOne({ user: user });
    const decryptedPassword = await bcrypt.compare(password, userCredentials.password)

    if (decryptedPassword) {

        const token = jwt.sign(loginCredentials, process.env.SECRET_KEY, { expiresIn: "6hr" });
        return { token }
    }

}

async function logout(logoutCredentials) {

}

async function signup(signupCredentials) {

    let password = signupCredentials.password
    signupCredentials.password = await bcrypt.hash(password, 10);
    await userScehma.insertOne(signupCredentials);
    const token = jwt.sign(signupCredentials, process.env.SECRET_KEY, { expiresIn: "6hr" });
    return { token }
};


async function refreshToken(signupCredentials) {

};

export {
    login,
    logout,
    signup,
    refreshToken,
}