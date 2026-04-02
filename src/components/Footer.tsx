import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-muted/30 px-4 py-6 mt-auto">
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <Link to="/about" className="hover:text-foreground">About</Link>
        <Link to="/contact" className="hover:text-foreground">Contact</Link>
        <Link to="/terms" className="hover:text-foreground">Terms</Link>
        <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
      </div>
      <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
        ⚠️ All transactions are conducted offline and at users' own risk.<br />
        QuickSwap Cash is a matching service only — we do not handle funds.
      </p>
      <p className="text-center text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} QuickSwap Cash. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
