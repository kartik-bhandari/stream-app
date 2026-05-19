import { useNavigate } from "react-router";
import {
  CallingState,
  RingingCall,
  StreamCall,
  useCalls,
} from "@stream-io/video-react-sdk";
import { PhoneIcon, PhoneOffIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useStreamVideo } from "../providers/StreamVideoProvider";

const IncomingCallHandler = () => {
  const navigate = useNavigate();
  const { isReady } = useStreamVideo();
  const calls = useCalls();

  if (!isReady) return null;

  const incomingCall = calls.find(
    (call) =>
      call.isCreatedByMe === false && call.state.callingState === CallingState.RINGING
  );

  if (!incomingCall) return null;

  const caller = incomingCall.state.members.find(
    (m) => m.userId !== incomingCall.currentUserId
  );
  const callerName = caller?.user?.name || "Someone";

  const handleAccept = async () => {
    try {
      await incomingCall.join();
      navigate(`/call/${incomingCall.id}`);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Could not join the call");
    }
  };

  const handleReject = async () => {
    try {
      await incomingCall.leave({ reject: true, reason: "decline" });
      toast.error("Call declined");
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card bg-base-200 shadow-2xl w-full max-w-md">
        <div className="card-body items-center text-center gap-4">
          <p className="text-sm opacity-70">Incoming video call</p>
          <h2 className="text-2xl font-bold">{callerName}</h2>

          <StreamCall call={incomingCall}>
            <RingingCall />
          </StreamCall>

          <div className="flex gap-3 w-full mt-2">
            <button type="button" onClick={handleReject} className="btn btn-error flex-1 gap-2">
              <PhoneOffIcon className="size-5" />
              Decline
            </button>
            <button type="button" onClick={handleAccept} className="btn btn-success flex-1 gap-2">
              <PhoneIcon className="size-5" />
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallHandler;
