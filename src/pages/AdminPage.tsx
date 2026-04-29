import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Trash2, Ban, Users, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) loadData();
    });
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const [profilesRes, requestsRes, pendingRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("requests").select("*").eq("status", "verified").order("created_at", { ascending: false }),
      supabase.from("requests").select("*").eq("status", "pending_verification").order("created_at", { ascending: false }),
    ]);
    setUsers(profilesRes.data || []);
    setRequests(requestsRes.data || []);
    setPendingRequests(pendingRes.data || []);
    setLoading(false);
  };

  const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
    const { error } = await supabase.from("profiles").update({ is_blocked: !currentlyBlocked }).eq("user_id", userId);
    if (error) { toast.error("Failed to update user"); return; }
    toast.success(currentlyBlocked ? "User unblocked" : "User blocked");
    setUsers((prev) => prev.map((u) => u.user_id === userId ? { ...u, is_blocked: !currentlyBlocked } : u));
  };

  const handleDeleteRequest = async (id: string) => {
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    toast.success("Request deleted");
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleVerifyPayment = async (id: string) => {
    const { error } = await supabase.from("requests").update({ status: "verified" }).eq("id", id);
    if (error) { toast.error("Failed to verify"); return; }
    toast.success("Payment verified!");
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    loadData();
  };

  const handleRejectPayment = async (id: string) => {
    const { error } = await supabase.from("requests").update({ status: "rejected" }).eq("id", id);
    if (error) { toast.error("Failed to reject"); return; }
    toast.success("Payment rejected");
    setPendingRequests((prev) => prev.filter((r) => r.id !== id));
    loadData();
  };

  if (isAdmin === null) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="pb-24 pt-4 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="pending"><FileText className="mr-1.5 h-3.5 w-3.5" />Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="requests"><CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />Verified ({requests.length})</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-1.5 h-3.5 w-3.5" />Users ({users.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No pending requests</div>
          ) : pendingRequests.map((r) => (
            <div key={r.id} className="rounded-lg border bg-yellow-50 dark:bg-yellow-950/20 p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">₹{r.amount} · {r.need_type === "cash" ? "Need Cash" : "Need UPI"}</p>
                <p className="text-xs text-muted-foreground">{r.city} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              
              {/* Transaction ID */}
              <div className="bg-white dark:bg-slate-900 p-2 rounded border text-xs">
                <p className="text-muted-foreground">TXN ID:</p>
                <p className="font-mono font-semibold text-foreground">{r.transaction_id}</p>
              </div>

              {/* Screenshot Preview */}
              {r.payment_screenshot && (
                <div className="text-xs">
                  <p className="text-muted-foreground mb-1">Screenshot:</p>
                  <a 
                    href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/payment-screenshots/${r.payment_screenshot}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    View Screenshot
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerifyPayment(r.id)}
                >
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleRejectPayment(r.id)}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No verified requests</div>
          ) : requests.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">₹{r.amount} · {r.need_type === "cash" ? "Need Cash" : "Need UPI"}</p>
                <p className="text-xs text-muted-foreground">{r.city} · {r.status} · {new Date(r.created_at).toLocaleDateString()}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteRequest(r.id)} className="shrink-0">
                <Trash2 className="mr-1 h-3 w-3" />Delete
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
          ) : users.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{u.name || "No name"}</p>
                <p className="text-xs text-muted-foreground">{u.city || "No city"} · ⭐ {u.rating}</p>
                {u.is_blocked && <span className="text-[10px] font-semibold text-destructive">BLOCKED</span>}
              </div>
              <Button
                size="sm"
                variant={u.is_blocked ? "outline" : "destructive"}
                onClick={() => handleBlockUser(u.user_id, u.is_blocked)}
                className="shrink-0"
              >
                <Ban className="mr-1 h-3 w-3" />
                {u.is_blocked ? "Unblock" : "Block"}
              </Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
