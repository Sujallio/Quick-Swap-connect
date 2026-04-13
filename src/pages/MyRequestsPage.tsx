import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

const MyRequestsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-requests", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleDelete = async (id: string) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    const { error } = await supabase
      .from("requests")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to delete");
      console.error("Delete error:", error);
    } else {
      toast.success("Request deleted");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    }
  };

  const handleComplete = async (id: string) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }
    const { error } = await supabase
      .from("requests")
      .update({ status: "completed" })
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update");
      console.error("Update error:", error);
    } else {
      toast.success("Marked as completed");
      queryClient.invalidateQueries({ queryKey: ["my-requests"] });
    }
  };

  return (
    <div className="pb-24 pt-4 px-4">
      <h1 className="text-xl font-bold text-foreground mb-1">My Requests</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your swap requests</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-medium text-foreground">No requests yet</p>
          <p className="text-sm text-muted-foreground">Post your first swap request!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xl font-bold">₹{req.amount.toLocaleString("en-IN")}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Need {req.need_type === "cash" ? "💵 Cash" : "📱 UPI"} → Have {req.have_type === "cash" ? "💵 Cash" : "📱 UPI"}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", statusStyles[req.status])}>
                  {req.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {req.city} · {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
              </div>
              {req.status === "active" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleComplete(req.id)} className="flex-1">
                    Mark Complete
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(req.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;
