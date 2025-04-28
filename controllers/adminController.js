import Roadmap from '../models/roadmapModel.js';
import User from '../models/userModel.js';

const getDashboardData = async (req, res) => {
  try {
    const users = await User.find().select(
      '_id username email roadmaps role avatar'
    );
    const roadmaps = await Roadmap.find();

    return res.status(200).json({
      users,
      roadmaps,
    });
  } catch (error) {
    console.error('Error fetching Dashboard data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch Dashboard data',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

export { getDashboardData };
