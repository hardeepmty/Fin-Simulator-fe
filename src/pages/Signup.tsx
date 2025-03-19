import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, User, Phone } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    number: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/auth/signup", userData);
      toast({ title: "Signup Successful", description: "Redirecting to Login..." });
      navigate("/login");
    } catch (error) {
      toast({ title: "Signup Failed", description: "Something went wrong", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">Join CashOut</h2>
        <p className="text-gray-400 text-center mb-6">Start your financial journey today.</p>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-500" size={20} />
            <Input
              type="text"
              placeholder="Full Name"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              required
              className="pl-10 bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
            <Input
              type="email"
              placeholder="Email Address"
              value={userData.email}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
              className="pl-10 bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
            <Input
              type="password"
              placeholder="Password"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
              required
              className="pl-10 bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-500" size={20} />
            <Input
              type="text"
              placeholder="Phone Number"
              value={userData.number}
              onChange={(e) => setUserData({ ...userData, number: e.target.value })}
              required
              className="pl-10 bg-gray-700 border border-gray-600 text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold" disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        <p className="text-center mt-4 text-gray-400">
          Already have an account? <a href="/login" className="text-yellow-400 hover:text-yellow-300">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;