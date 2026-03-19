import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just navigate to reset password page
    navigate("/reset-password");
  };

  return (
    <AuthLayout 
      title="Hello, welcome back."
      subtitle="Your trusted store for authentic gadgets. Sign up to track your orders, get updates, and shop faster next time."
    >
      <div>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Forget Password</h1>
        
        <p className="text-gray-600 text-sm mb-8">
          Don't worry, it happens.<br />
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Email</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="eg. janejo@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pr-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
          
          <Button 
            type="submit" 
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-white"
          >
            SEND REQUEST LINK
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="w-full text-primary font-medium"
            onClick={() => navigate("/orders")}
          >
            CONTINUE WITHOUT ACCOUNT
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
