import Notification from "./../models/notification.model.js";

// 1. Lấy và đọc thông báo
export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({ path: "from", select: "username profileImage" });

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.error(">>> Error in getNotifications controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 2. Xóa tất cả thông báo
export const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({
			message: "Notifications deleted successfully",
		});
	} catch (error) {
		console.error(">>> Error in deleteNotifications controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};

// 3. Xóa thông báo
export const deleteNotification = async (req, res) => {
	try {
		const userId = req.user._id;
		const notificationId = req.params.id;

		const notification = await Notification.findById(notificationId);

		if (!notification)
			return res.status(404).json({
				error: "Notification not found",
			});

		if (notification.to.toString() !== userId.toString()) return res.status(401).json({ error: "You are not allow to delete this notification" });

		await Notification.findByIdAndDelete(notificationId);

		res.status(200).json({
			message: "Notifications deleted successfully",
		});
	} catch (error) {
		console.error(">>> Error in deleteNotification controller: ", error.stack);
		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};
