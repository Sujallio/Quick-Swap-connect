import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ReportDialogProps {
  reportedUserId: string;
  requestId: string;
  onClose: () => void;
}

const ReportDialog = ({ reportedUserId, requestId, onClose }: ReportDialogProps) => {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      request_id: requestId,
      reason: reason.trim(),
    } as any);
    setSubmitting(false);
    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted. We'll review it shortly.");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-xl bg-card border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base font-bold text-foreground text-center">Report User</h3>
        <p className="text-xs text-muted-foreground text-center">
          Help us keep the community safe. Tell us what happened.
        </p>
        <Textarea
          placeholder="Describe the issue..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!reason.trim() || submitting} className="flex-1">
            {submitting ? "Sending..." : "Report"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;
