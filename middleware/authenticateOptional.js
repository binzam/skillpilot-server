import jwt from 'jsonwebtoken';


const authenticateOptional = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      req.user = null;
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, secret) ;
    req.user = decoded || null;

    next();
  } catch (err) {
    console.log(err);

    req.user = null;
  }
};
export default authenticateOptional;
