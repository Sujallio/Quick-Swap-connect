import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Lock, AlertCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validation";

const ResetPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    const checkToken = async () => {
      const token = searchParams.get("token");
      const type = searchParams.get("type");

      if (!token || type !== "recovery") {
        setTokenChecking(false);
        setIsValidToken(false);
        toast.error("Invalid or expired reset link");
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      // Token is present, assume it's valid (Supabase will verify on password update)
      setIsValidToken(true);
      setTokenChecking(false);
    };

    checkToken();
  }, [searchParams, navigate]);

  const handleResetPassword = async (data: ResetPasswordFormData) => {
    const token = searchParams.get("token");

    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });
    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  if (tokenChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary animate-pulse">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm">
            Enter your new password below
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters with uppercase, lowercase & number"
                {...form.register("password")}
                className={`h-12 pl-10 text-base ${
                  form.formState.errors.password ? "border-red-500" : ""
                }`}
              />
            </div>
            {form.formState.errors.password && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.password.message}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                {...form.register("confirmPassword")}
                className={`h-12 pl-10 text-base ${
                  form.formState.errors.confirmPassword ? "border-red-500" : ""
                }`}
              />
            </div>
            {form.formState.errors.confirmPassword && (
              <div className="flex items-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {form.formState.errors.confirmPassword.message}
              </div>
            )}
          </div>

          <Button
            onClick={form.handleSubmit(handleResetPassword)}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <a href="/login" className="text-primary font-medium hover:underline">
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
