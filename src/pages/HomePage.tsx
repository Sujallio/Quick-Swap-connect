import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SwapCard from "@/components/SwapCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { processPayment } from "@/lib/razorpay";

const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const HomePage = () => {
  const { user } = useAuth();
  const [city, setCity] = useState("");
  const [needType, setNeedType] = useState("all");
  const [unlockedMap, setUnlockedMap] = useState<Record<string, string>>({});
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {} // silently fail
      );
    }
  }, []);

  // Fetch requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", city, needType],
    queryFn: async () => {
      let q = supabase
        .from("requests")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (city) q = q.ilike("city", `%${city}%`);
      if (needType !== "all") q = q.eq("need_type", needType);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  // Fetch user's unlocks and the phone numbers for unlocked requests
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: unlocks } = await supabase
        .from("unlocks")
        .select("request_id")
        .eq("viewer_id", user.id);
      if (!unlocks || unlocks.length === 0) return;

      const requestIds = unlocks.map((u) => u.request_id);
      // Get user_ids for those requests
      const { data: reqs } = await supabase
        .from("requests")
        .select("id, user_id")
        .in("id", requestIds);
      if (!reqs) return;

      const userIds = [...new Set(reqs.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, phone")
        .in("user_id", userIds);

      const phoneByUserId: Record<string, string> = {};
      profiles?.forEach((p) => { phoneByUserId[p.user_id] = p.phone; });

      const map: Record<string, string> = {};
      reqs.forEach((r) => {
        map[r.id] = phoneByUserId[r.user_id] || "";
      });
      setUnlockedMap(map);
    })();
  }, [user]);

  const handleUnlock = async (requestId: string) => {
    if (!user) {
      toast.error("Please login first");
      return;
    }

    // Razorpay payment for ₹5 unlock
    let paymentId: string;
    try {
      const result = await processPayment(5, "unlock");
      paymentId = result.payment_id;
    } catch (err: any) {
      toast.error(err.message || "Payment failed");
      return;
    }

    const { error } = await supabase.from("unlocks").insert({
      request_id: requestId,
      viewer_id: user.id,
      payment_id: paymentId,
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("Already unlocked!");
      } else {
        toast.error("Failed to unlock");
      }
      return;
    }

    // Fetch the phone for this request
    const req = requests.find((r) => r.id === requestId);
    if (req) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("user_id", req.user_id)
        .single();
      setUnlockedMap((prev) => ({ ...prev, [requestId]: profile?.phone || "" }));
    }

    toast.success("Contact unlocked! ₹5 charged (mock)");
  };

  const getPhone = (req: any): string | undefined => {
    if (unlockedMap[req.id]) {
      return unlockedMap[req.id] || undefined;
    }
    return undefined;
  };

  return (
    <div className="pb-20 pt-4">
      <div className="px-4 space-y-4">
        <p className="text-sm text-muted-foreground">Find nearby cash exchanges</p>


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
            {requests.map((req) => {
              const reqAny = req as any;
              let distance: number | undefined;
              if (userCoords && reqAny.latitude && reqAny.longitude) {
                distance = getDistanceKm(userCoords.lat, userCoords.lng, reqAny.latitude, reqAny.longitude);
              }
              return (
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
                  distance={distance}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
