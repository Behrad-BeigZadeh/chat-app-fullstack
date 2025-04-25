export const userSocketMap = {};

// Get socket ID by user ID
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Add a user to the socket map
export function addUserToSocketMap(userId, socketId) {
  userSocketMap[userId] = socketId;
}

// Remove a user from the socket map
export function removeUserFromSocketMap(userId) {
  delete userSocketMap[userId];
}

// Emit 'messageSeen' event to the sender
export function emitMessageSeen(io, messageId, senderId) {
  const receiverSocketId = getReceiverSocketId(senderId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageSeen", { messageId });
  }
}

export default {
  addUserToSocketMap,
  removeUserFromSocketMap,
  emitMessageSeen,
  userSocketMap,
};
