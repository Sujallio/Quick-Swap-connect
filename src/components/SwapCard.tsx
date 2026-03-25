import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, ArrowRight, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SwapCardProps {
  id: string;
  amount: number;
  needType: string;
  haveType: string;
  city: string;
  locationText: string;
  urgency: string;
  createdAt: string;
  isUnlocked?: boolean;
  phone?: string;
  onUnlock?: (id: string) => void;
  isOwn?: boolean;
  distance?: number;
}

const urgencyStyles: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-urgency-medium/10 text-urgency-medium border-urgency-medium/20",
  low: "bg-primary/10 text-primary border-primary/20",
};

const typeLabel = (t: string) => (t === "cash" ? "💵 Cash" : "📱 UPI");

const SwapCard = ({
  id, amount, needType, haveType, city, locationText,
  urgency, createdAt, isUnlocked, phone, onUnlock, isOwn, distance,
}: SwapCardProps) => {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <span className="text-2xl font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
        <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize", urgencyStyles[urgency] || urgencyStyles.low)}>
          {urgency} urgency
        </span>
      </div>

      {/* Transfer visualizer */}
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5">
        <span className="text-sm font-medium">Need {typeLabel(needType)}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Have {typeLabel(haveType)}</span>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {city}{locationText ? `, ${locationText}` : ""}
        </span>
        {distance !== undefined && (
          <span className="flex items-center gap-1 font-medium text-primary">
            📍 {distance < 1 ? `${Math.round(distance * 1000)}m away` : `${distance.toFixed(1)} km away`}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* CTA */}
      {!isOwn && (
        isUnlocked && phone ? (
          <div className="flex gap-2">
            <a
              href={`https://wa.me/91${phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button className="w-full" size="sm">
                <MessageCircle className="mr-1.5 h-4 w-4" />
                Chat on WhatsApp
              </Button>
            </a>
            <div className="flex items-center rounded-lg bg-muted px-3 text-sm font-medium">
              📞 {phone}
            </div>
          </div>
        ) : (
          <Button variant="unlock" className="w-full" size="sm" onClick={() => onUnlock?.(id)}>
            <Lock className="mr-1.5 h-4 w-4" />
            Unlock Contact · ₹5
          </Button>
        )
      )}
    </div>
  );
};

export default SwapCard;
