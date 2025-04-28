import User from '../models/userModel.js';

const getUser = async (req, res)=> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const user = await User.findById(userId).select(
      ' username email roadmaps role avatar'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Error fetching Users:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Users',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};
export { getUser };
