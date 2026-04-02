import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Shield, Trash2, Ban, Users, FileText } from "lucide-react";
import { Navigate } from "react-router-dom";

const AdminPage = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
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
    const [profilesRes, requestsRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
    ]);
    setUsers(profilesRes.data || []);
    setRequests(requestsRes.data || []);
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

  if (isAdmin === null) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Checking access...</div>;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="pb-24 pt-4 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="w-full">
          <TabsTrigger value="users" className="flex-1"><Users className="mr-1.5 h-3.5 w-3.5" />Users ({users.length})</TabsTrigger>
          <TabsTrigger value="requests" className="flex-1"><FileText className="mr-1.5 h-3.5 w-3.5" />Requests ({requests.length})</TabsTrigger>
        </TabsList>

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

        <TabsContent value="requests" className="mt-4 space-y-2">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading...</div>
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
      </Tabs>
    </div>
  );
};

export default AdminPage;
