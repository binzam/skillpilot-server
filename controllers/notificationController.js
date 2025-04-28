import Notification from '../models/notificationModel.js';

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user?.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notifications = await Notification.find({
      receiverUserId: userId,
    })
      .sort({ createdAt: -1 })
      .exec();

    if (notifications.length === 0) {
      return res.status(200).json({ success: true, notifications: [] });
    }

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res
      .status(500)
      .json({ message: 'Server error fetching notifications' });
  }
};
// controllers/notificationController.ts
// export const markNotificationAsRead = async (req: Request, res: Response) => {
//   try {
//     const { userId } = req.params;
//     const { notificationId } = req.body;

//     // Ensure the userId matches the authenticated user
//     if (req.user?.userId !== userId) {
//       return res.status(403).json({ message: 'Access denied' });
//     }

//     // Mark notification as read
//     const updatedNotification = await NotificationModel.findByIdAndUpdate(
//       notificationId,
//       { isRead: true },
//       { new: true }
//     );

//     if (!updatedNotification) {
//       return res.status(404).json({ message: 'Notification not found' });
//     }

//     return res.status(200).json({ success: true, notification: updatedNotification });
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     return res.status(500).json({ message: 'Server error marking notification as read' });
//   }
// };

export { getUserNotifications };
