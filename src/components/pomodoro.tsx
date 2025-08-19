
"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, Briefcase, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Todo } from '@/lib/types';

interface PomodoroProps {
  time: number;
  mode: 'work' | 'break';
  isRunning: boolean;
  workMins: number;
  breakMins: number;
  workTitle: string;
  breakTitle: string;
  sessions: number;
  streak: number;
  tasks: Todo[];
  currentTaskIndex: number;
  onCycleTask: (direction: 'next' | 'prev') => void;
  onToggle: () => void;
  onReset: () => void;
  onSettingsChange: (workMins: number, breakMins: number, workTitle: string, breakTitle: string) => void;
}

const Pomodoro: React.FC<PomodoroProps> = ({ 
  time, mode, isRunning, workMins, breakMins, workTitle, breakTitle, sessions, streak, 
  tasks, currentTaskIndex, onCycleTask, onToggle, onReset, onSettingsChange 
}) => {
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [localWorkMins, setLocalWorkMins] = useState(workMins);
  const [localBreakMins, setLocalBreakMins] = useState(breakMins);
  const [localWorkTitle, setLocalWorkTitle] = useState(workTitle);
  const [localBreakTitle, setLocalBreakTitle] = useState(breakTitle);

  useEffect(() => {
    setLocalWorkMins(workMins);
    setLocalBreakMins(breakMins);
    setLocalWorkTitle(workTitle);
    setLocalBreakTitle(breakTitle);
  }, [workMins, breakMins, workTitle, breakTitle]);

  const handleSaveSettings = () => {
    const newWork = localWorkMins > 0 ? localWorkMins : 1;
    const newBreak = localBreakMins > 0 ? localBreakMins : 1;
    onSettingsChange(newWork, newBreak, localWorkTitle, localBreakTitle);
    setSettingsOpen(false);
  };
  
  let currentTitle: string;
  if (mode === 'work') {
    if (currentTaskIndex !== -1 && tasks[currentTaskIndex]) {
      currentTitle = tasks[currentTaskIndex].text;
    } else {
      currentTitle = workTitle;
    }
  } else {
    currentTitle = breakTitle;
  }

  const canCycle = tasks.length > 0 && mode === 'work';

  return (
    <div className="flex flex-col items-center justify-between space-y-6 h-full p-6 text-center relative min-h-[350px]">
       <div className="absolute top-4 right-4">
        <Dialog open={isSettingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-background/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Timer Settings</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="work-duration" className="text-right">
                  Work
                </Label>
                <Input
                  id="work-duration"
                  type="number"
                  value={localWorkMins}
                  onChange={(e) => setLocalWorkMins(parseInt(e.target.value, 10) || 0)}
                  className="col-span-3 bg-transparent"
                  min="1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="work-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="work-title"
                  type="text"
                  value={localWorkTitle}
                  onChange={(e) => setLocalWorkTitle(e.target.value)}
                  className="col-span-3 bg-transparent"
                  placeholder="Work Session"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="break-duration" className="text-right">
                  Break
                </Label>
                <Input
                  id="break-duration"
                  type="number"
                  value={localBreakMins}
                  onChange={(e) => setLocalBreakMins(parseInt(e.target.value, 10) || 0)}
                  className="col-span-3 bg-transparent"
                  min="1"
                />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="break-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="break-title"
                  type="text"
                  value={localBreakTitle}
                  onChange={(e) => setLocalBreakTitle(e.target.value)}
                  className="col-span-3 bg-transparent"
                  placeholder="Break Session"
                />
              </div>
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveSettings}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => onCycleTask('prev')} 
            disabled={!canCycle}
            aria-label="Previous Task"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="border-foreground/20 text-foreground capitalize bg-transparent truncate max-w-xs">
                  {currentTitle}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{currentTitle}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => onCycleTask('next')} 
            disabled={!canCycle}
            aria-label="Next Task"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}>
          <div className="font-mono text-7xl md:text-8xl font-bold text-primary tracking-tighter">
            {formatTime(time)}
          </div>
        </motion.div>
        <motion.div className="flex space-x-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={onToggle} variant="default" size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground w-32">
              {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isRunning ? 'Pause' : 'Start'}
            </Button>
          </motion.div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05, rotate: -15 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="outline" size="lg">
                    <RotateCcw className="h-5 w-5" />
                    </Button>
                </motion.div>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-background/80 backdrop-blur-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Ready for a fresh start?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Resetting the timer is a great way to refocus. You've got this!
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onReset}>Reset</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>

      <motion.div 
        className="flex justify-around w-full max-w-[180px] bg-transparent border rounded-lg p-2"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.4 }}
      >
        <TooltipProvider>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Briefcase className="h-5 w-5 text-foreground/70"/>
                  <p className="text-xl font-bold text-primary">{sessions}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sessions</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 cursor-pointer">
                   <Flame className="h-5 w-5 text-foreground/70"/>
                   <p className="text-xl font-bold text-primary">{streak}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Streak</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </motion.div>
    </div>
  );
};

export default Pomodoro;
