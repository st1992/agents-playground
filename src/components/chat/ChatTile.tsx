import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatMessageInput } from "@/components/chat/ChatMessageInput";
import {
  ChatMessage as ComponentsChatMessage,
  TrackToggle,
  useMediaDeviceSelect,
  useLocalParticipant,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useRef, useState, useCallback } from "react";

const inputHeight = 48;

export type ChatMessageType = {
  name: string;
  message: string;
  isSelf: boolean;
  timestamp: number;
};

type ChatTileProps = {
  messages: ChatMessageType[];
  accentColor: string;
  onSend?: (message: string) => Promise<ComponentsChatMessage>;
};

export const ChatTile = ({ messages, accentColor, onSend }: ChatTileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const deviceSelect = useMediaDeviceSelect({ kind: "audioinput" });
  const [showDevices, setShowDevices] = useState(false);
  const { localParticipant } = useLocalParticipant();
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);

  // Handle push-to-talk key events
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (
        event.code === "KeyM" &&
        event.shiftKey &&
        !event.repeat &&
        !isPushToTalkActive
      ) {
        event.preventDefault();
        setIsPushToTalkActive(true);
        localParticipant?.setMicrophoneEnabled(true);
      }
    },
    [localParticipant, isPushToTalkActive]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.code === "KeyM" && event.shiftKey && isPushToTalkActive) {
        event.preventDefault();
        setIsPushToTalkActive(false);
        localParticipant?.setMicrophoneEnabled(false);
      }
    },
    [localParticipant, isPushToTalkActive]
  );

  // Add and remove event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [containerRef, messages]);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div
        ref={containerRef}
        className="overflow-y-auto"
        style={{
          height: `calc(100% - ${inputHeight + 8}px)`,
        }}
      >
        <div className="flex flex-col min-h-full justify-end">
          {messages.map((message, index, allMsg) => {
            const hideName =
              index >= 1 && allMsg[index - 1].name === message.name;

            return (
              <ChatMessage
                key={index}
                hideName={hideName}
                name={message.name}
                message={message.message}
                isSelf={message.isSelf}
                accentColor={accentColor}
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-row items-center w-full border-t border-gray-800 pt-2 px-2 gap-2 h-[48px]">
        <ChatMessageInput
          height={inputHeight}
          placeholder="Type a message"
          accentColor={accentColor}
          onSend={onSend}
        />
        <TrackToggle
          source={Track.Source.Microphone}
          className={`p-2 bg-gray-900 text-gray-300 border border-gray-800 rounded-sm hover:bg-gray-800 flex-shrink-0 ${
            isPushToTalkActive
              ? `border-${accentColor}-500 shadow-${accentColor}`
              : ""
          }`}
        />
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDevices(!showDevices)}
            className="p-2 bg-gray-900 text-gray-300 border border-gray-800 rounded-sm hover:bg-gray-800"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {showDevices && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-900 border border-gray-800 rounded-sm shadow-lg">
              {deviceSelect.devices.map((device) => (
                <button
                  key={device.deviceId}
                  onClick={() => {
                    deviceSelect.setActiveMediaDevice(device.deviceId);
                    setShowDevices(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    device.deviceId === deviceSelect.activeDeviceId
                      ? `text-${accentColor}-500`
                      : "text-gray-300"
                  } hover:bg-gray-800`}
                >
                  {device.label || "Default Device"}
                  {device.deviceId === deviceSelect.activeDeviceId && (
                    <span className="ml-2">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
