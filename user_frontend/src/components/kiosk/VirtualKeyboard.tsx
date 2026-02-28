import * as React from "react";
import { cn } from "@/lib/utils";

type KeyboardMode = "numeric" | "alphanumeric";

interface VirtualKeyboardProps {
  visible: boolean;
  value: string;
  mode?: KeyboardMode;
  onChange: (next: string) => void;
  onClose?: () => void;
  label?: string;
}

const numericKeys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const alphaRows = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  visible,
  value,
  mode = "numeric",
  onChange,
  onClose,
  label,
}) => {
  if (!visible) return null;

  const handleKey = (key: string) => {
    if (key === "BACKSPACE") {
      onChange(value.slice(0, -1));
    } else if (key === "SPACE") {
      onChange(value + " ");
    } else if (key === "CLEAR") {
      onChange("");
    } else {
      onChange(value + key);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-6">
      <div className="w-full max-w-4xl rounded-2xl bg-card border-2 border-border shadow-2xl">
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <div className="space-y-1">
            {label && <p className="text-kiosk-sm text-muted-foreground">{label}</p>}
            <p className="min-h-[2.5rem] px-3 py-1 rounded bg-muted text-kiosk-lg text-left overflow-x-auto">
              {value || "\u00a0"}
            </p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="ml-4 px-4 py-2 rounded-lg bg-muted text-kiosk-sm font-medium hover:bg-muted/80"
            >
              Close
            </button>
          )}
        </div>

        <div className="px-4 py-3 space-y-2">
          {mode === "numeric" ? (
            <div className="grid grid-cols-3 gap-3">
              {numericKeys.map((k) => (
                <KeyButton key={k} label={k} onClick={() => handleKey(k)} />
              ))}
              <KeyButton label="Clear" wide onClick={() => handleKey("CLEAR")} />
              <KeyButton label="0" onClick={() => handleKey("0")} />
              <KeyButton label="⌫" onClick={() => handleKey("BACKSPACE")} />
            </div>
          ) : (
            <div className="space-y-2">
              {alphaRows.map((row, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex justify-center gap-2",
                    idx === 1 && "pl-4",
                    idx === 2 && "pl-10"
                  )}
                >
                  {row.map((k) => (
                    <KeyButton
                      key={k}
                      label={k}
                      onClick={() => handleKey(k)}
                    />
                  ))}
                </div>
              ))}
              <div className="flex justify-center gap-3 mt-1">
                <KeyButton label="Space" wide onClick={() => handleKey("SPACE")} />
                <KeyButton label="Clear" onClick={() => handleKey("CLEAR")} />
                <KeyButton label="⌫" onClick={() => handleKey("BACKSPACE")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface KeyButtonProps {
  label: string;
  onClick: () => void;
  wide?: boolean;
}

const KeyButton: React.FC<KeyButtonProps> = ({ label, onClick, wide }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "h-14 px-3 rounded-lg bg-muted text-foreground text-kiosk-lg font-semibold",
      "flex items-center justify-center",
      "hover:bg-accent hover:text-accent-foreground",
      "active:scale-[0.97] transition-transform",
      wide && "flex-[1.5]"
    )}
  >
    {label}
  </button>
);

