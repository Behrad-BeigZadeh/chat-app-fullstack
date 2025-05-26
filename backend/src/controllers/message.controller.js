import { prisma } from "../lib/prisma.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import { getReceiverSocketId } from "../lib/socketUtils.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    const filteredUsers = await prisma.user.findMany({
      where: {
        id: {
          not: loggedInUserId,
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        profilePic: true,
      },
    });
    console.log("👉 filteredUsers =", filteredUsers);

    const updatedUsers = await Promise.all(
      filteredUsers.map(async (user) => {
        const unseenCount = await prisma.message.count({
          where: {
            senderId: user.id,
            receiverId: loggedInUserId,
            seen: false,
          },
        });

        return {
          ...user,
          unseenCount,
        };
      })
    );

    res.status(200).json(updatedUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
        NOT: {
          deletedBy: {
            has: myId,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user.id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        text,
        image: imageUrl,
      },
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);

      const unseenCount = await prisma.message.count({
        where: {
          senderId,
          receiverId,
          seen: false,
        },
      });

      io.to(receiverSocketId).emit("updateUnseenCount", {
        senderId,
        unseenCount,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const markMessageAsSeen = async (req, res) => {
  const { id: messageId } = req.params;

  try {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { seen: true },
    });

    const senderSocketId = getReceiverSocketId(message.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageSeen", { messageId });

      const unseenCount = await prisma.message.count({
        where: {
          senderId: message.senderId,
          receiverId: message.receiverId,
          seen: false,
        },
      });

      io.to(senderSocketId).emit("updateUnseenCount", {
        senderId: message.receiverId,
        unseenCount,
      });
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error marking message as seen:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.id;

    const messages = await prisma.message.updateMany({
      where: {
        OR: [
          { senderId: myId, receiverId: userId },
          { senderId: userId, receiverId: myId },
        ],
      },
      data: {
        deletedBy: {
          push: myId,
        },
      },
    });

    res.status(200).json({
      message: "Chat deleted successfully (soft delete)",
      updatedCount: messages.count,
    });
  } catch (error) {
    console.error("Error in soft deleting chat: ", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};
