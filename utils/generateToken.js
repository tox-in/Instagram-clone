import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1 days' });
    return token;
};

const decodeToken = (token) => {
    let decodedToken;
    let id;

    try {
        decodedToken = jwt.decode(token);
        const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
        id = verifiedToken.id;

    } catch (error) {
        return null;
    }
    return id || (decodedToken && decodedToken.id) || null;
};

export { generateToken, decodeToken };