import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, User, MapPin } from "lucide-react";

const OnboardingPage = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !city.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!user) return;
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert(
          { user_id: user.id, name: name.trim(), city: city.trim() },
          { onConflict: "user_id" }
        );
      
      if (error) {
        console.error("Error saving profile:", error);
        toast.error(`Failed to save profile: ${error.message}`);
        setLoading(false);
        return;
      }

      toast.success("Profile complete! Welcome to QuickSwap Cash.");
      // Wait for database to update
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err: any) {
      console.error("Exception saving profile:", err);
      toast.error(err.message || "Failed to save profile");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
          <p className="text-muted-foreground text-sm">
            Tell us a bit about yourself to get started
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 pl-10 text-base"
                maxLength={100}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                placeholder="Your city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-12 pl-10 text-base"
                maxLength={100}
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
