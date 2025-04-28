import jwt from 'jsonwebtoken';


const authenticateUser= (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      res.status(401).json({ message: 'Access denied. No token provided.' });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not defined in env');
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    next();
  } catch (err) {
    console.log(err);

    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};
export default authenticateUser;
