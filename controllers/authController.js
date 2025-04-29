import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH secret is not defined');
  }
  return jwt.sign({ userId: payload.userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET secret is not defined');
  }
  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    process.env.JWT_SECRET,
    {
      expiresIn: '15m',
    }
  );
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'All fields must be filled' });
      return;
    }
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }
    const payload = {
      userId: user._id.toString(),
      role: user.role,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
   return res.status(200).json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    res.status(500).json({ message: errorMessage });
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
const logoutUser = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'None',
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'None',
  });

  res.status(200).json({ success: true });
};

const refreshAccessToken = async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }
  try {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET not defined');
    }

    const decoded = jwt.verify(oldRefreshToken, secret);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate new tokens (ROTATION HERE)
    const newAccessToken = generateAccessToken({
      userId: decoded.userId,
      role: decoded.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: decoded.userId,
      role: decoded.role,
    });
    // Set new cookies (rotating refresh token)
    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ message: 'Access token refreshed' });
  } catch (err) {
    console.error('Refresh error:', err);
    return res
      .status(403)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

export { loginUser, registerUser, logoutUser, refreshAccessToken };
