import { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import { getAvatarUrl } from "../lib/avatar";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const StreamVideoContext = createContext({ client: null, isReady: false });

export const useStreamVideo = () => useContext(StreamVideoContext);

const StreamVideoProvider = ({ children, enabled = true }) => {
  const { authUser } = useAuthUser();
  const [client, setClient] = useState(null);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: enabled && !!authUser,
  });

  useEffect(() => {
    if (!enabled || !tokenData?.token || !authUser) {
      setClient(null);
      return;
    }

    let videoClient;

    const connect = async () => {
      videoClient = new StreamVideoClient({
        apiKey: STREAM_API_KEY,
        user: {
          id: authUser._id,
          name: authUser.fullName,
          image: getAvatarUrl(authUser.profilePic, authUser._id),
        },
        token: tokenData.token,
      });

      setClient(videoClient);
    };

    connect();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser().catch(() => {});
      }
      setClient(null);
    };
  }, [enabled, tokenData, authUser]);

  if (!enabled || !client) {
    return (
      <StreamVideoContext.Provider value={{ client: null, isReady: false }}>
        {children}
      </StreamVideoContext.Provider>
    );
  }

  return (
    <StreamVideoContext.Provider value={{ client, isReady: true }}>
      <StreamVideo client={client}>{children}</StreamVideo>
    </StreamVideoContext.Provider>
  );
};

export default StreamVideoProvider;
