import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, Star, FileText } from "lucide-react";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ name: "", phone: "", city: "" });
  const [stats, setStats] = useState({ totalRequests: 0, rating: 4.0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setProfile({ name: data.name, phone: data.phone, city: data.city });
          setStats({ totalRequests: 0, rating: data.rating });
        }
      });
    supabase
      .from("requests")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .then(({ count }) => {
        setStats((s) => ({ ...s, totalRequests: count ?? 0 }));
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: profile.name.trim(), phone: profile.phone.trim(), city: profile.city.trim() })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
  };

  return (
    <div className="pb-24 pt-4 px-4">
      <h1 className="text-xl font-bold text-foreground mb-6">Profile</h1>

      <div className="rounded-xl border bg-card p-5 space-y-5">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
            {profile.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-semibold text-foreground">{profile.name || "Set your name"}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-urgency-medium" />{stats.rating}</span>
              <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{stats.totalRequests} requests</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-12" maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="h-12" maxLength={15} />
          </div>
          <div className="space-y-1.5">
            <Label>City</Label>
            <Input value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} className="h-12" maxLength={100} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full h-12 font-semibold">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      <Button variant="ghost" onClick={signOut} className="w-full mt-4 text-destructive hover:text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>

      <p className="mt-8 text-center text-xs text-muted-foreground px-4">
        This platform only connects users for cash/digital exchange. All transactions are conducted offline at users' own risk. We are not responsible for any fraud or disputes.
      </p>
    </div>
  );
};

export default ProfilePage;
