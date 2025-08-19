import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTime } from '@/lib/utils';
import { motion } from 'framer-motion';

interface StopwatchProps {
  time: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

const Stopwatch: React.FC<StopwatchProps> = ({ time, isRunning, onToggle, onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 h-full p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 150 }}>
          <div className="font-mono text-7xl md:text-8xl font-bold text-primary tracking-tighter">
              {formatTime(time)}
          </div>
        </motion.div>
        <motion.div className="flex space-x-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onToggle} variant="default" size="lg" className="bg-primary hover:bg-primary/80 text-primary-foreground w-32">
                  {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                  {isRunning ? 'Pause' : 'Start'}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, rotate: -15 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={onReset} variant="outline" size="lg">
                  <RotateCcw className="h-5 w-5" />
              </Button>
            </motion.div>
        </motion.div>
    </div>
  );
};

export default Stopwatch;
