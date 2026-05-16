"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    setLoading(true);
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast({ title: 'Login Error', description: error.message, variant: 'destructive' });
      else {
        toast({ title: 'Welcome back!' });
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({ 
        email, 
        options: {
          shouldCreateUser: true,
        }
      });
      if (error) toast({ title: 'Signup Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Check your email for the login link!' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background/80 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Sign In' : 'Sign Up with OTP'}</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Enter your credentials.' : 'Enter your email to receive an OTP.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {isLogin && <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />}
        </div>
        <DialogFooter className="flex flex-col gap-2">
          <Button onClick={handleAuth} disabled={loading}>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Send OTP')}</Button>
          <Button variant="ghost" onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
