import { useEffect, useState } from "react";
import { Link } from "react-router";
import { MessageSquareIcon } from "lucide-react";
import useStreamChat from "../hooks/useStreamChat";
import ProfileImage from "../components/ProfileImage";
import PageLoader from "../components/PageLoader";
import { getOtherUserIdFromChannel } from "../lib/chat";

const MessagesPage = () => {
  const { client, isLoading, authUser } = useStreamChat();
  const [channels, setChannels] = useState([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  useEffect(() => {
    if (!client || !authUser) return;

    const loadChannels = async () => {
      try {
        const filters = { type: "messaging", members: { $in: [authUser._id] } };
        const sort = [{ last_message_at: -1 }];
        const result = await client.queryChannels(filters, sort, {
          watch: true,
          state: true,
          limit: 30,
        });
        setChannels(result);
      } catch (error) {
        console.error("Error loading channels:", error);
      } finally {
        setLoadingChannels(false);
      }
    };

    loadChannels();

    const handleEvent = () => loadChannels();
    client.on("message.new", handleEvent);
    client.on("notification.message_new", handleEvent);
    client.on("channel.updated", handleEvent);

    return () => {
      client.off("message.new", handleEvent);
      client.off("notification.message_new", handleEvent);
      client.off("channel.updated", handleEvent);
    };
  }, [client, authUser]);

  if (isLoading) return <PageLoader />;

  return (
    <motion.div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Messages</h1>

        {loadingChannels ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </motion.div>
        ) : channels.length === 0 ? (
          <div className="card bg-base-200 p-8 text-center">
            <MessageSquareIcon className="size-12 mx-auto opacity-40 mb-4" />
            <h3 className="font-semibold text-lg mb-2">No conversations yet</h3>
            <p className="opacity-70 mb-4">Message a friend to start chatting.</p>
            <Link to="/friends" className="btn btn-primary btn-sm">
              View Friends
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {channels.map((channel) => {
              const otherUserId = getOtherUserIdFromChannel(channel.id, authUser._id);
              const members = channel.state.members;
              const otherMember = Object.values(members).find(
                (m) => m.user?.id && m.user.id !== authUser._id
              );
              const otherUser = otherMember?.user;
              const lastMessage = channel.state.messages[channel.state.messages.length - 1];
              const unread = channel.countUnread();
              const displayName = otherUser?.name || "Unknown user";

              return (
                <Link
                  key={channel.id}
                  to={`/chat/${otherUserId}`}
                  className="card bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="card-body p-4 flex-row items-center gap-4">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        <ProfileImage
                          src={otherUser?.image}
                          seed={otherUserId}
                          alt={displayName}
                        />
                      </motion.div>
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold truncate">{displayName}</h3>
                        {lastMessage?.created_at && (
                          <span className="text-xs opacity-50 shrink-0">
                            {new Date(lastMessage.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </motion.div>
                      <p className="text-sm opacity-70 truncate">
                        {lastMessage?.text || "No messages yet"}
                      </p>
                    </motion.div>
                    {unread > 0 && (
                      <span className="badge badge-primary badge-sm">{unread}</span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MessagesPage;
