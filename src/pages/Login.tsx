import React, { useState } from 'react';
import axios from 'axios';
import { motion } from "framer-motion";
import { Shield, Clock, Zap } from "lucide-react";

interface LoginProps {
  onLogin?: (userData: { username: string; token: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', formData);
      
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      
      // Parent component'e login başarılı bilgisini gönder
      if (onLogin) {
        onLogin(response.data);
      }
      
    } catch (error: any) {
      setError(error.response?.data?.message ?? 'Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring" as const, stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left panel - branding */}
      <div className="hidden md:flex md:w-5/12 bg-[#FAFAFA] items-center justify-center p-12">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-md">
          <motion.h1 variants={itemVariants} className="text-[36px] leading-[1.2] font-light text-gray-900 mb-6">
            Test Automation Platform for Modern Teams
          </motion.h1>
          <motion.p variants={itemVariants} className="text-gray-500 text-[17px] leading-relaxed mb-12">
            Advanced test automation platform empowering teams to create, manage, and execute automated tests efficiently. Track results and improve software quality.
          </motion.p>

          <motion.div variants={containerVariants} className="space-y-6">
            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-gray-700" />
              </div>
              <span className="text-[18px] text-gray-700">Enterprise-grade test automation</span>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-700" />
              </div>
              <span className="text-[18px] text-gray-700">Continuous test execution</span>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-gray-700" />
              </div>
              <span className="text-[18px] text-gray-700">Real-time test reporting</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right panel - login form */}
      <div className="w-full md:w-7/12 flex items-center justify-center p-6 md:p-20 bg-white">
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-[450px]">
          <motion.div variants={itemVariants} className="text-center mb-10">
            <motion.h2 variants={itemVariants} className="text-[26px] font-normal text-gray-900 mb-2">
              Sign in
            </motion.h2>
            <motion.p variants={itemVariants} className="text-[16px] text-gray-500">
              Enter your credentials to access your account
            </motion.p>
          </motion.div>          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Kullanıcı adınızı girin"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Şifrenizi girin"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <motion.div variants={itemVariants} className="mt-10 pt-6 border-t border-gray-100">
            <p className="text-[15px] text-gray-500 text-center">
              Don't have an account?{" "}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="font-normal text-gray-900 hover:text-gray-700 transition-colors"
              >
                Create an account
              </motion.a>
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-12">
            <p className="text-[14px] text-gray-400 text-center">
              By signing in, you agree to our{" "}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Terms
              </motion.a>{" "}
              and{" "}
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#"
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </motion.a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
