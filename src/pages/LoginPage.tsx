import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, Mail, Lock, Phone, AlertCircle } from "lucide-react";
import { loginSchema, signupSchema, type LoginFormData, type SignupFormData } from "@/lib/validation";

const LoginPage = () => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [loading, setLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", phone: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged in successfully!");
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    setLoading(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { phone: data.phone } },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else if (authData.user) {
      await supabase
        .from("profiles")
        .update({ phone: data.phone })
        .eq("user_id", authData.user.id);
      toast.success("Account created! Please check your email to verify.");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email!");
      setMode("login");
      setForgotEmail("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">QuickSwap Cash</h1>
          <p className="text-muted-foreground text-sm">
            {mode === "login"
              ? "Sign in to exchange cash & digital money nearby"
              : mode === "forgot"
              ? "Reset your password"
              : "Create an account to get started"}
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          {/* FORGOT PASSWORD MODE */}
          {mode === "forgot" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="h-12 pl-10 text-base"
                  />
                </div>
              </div>

              <Button
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="w-full h-12 text-base font-semibold"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <button
                onClick={() => setMode("login")}
                className="w-full text-center text-sm text-primary font-medium hover:underline"
              >
                Back to Sign In
              </button>
            </>
          )}

          {/* LOGIN MODE */}
          {mode === "login" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    {...loginForm.register("email")}
                    className={`h-12 pl-10 text-base ${
                      loginForm.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {loginForm.formState.errors.email.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Your password"
                    {...loginForm.register("password")}
                    className={`h-12 pl-10 text-base ${
                      loginForm.formState.errors.password ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {loginForm.formState.errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {loginForm.formState.errors.password.message}
                  </div>
                )}
              </div>

              <Button
                onClick={loginForm.handleSubmit(handleLogin)}
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="space-y-2 text-center text-sm text-muted-foreground">
                <p>
                  Don't have an account?{" "}
                  <button
                    onClick={() => {
                      setMode("signup");
                      signupForm.reset();
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </button>
                </p>
                <p>
                  <button
                    onClick={() => setMode("forgot")}
                    className="text-primary font-medium hover:underline"
                  >
                    Forgot password?
                  </button>
                </p>
              </div>
            </>
          )}

          {/* SIGNUP MODE */}
          {mode === "signup" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <div className="flex gap-2">
                  <div className="flex h-12 items-center rounded-lg border bg-muted px-3 text-sm font-medium text-muted-foreground">
                    +91
                  </div>
                  <div className="flex-1">
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="10-digit number"
                      {...signupForm.register("phone")}
                      className={`h-12 text-base ${
                        signupForm.formState.errors.phone ? "border-red-500" : ""
                      }`}
                      maxLength={10}
                    />
                    {signupForm.formState.errors.phone && (
                      <div className="flex items-center gap-2 text-sm text-red-500 mt-1">
                        <AlertCircle className="h-4 w-4" />
                        {signupForm.formState.errors.phone.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    {...signupForm.register("email")}
                    className={`h-12 pl-10 text-base ${
                      signupForm.formState.errors.email ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {signupForm.formState.errors.email.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 6 characters with uppercase, lowercase & number"
                    {...signupForm.register("password")}
                    className={`h-12 pl-10 text-base ${
                      signupForm.formState.errors.password ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {signupForm.formState.errors.password && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {signupForm.formState.errors.password.message}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    {...signupForm.register("confirmPassword")}
                    className={`h-12 pl-10 text-base ${
                      signupForm.formState.errors.confirmPassword ? "border-red-500" : ""
                    }`}
                  />
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    {signupForm.formState.errors.confirmPassword.message}
                  </div>
                )}
              </div>

              <Button
                onClick={signupForm.handleSubmit(handleSignup)}
                disabled={loading}
                className="w-full h-12 text-base font-semibold"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    loginForm.reset();
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
