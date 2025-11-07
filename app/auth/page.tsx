'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { getUser } from "@/lib/firebaseService";
import { auth } from "@/lib/firebase";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, signOut, userData, loading: authLoading } = useAuth();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupRole, setSignupRole] = useState<"admin" | "representative">("representative");
  const [loading, setLoading] = useState(false);

  // REMOVED AUTO-REDIRECT - Let users access the auth page freely
  // Redirect will happen after successful login/signup via handleLogin/handleSignup

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(loginEmail, loginPassword);
      
      // Fetch fresh user data from Firestore after successful login
      const currentUser = auth.currentUser;
      if (currentUser) {
        const freshUserData = await getUser(currentUser.uid) as any;
        
        if (freshUserData) {
          toast.success("Login successful!");
          
          // Redirect based on role
          if (freshUserData.role === "admin") {
            router.push("/admin/dashboard");
          } else if (freshUserData.role === "representative") {
            if (freshUserData.federationId) {
              router.push("/");
            } else {
              router.push("/register-federation");
            }
          }
        }
      }
    } catch (error: any) {
      // Handle Firebase-specific errors
      let errorMessage = "Failed to login";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (error.code === "auth/user-disabled") {
        errorMessage = "This account has been disabled";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Firebase requires minimum 6 characters
    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters (Firebase requirement)");
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      await signUp(signupEmail, signupPassword, signupRole);
      
      if (signupRole === "admin") {
        toast.success("Admin account created successfully! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        toast.success("Account created successfully! Redirecting to federation registration...");
        setTimeout(() => {
          router.push("/register-federation");
        }, 1500);
      }
    } catch (error: any) {
      // Handle Firebase-specific errors
      let errorMessage = "Failed to create account";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered. Please login instead.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 left-4">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <Button 
          variant="destructive" 
          size="sm"
          onClick={async () => {
            await signOut();
            toast.success("Session cleared");
          }}
        >
          Clear Session
        </Button>
      </div>
      <Tabs defaultValue="login" className="w-full max-w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Access your Africon account.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>
                Create your Africon account to get started.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="m@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select value={signupRole} onValueChange={(val) => setSignupRole(val as "admin" | "representative")}>
                    <SelectTrigger id="signup-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="representative">Federation Representative</SelectItem>
                      <SelectItem value="admin">Tournament Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose Admin to manage tournaments, or Representative to register your federation
                  </p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
