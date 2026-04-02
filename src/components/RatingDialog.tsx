import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface RatingDialogProps {
  requestId: string;
  ratedUserId: string;
  onClose: () => void;
}

const RatingDialog = ({ requestId, ratedUserId, onClose }: RatingDialogProps) => {
  const { user } = useAuth();
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || score === 0) return;
    setSubmitting(true);
    const { error } = await supabase.from("ratings").insert({
      rater_id: user.id,
      rated_user_id: ratedUserId,
      request_id: requestId,
      score,
    } as any);
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") toast.info("You've already rated this exchange");
      else toast.error("Failed to submit rating");
    } else {
      toast.success("Rating submitted! Thanks for your feedback.");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-xl bg-card border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-foreground text-center">Rate this exchange</h3>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setScore(s)}
              className="p-1"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  s <= (hover || score) ? "fill-urgency-medium text-urgency-medium" : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {score === 0 ? "Tap a star to rate" : `${score} star${score > 1 ? "s" : ""}`}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={score === 0 || submitting} className="flex-1">
            {submitting ? "Saving..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingDialog;
