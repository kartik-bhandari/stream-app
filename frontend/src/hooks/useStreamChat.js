import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import useAuthUser from "./useAuthUser";
import { getStreamToken } from "../lib/api";
import { getAvatarUrl } from "../lib/avatar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const useStreamChat = () => {
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);

  const { data: tokenData, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!tokenData?.token || !authUser) return;

    let cancelled = false;

    const connect = async () => {
      try {
        const chatClient = StreamChat.getInstance(STREAM_API_KEY);

        if (chatClient.userID !== authUser._id) {
          if (chatClient.userID) {
            await chatClient.disconnectUser();
          }

          await chatClient.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: getAvatarUrl(authUser.profilePic, authUser._id),
            },
            tokenData.token
          );
        }

        if (!cancelled) {
          setClient(chatClient);
          setError(null);
        }
      } catch (err) {
        console.error("Error connecting Stream Chat:", err);
        if (!cancelled) setError(err);
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
  }, [tokenData, authUser]);

  const isLoading = (!!authUser && tokenLoading) || (!!authUser && !!tokenData?.token && !client && !error);

  return { client, isLoading, error, authUser };
};

export default useStreamChat;
