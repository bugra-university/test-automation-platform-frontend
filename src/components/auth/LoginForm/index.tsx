import React, { useState } from 'react';
import { useAuth } from '../../../contexts/authContext';
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {  const { loginWithCredentials } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await loginWithCredentials(username, password);
      onSuccess?.();
    } catch (err) {
      setError("We couldn't verify your credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-[15px] rounded"
        >
          {error}
        </motion.div>
      )}

      <div className="space-y-7">        <div>          <Label htmlFor="username" className="text-[16px] font-normal text-gray-700 mb-2 block">
            Username or Email
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12 pl-11 bg-white border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 text-[16px]"
              placeholder="email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="password" className="text-[16px] font-normal text-gray-700">
              Password
            </Label>
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#"
              className="text-[15px] font-normal text-gray-500 hover:text-gray-900 transition-colors"
            >
              Forgot password?
            </motion.a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-11 bg-white border-gray-200 rounded-md focus:border-gray-400 focus:ring-0 text-[16px]"
              placeholder="••••••••"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </motion.button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-black hover:bg-gray-800 text-white font-normal rounded-md transition-all duration-200 text-[16px] disabled:opacity-90 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
              />
              <span>Signing in</span>
            </div>
          ) : (
            "Sign in"
          )}
        </Button>
      </div>
    </form>
  );
}
