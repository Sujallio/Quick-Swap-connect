import { Shield } from "lucide-react";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-lg items-center gap-2.5 px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Shield className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-bold text-foreground tracking-tight">QuickSwap Cash</span>
      </div>
    </header>
  );
};

export default AppHeader;
