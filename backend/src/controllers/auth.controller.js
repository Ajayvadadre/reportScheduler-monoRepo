import jwt from 'jsonwebtoken';
import userScehma from '../models/user.model.js';
import bcrypt from 'bcrypt'

function createToken(userCredentials) {
    return jwt.sign(
        { id: userCredentials._id, email: userCredentials.email },
        process.env.SECRET_KEY,
        { expiresIn: "6hr" }
    );
}

function getSafeUser(userCredentials) {
    return {
        id: userCredentials._id,
        email: userCredentials.email
    };
}

async function login(loginCredentials) {

    const { email, user, password } = loginCredentials;
    const loginEmail = email || user;
    const userCredentials = await userScehma.findOne({ email: loginEmail });

    if (!userCredentials) {
        return null;
    }

    const decryptedPassword = await bcrypt.compare(password, userCredentials.password)

    if (decryptedPassword) {

        const token = createToken(userCredentials);
        return { token, user: getSafeUser(userCredentials) }
    }

    return null;
}

async function forgotPassword(forgotPasswordCredentials) {

    const { email, user } = forgotPasswordCredentials;
    const loginEmail = email || user;

    await userScehma.findOne({ email: loginEmail });
    return true;
}

async function signup(signupCredentials) {

    const { email, user, password } = signupCredentials;
    const signupEmail = email || user;
    const existingUser = await userScehma.findOne({ email: signupEmail });

    if (existingUser) {
        return null;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    const userCredentials = await userScehma.create({
        email: signupEmail,
        password: encryptedPassword
    });

    const token = createToken(userCredentials);
    return { token, user: getSafeUser(userCredentials) }
};

export {
    login,
    signup,
    forgotPassword,
}
