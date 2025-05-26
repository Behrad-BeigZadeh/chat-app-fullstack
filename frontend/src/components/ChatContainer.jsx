import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { Check, CheckCheck, Trash2 } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    markMessageAsSeen,
    sendMessage,
    incrementUnseenCount,
    resetUnseenCount,
    deleteChat,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [seenMessages, setSeenMessages] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!selectedUser?.id) return;

    getMessages(selectedUser.id);
    subscribeToMessages();

    resetUnseenCount(selectedUser.id);

    return () => unsubscribeFromMessages();
  }, [
    selectedUser?.id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
    resetUnseenCount,
  ]);

  useEffect(() => {
    if (!messages?.length || !authUser?.id) return;

    const unseenMessages = messages.filter(
      (msg) =>
        msg.senderId !== authUser.id && !msg.seen && !seenMessages.has(msg.id)
    );

    unseenMessages.forEach((msg) => {
      markMessageAsSeen(msg.id, msg.senderId);
      setSeenMessages((prev) => new Set(prev).add(msg.id));
    });

    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, authUser?.id, markMessageAsSeen, seenMessages]);

  const handleSendMessage = (text, image) => {
    sendMessage(selectedUser.id, text, image);
    if (selectedUser?.id) {
      incrementUnseenCount(selectedUser.id);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    deleteChat(selectedUser.id);
    setShowDeleteModal(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto relative">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto relative">
      <ChatHeader />

      {/* Delete Button */}
      <button
        className="absolute top-4 right-16 text-red-500 z-10"
        onClick={handleDeleteClick}
      >
        <Trash2 className="w-6 h-6" />
      </button>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${
              message.senderId === authUser.id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser.id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
              <div className="flex justify-end items-center gap-1 text-xs mt-1">
                {message.senderId === authUser.id && (
                  <>
                    {message.seen ? (
                      <CheckCheck className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Check className="w-4 h-4 text-gray-400" />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />

      {/* Modal for Confirmation */}
      {showDeleteModal && (
        <div className="fixed  inset-0 bg-base-content bg-opacity-50 flex justify-center items-center ">
          <div className="bg-base-100 p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg mb-4">
              Are you sure you want to delete this chat?
            </h3>
            <div className="flex justify-between">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                onClick={handleDeleteCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={handleDeleteConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
