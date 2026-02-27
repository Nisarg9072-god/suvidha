import { useParams, useNavigate } from "react-router-dom";
import { KioskHeader, UploadButton, PrimaryButton } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";

const TicketUpload = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleUpload = async (file: File) => {
    // In real app: uploadAttachment(id!, file)
    await new Promise((resolve) => setTimeout(resolve, 1500));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <KioskHeader title="Upload Attachment" showBack onLogout={logout} />

      <main className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center">
            <h2 className="text-kiosk-2xl font-bold text-foreground">Upload Proof / Document</h2>
            <p className="text-kiosk-base text-muted-foreground mt-2">Ticket: <span className="font-mono font-bold">{id}</span></p>
          </div>

          <UploadButton onUpload={handleUpload} />

          <PrimaryButton fullWidth size="large" onClick={() => navigate(`/tickets/${id}`)}>
            Done
          </PrimaryButton>
        </div>
      </main>
    </div>
  );
};

export default TicketUpload;
