import { FileText, Image, Download } from "lucide-react";
import { downloadAttachment } from "@/lib/api";

interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface AttachmentListProps {
  attachments: Attachment[];
}

const AttachmentList: React.FC<AttachmentListProps> = ({ attachments = [] }) => {
  const handleDownload = async (att: Attachment) => {
    try {
      const res = await downloadAttachment(att.id);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = att.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Download failed. Please try again.");
    }
  };

  if (!attachments || !attachments.length) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-kiosk-base font-semibold text-foreground">Attachments</h4>
      {attachments.map((att) => {
        const isImage = att.mimeType.startsWith("image/");
        return (
          <div key={att.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            {isImage ? <Image className="w-5 h-5 text-info" /> : <FileText className="w-5 h-5 text-accent" />}
            <span className="flex-1 text-kiosk-sm truncate">{att.filename}</span>
            <span className="text-kiosk-xs text-muted-foreground">{(att.size / 1024).toFixed(0)} KB</span>
            <button onClick={() => handleDownload(att)} className="p-2 rounded hover:bg-background transition-colors">
              <Download className="w-4 h-4 text-primary" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export { AttachmentList };
export type { Attachment };
