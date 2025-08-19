
"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Timer, ListTodo, Palette, Maximize, Keyboard } from 'lucide-react';
import { Separator } from './ui/separator';

interface WelcomeModalProps {
  isOpen: boolean;
  onEnd: () => void;
}

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
        </div>
        <div>
            <h4 className="font-semibold text-primary">{title}</h4>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

const ShortcutItem = ({ keys, description }: { keys: string[], description: string }) => (
    <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">{description}</p>
        <div className="flex items-center space-x-1">
            {keys.map((key, index) => (
                <kbd key={index} className="px-2 py-1 text-xs font-semibold text-foreground bg-muted rounded-md border">
                    {key}
                </kbd>
            ))}
        </div>
    </div>
);


const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onEnd }) => {

  return (
    <Dialog open={isOpen} onOpenChange={onEnd}>
      <DialogContent className="bg-background/80 backdrop-blur-md max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to ChronoZen!</DialogTitle>
          <DialogDescription>
            Here’s a quick overview of what you can do:
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
            className="space-y-6 py-4"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.1 } }
            }}
        >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                 <FeatureItem 
                    icon={<Timer className="h-5 w-5" />}
                    title="Dual Timers"
                    description="Switch between a structured Pomodoro timer and a flexible Stopwatch to match your workflow."
                />
            </motion.div>
             <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                 <FeatureItem 
                    icon={<ListTodo className="h-5 w-5" />}
                    title="Task Management"
                    description="Keep your focus sharp by adding, editing, and completing tasks in the integrated to-do list."
                />
            </motion.div>
             <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                 <FeatureItem 
                    icon={<Palette className="h-5 w-5" />}
                    title="Theme Customization"
                    description="Personalize your workspace by switching between light and dark modes."
                />
            </motion.div>
             <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                 <FeatureItem 
                    icon={<Maximize className="h-5 w-5" />}
                    title="Focus Mode"
                    description="Eliminate distractions by entering fullscreen mode for complete immersion in your tasks."
                />
            </motion.div>

            <Separator />
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="space-y-4">
                <FeatureItem 
                    icon={<Keyboard className="h-5 w-5" />}
                    title="Keyboard Shortcuts"
                    description="Control the app without leaving your keyboard."
                />
                <div className="space-y-2 pl-12">
                   <ShortcutItem keys={['Space']} description="Start / Pause timer" />
                   <ShortcutItem keys={['R']} description="Reset timer" />
                   <ShortcutItem keys={['S']} description="Switch timer mode" />
                   <ShortcutItem keys={['T']} description="Add new task" />
                   <ShortcutItem keys={['F']} description="Toggle fullscreen" />
                </div>
            </motion.div>
        </motion.div>

        <DialogFooter>
          <Button onClick={onEnd}>
            Get Started
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
