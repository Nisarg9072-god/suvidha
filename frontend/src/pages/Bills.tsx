import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KioskHeader, PrimaryButton } from "@/components/kiosk";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, Smartphone, Building, CheckCircle, Download, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getBills } from "@/lib/api";

type PaymentMethod = "upi" | "debit" | "credit";

const Bills = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const res = await getBills();
        setBills(res.data.bills || []);
      } catch (err) {
        console.error("Failed to fetch bills:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBills();
  }, []);

  const handlePay = () => {
    if (!paymentMethod || !selectedBill) return;
    setProcessing(true);
    // In real app: createPayment({ billId: selectedBill.id, method: paymentMethod })
    setTimeout(() => {
      setPaymentId("PAY-" + Date.now().toString().slice(-8));
      setProcessing(false);
      setSuccess(true);
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    // In real app: downloadReceipt(paymentId)
    alert("Receipt download started (demo)");
  };

  if (success && selectedBill) {
    return (
      <div className="min-h-screen flex flex-col bg-background/90">
        <KioskHeader title="Payment Successful" showBack onLogout={logout} />
        <main className="flex-1 flex items-center justify-center px-8">
          <div className="max-w-lg text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-kiosk-3xl font-bold text-foreground">Payment Successful!</h2>
            <p className="text-kiosk-xl text-muted-foreground">₹{((selectedBill.amount_paise || (selectedBill.amount * 100)) / 100).toFixed(2)} paid for {selectedBill.bill_type || selectedBill.type}</p>
            <p className="text-kiosk-base text-muted-foreground font-mono">Payment ID: {paymentId}</p>
            <div className="flex gap-4 justify-center">
              <PrimaryButton size="large" onClick={handleDownloadReceipt}>
                <Download className="w-5 h-5 mr-2" />
                Download Receipt PDF
              </PrimaryButton>
              <PrimaryButton size="large" onClick={() => { setSuccess(false); setSelectedBill(null); setPaymentMethod(null); }}>
                Back to Bills
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (selectedBill) {
    return (
      <div className="min-h-screen flex flex-col bg-background/90">
        <KioskHeader title="Pay Bill" showBack onLogout={logout} />
        <main className="flex-1 px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Bill summary */}
            <div className="bg-card border-2 border-border rounded-xl overflow-hidden">
              <div className="bg-primary text-primary-foreground px-6 py-4">
                <p className="text-kiosk-lg font-semibold">{selectedBill.type} Bill</p>
                <p className="text-kiosk-sm text-primary-foreground/80">Bill ID: {selectedBill.id}</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Due Date</span><span className="text-destructive font-semibold">{selectedBill.due_date || selectedBill.dueDate}</span></div>
                <div className="flex justify-between text-kiosk-xl font-bold"><span>Total Payable</span><span className="text-accent">₹{((selectedBill.amount_paise || (selectedBill.amount * 100)) / 100).toFixed(2)}</span></div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="space-y-3">
              <h3 className="text-kiosk-xl font-bold">Payment Method</h3>
              {([
                { id: "upi" as const, name: "UPI", icon: Smartphone },
                { id: "debit" as const, name: "Debit Card", icon: CreditCard },
                { id: "credit" as const, name: "Credit Card", icon: Building },
              ]).map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                  className={cn("w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-colors",
                    paymentMethod === m.id ? "border-accent bg-accent/10" : "border-border bg-card"
                  )}>
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", paymentMethod === m.id ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                    <m.icon className="w-6 h-6" />
                  </div>
                  <span className="text-kiosk-lg font-semibold">{m.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-kiosk-sm"><strong>Demo Mode:</strong> No real payment will be processed.</p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setSelectedBill(null)} className="h-14 px-8 rounded-lg border-2 border-primary text-primary font-semibold text-kiosk-base">Cancel</button>
              <PrimaryButton fullWidth size="large" onClick={handlePay} disabled={!paymentMethod || processing}>
                {processing ? "Processing..." : `Pay ₹${((selectedBill.amount_paise || (selectedBill.amount * 100)) / 100).toFixed(2)}`}
              </PrimaryButton>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background/90">
      <KioskHeader
        title="Bills & Payments"
        showBack
        language={user?.preferredLanguage || "en"}
        onLanguageChange={(lang) => updateUser({ preferredLanguage: lang })}
        onLogout={logout}
      />

      <main className="flex-1 px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-kiosk-xl text-muted-foreground">Loading your bills...</p>
            </div>
          ) : (
            <>
              {bills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between bg-card border-2 border-border rounded-xl p-5">
                  <div>
                    <p className="text-kiosk-lg font-semibold text-foreground">{bill.bill_type || bill.type}</p>
                    <p className="text-kiosk-sm text-muted-foreground">Due: {bill.due_date || bill.dueDate} • {bill.department_code || bill.department}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-kiosk-xl font-bold text-foreground">₹{( (bill.amount_paise || (bill.amount * 100)) / 100).toFixed(2)}</p>
                    {(bill.status === "due" || !bill.paid_at) ? (
                      <PrimaryButton onClick={() => setSelectedBill(bill)}>Pay Now</PrimaryButton>
                    ) : (
                      <span className="px-4 py-2 rounded-lg bg-success/15 text-success font-semibold text-kiosk-sm">Paid</span>
                    )}
                  </div>
                </div>
              ))}
              {bills.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-kiosk-xl text-muted-foreground">No bills found</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Bills;
