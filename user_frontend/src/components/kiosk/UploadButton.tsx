import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadButtonProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
}

const UploadButton: React.FC<UploadButtonProps> = ({
  onUpload,
  accept = ".jpeg,.jpg,.png,.pdf",
  maxSizeMB = 5,
}) => {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setErrorMsg(`File too large. Max ${maxSizeMB} MB.`);
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("uploading");
    setErrorMsg("");
    try {
      await onUpload(file);
      setStatus("success");
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        onClick={() => { inputRef.current?.click(); setStatus("idle"); }}
        className={cn(
          "w-full flex flex-col items-center justify-center gap-3 p-8",
          "border-2 border-dashed rounded-xl transition-colors",
          "focus:outline-none focus:ring-4 focus:ring-accent/20",
          status === "error" ? "border-destructive bg-destructive/5" :
          status === "success" ? "border-success bg-success/5" :
          "border-border hover:border-accent bg-card"
        )}
      >
        {status === "uploading" ? (
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        ) : status === "success" ? (
          <CheckCircle className="w-10 h-10 text-success" />
        ) : status === "error" ? (
          <AlertCircle className="w-10 h-10 text-destructive" />
        ) : (
          <Upload className="w-10 h-10 text-muted-foreground" />
        )}
        <div className="text-center">
          {status === "uploading" && <p className="text-kiosk-base font-medium">Uploading {fileName}...</p>}
          {status === "success" && <p className="text-kiosk-base font-medium text-success">{fileName} uploaded!</p>}
          {status === "error" && <p className="text-kiosk-base font-medium text-destructive">{errorMsg}</p>}
          {status === "idle" && (
            <>
              <p className="text-kiosk-base font-medium text-foreground">Tap to upload file</p>
              <p className="text-kiosk-sm text-muted-foreground">JPEG, PNG, PDF • Max {maxSizeMB} MB</p>
            </>
          )}
        </div>
      </button>
    </div>
  );
};

export { UploadButton };
