import { useWindowResize } from "@/hooks/useWindowResize";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessageInput = {
  placeholder: string;
  accentColor: string;
  height: number;
  onSend?: (message: string) => void;
};

export const ChatMessageInput = ({
  placeholder,
  accentColor,
  height,
  onSend,
}: ChatMessageInput) => {
  const [message, setMessage] = useState("");
  const [inputTextWidth, setInputTextWidth] = useState(0);
  const [inputWidth, setInputWidth] = useState(0);
  const hiddenInputRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const windowSize = useWindowResize();
  const [isTyping, setIsTyping] = useState(false);
  const [inputHasFocus, setInputHasFocus] = useState(false);

  const handleSend = useCallback(() => {
    if (!onSend) {
      return;
    }
    if (message === "") {
      return;
    }

    onSend(message);
    setMessage("");
  }, [onSend, message]);

  useEffect(() => {
    setIsTyping(true);
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    if (hiddenInputRef.current) {
      setInputTextWidth(hiddenInputRef.current.clientWidth);
    }
  }, [hiddenInputRef, message]);

  useEffect(() => {
    if (inputRef.current) {
      setInputWidth(inputRef.current.clientWidth);
    }
  }, [hiddenInputRef, message, windowSize.width]);

  return (
    <div className="flex-grow relative h-full">
      <div className="flex flex-row items-center relative w-full h-full">
        <div
          className={`w-2 h-4 bg-${inputHasFocus ? accentColor : "gray"}-${
            inputHasFocus ? 500 : 800
          } ${inputHasFocus ? "shadow-" + accentColor : ""} absolute left-2 ${
            !isTyping && inputHasFocus ? "cursor-animation" : ""
          }`}
          style={{
            transform:
              "translateX(" +
              (message.length > 0
                ? Math.min(inputTextWidth, inputWidth - 20) - 4
                : 0) +
              "px)",
          }}
        ></div>
        <input
          ref={inputRef}
          className={`w-full h-10 text-xs caret-transparent bg-gray-900 opacity-25 text-gray-300 p-2 pr-10 rounded-sm focus:opacity-100 focus:outline-none focus:border-${accentColor}-700 focus:ring-1 focus:ring-${accentColor}-700 overflow-hidden text-ellipsis whitespace-nowrap`}
          style={{
            paddingLeft: message.length > 0 ? "12px" : "24px",
            caretShape: "block",
          }}
          placeholder={placeholder}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          onFocus={() => {
            setInputHasFocus(true);
          }}
          onBlur={() => {
            setInputHasFocus(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        ></input>
        <span
          ref={hiddenInputRef}
          className="absolute top-0 left-0 text-xs pl-3 text-amber-500 pointer-events-none opacity-0"
        >
          {message.replaceAll(" ", "\u00a0")}
        </span>
        <button
          disabled={message.length === 0 || !onSend}
          onClick={handleSend}
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs p-2 rounded-md opacity-${
            message.length > 0 ? 100 : 25
          } pointer-events-${
            message.length > 0 ? "auto" : "none"
          } hover:bg-${accentColor}-950`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={`currentColor`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-${accentColor}-500`}
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
};
