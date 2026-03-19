import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SwapCard from "@/components/SwapCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

const HomePage = () => {
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [needType, setNeedType] = useState("all");
  const [unlockedMap, setUnlockedMap] = useState<Record<string, string>>({});

  // Fetch requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", city, needType],
    queryFn: async () => {
      let q = supabase
        .from("requests")
        .select("*, profiles!requests_user_id_fkey(phone)")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (city) q = q.ilike("city", `%${city}%`);
      if (needType !== "all") q = q.eq("need_type", needType);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's unlocks
  useEffect(() => {
    if (!user) return;
    supabase
      .from("unlocks")
      .select("request_id")
      .eq("viewer_id", user.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((u) => { map[u.request_id] = "unlocked"; });
          setUnlockedMap(map);
        }
      });
  }, [user]);

  const handleUnlock = async (requestId: string) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    // Mock payment
    toast.info("Processing mock payment of ₹5...");
    await new Promise((r) => setTimeout(r, 1000));

    const { error } = await supabase.from("unlocks").insert({
      request_id: requestId,
      viewer_id: user.id,
      payment_id: `mock_${Date.now()}`,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("Already unlocked!");
      } else {
        toast.error("Failed to unlock");
      }
      return;
    }

    setUnlockedMap((prev) => ({ ...prev, [requestId]: "unlocked" }));
    toast.success("Contact unlocked! ₹5 charged (mock)");
  };

  const getPhone = (req: any): string | undefined => {
    if (unlockedMap[req.id] && req.profiles) {
      return (req.profiles as any).phone;
    }
    return undefined;
  };

  return (
    <div className="pb-20 pt-4">
      <div className="px-4 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">QuickSwap Cash</h1>
          <p className="text-sm text-muted-foreground">Find nearby cash exchanges</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
          <Select value={needType} onValueChange={setNeedType}>
            <SelectTrigger className="w-32 h-10">
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="cash">Need Cash</SelectItem>
              <SelectItem value="upi">Need UPI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="text-lg font-medium text-foreground">No requests found</p>
            <p className="text-sm text-muted-foreground">Try changing your filters or check back later</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <SwapCard
                key={req.id}
                id={req.id}
                amount={req.amount}
                needType={req.need_type}
                haveType={req.have_type}
                city={req.city}
                locationText={req.location_text}
                urgency={req.urgency}
                createdAt={req.created_at}
                isUnlocked={!!unlockedMap[req.id]}
                phone={getPhone(req)}
                onUnlock={handleUnlock}
                isOwn={req.user_id === user?.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
