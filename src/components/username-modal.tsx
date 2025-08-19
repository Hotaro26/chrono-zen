"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface UsernameModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="bg-background/80 backdrop-blur-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to ChronoZen!</DialogTitle>
          <DialogDescription>
            What should we call you?
          </DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name..."
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="bg-transparent"
            aria-label="Your Name"
          />
        </motion.div>
        <DialogFooter>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Button onClick={handleSave} disabled={!name.trim()}>
              Continue
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameModal;
