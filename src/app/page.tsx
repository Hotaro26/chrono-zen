
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import TodoList from '@/components/todo-list';
import Pomodoro from '@/components/pomodoro';
import Stopwatch from '@/components/stopwatch';
import type { Todo, CongratsMessageOutput } from '@/lib/types';
import { formatTime } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Minimize, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import AuthModal from '@/components/auth-modal';
import WelcomeModal from '@/components/welcome-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const showNotification = (title: string, options?: NotificationOptions) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: options?.body,
      icon: 'https://i.ibb.co/nNB3xmsj/title.png',
      ...options,
    });
  }
};

export default function Home() {
  const { toast } = useToast();
  
  // To-Do State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [pomodoroTaskIndex, setPomodoroTaskIndex] = useState(-1);
  const [isAddTodoOpen, setAddTodoOpen] = useState(false);


  // Pomodoro State
  const [pomodoroWorkMins, setPomodoroWorkMins] = useState(25);
  const [pomodoroBreakMins, setPomodoroBreakMins] = useState(5);
  const [pomodoroWorkTitle, setPomodoroWorkTitle] = useState('Work');
  const [pomodoroBreakTitle, setPomodoroBreakTitle] = useState('Break');
  const [pomodoroTime, setPomodoroTime] = useState(pomodoroWorkMins * 60);
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'work' | 'break'>('work');
  const [pomodoroSessions, setPomodoroSessions] = useState(0);
  const [pomodoroStreak, setPomodoroStreak] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);
  const [isBreakConfirmOpen, setIsBreakConfirmOpen] = useState(false);

  // Stopwatch State
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  
  const [activeTab, setActiveTab] = useState('pomodoro');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // User state
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [isNotificationPermissionDialogOpen, setIsNotificationPermissionDialogOpen] = useState(false);

  const pendingTodos = useMemo(() => todos.filter(t => !t.completed), [todos]);
  
  useEffect(() => {
    if (pomodoroTaskIndex >= pendingTodos.length) {
      setPomodoroTaskIndex(Math.max(0, pendingTodos.length - 1));
    }
  }, [pendingTodos.length, pomodoroTaskIndex]);
  
  const addTodo = useCallback(async (text: string) => {
    if (!user) return;
    const { data, error } = await supabase
        .from('todos')
        .insert([{ user_id: user.id, text, completed: false }])
        .select()
        .single();
    
    if (data) setTodos((prev) => [...prev, data]);
    if (error) console.error('Error adding todo:', error);
  }, [user]);

  const toggleTodo = useCallback(async (id: string) => {
    if (!user) return;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const { error } = await supabase
        .from('todos')
        .update({ completed: !todo.completed })
        .eq('id', id);
    
    if (!error) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !todo.completed } : t))
        );
        if (!todo.completed) {
            toast({ title: 'Task Completed!', description: 'Great job!' });
        }
    }
  }, [todos, user, toast]);

  const deleteTodo = useCallback(async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  }, []);

  const editTodo = useCallback(async (id: string, newText: string) => {
    const { error } = await supabase.from('todos').update({ text: newText }).eq('id', id);
    if (!error) {
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? { ...todo, text: newText } : todo))
        );
    }
  }, []);

  // Sync profile data to Supabase when it changes
  useEffect(() => {
    if (!user) return;

    const updateProfile = async () => {
      const { error } = await supabase
        .from('profiles')
        .update({
          pomodoro_sessions: pomodoroSessions,
          pomodoro_streak: pomodoroStreak,
          last_session_date: lastSessionDate,
        })
        .eq('id', user.id);

      if (error) console.error('Error syncing profile:', error);
    };

    updateProfile();
  }, [pomodoroSessions, pomodoroStreak, lastSessionDate, user]);

  // Load profile data when user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('pomodoro_sessions, pomodoro_streak, last_session_date')
        .eq('id', user.id)
        .single();

      if (data) {
        setPomodoroSessions(data.pomodoro_sessions || 0);
        setPomodoroStreak(data.pomodoro_streak || 0);
        setLastSessionDate(data.last_session_date);
      }
      if (error) console.error('Error loading profile:', error);
    };
    loadProfile();
  }, [user]);

  // Load data when user is authenticated
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('user_id', user.id);

      if (data) setTodos(data);
      if (error) console.error('Error loading todos:', error);
    };
    loadData();
  }, [user]);

  // Auth check
  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      } else {
        setIsAuthModalOpen(true);
      }
    };
    fetchSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Initial data load from localStorage (settings only)
  useEffect(() => {
    try {
      const hash = window.location.hash;
      let loadedFromUrl = false;
      if (hash) {
        const parts = hash.substring(1).split('/');
        const timerType = parts[0];
        if (timerType === 'pomodoro' && parts.length === 3) {
          const mode = parts[1] as 'work' | 'break';
          const time = parseInt(parts[2], 10);
          if ((mode === 'work' || mode === 'break') && !isNaN(time)) {
            setActiveTab('pomodoro');
            setPomodoroMode(mode);
            setPomodoroTime(time);
            setPomodoroRunning(true);
            loadedFromUrl = true;
          }
        } else if (timerType === 'stopwatch' && parts.length === 2) {
          const time = parseInt(parts[1], 10);
          if (!isNaN(time)) {
            setActiveTab('stopwatch');
            setStopwatchTime(time);
            setStopwatchRunning(true);
            loadedFromUrl = true;
          }
        }
      }
      const storedWorkMins = localStorage.getItem('chronozen-work-mins');
      if (storedWorkMins) {
        const workMins = parseInt(storedWorkMins, 10);
        setPomodoroWorkMins(workMins);
        if (pomodoroMode === 'work' && !pomodoroRunning && !loadedFromUrl) {
          setPomodoroTime(workMins * 60);
        }
      }
      const storedBreakMins = localStorage.getItem('chronozen-break-mins');
      if (storedBreakMins) {
        const parsedBreakMins = parseInt(storedBreakMins, 10);
        setPomodoroBreakMins(parsedBreakMins);
        if (pomodoroMode === 'break' && !pomodoroRunning && !loadedFromUrl) {
          setPomodoroTime(parsedBreakMins * 60);
        }
      }
      const storedWorkTitle = localStorage.getItem('chronozen-work-title');
      if (storedWorkTitle) {
        setPomodoroWorkTitle(storedWorkTitle);
      }
      const storedBreakTitle = localStorage.getItem('chronozen-break-title');
      if (storedBreakTitle) {
        setPomodoroBreakTitle(storedBreakTitle);
      }
      const storedSessions = localStorage.getItem('chronozen-sessions');
      if (storedSessions) {
        setPomodoroSessions(JSON.parse(storedSessions));
      }
      const storedStreak = localStorage.getItem('chronozen-streak');
      if (storedStreak) {
        setPomodoroStreak(JSON.parse(storedStreak));
      }
      const storedLastSession = localStorage.getItem('chronozen-last-session');
      if (storedLastSession) {
        setLastSessionDate(storedLastSession);
      }
    } catch (error) {
      console.error("Failed to load from localStorage or URL", error);
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chronozen-todos', JSON.stringify(todos));
    } catch (error) {
      console.error("Failed to save todos to localStorage", error);
    }
  }, [todos]);

  // Save timer settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('chronozen-work-mins', String(pomodoroWorkMins));
      localStorage.setItem('chronozen-break-mins', String(pomodoroBreakMins));
      localStorage.setItem('chronozen-work-title', pomodoroWorkTitle);
      localStorage.setItem('chronozen-break-title', pomodoroBreakTitle);
      localStorage.setItem('chronozen-sessions', JSON.stringify(pomodoroSessions));
      localStorage.setItem('chronozen-streak', JSON.stringify(pomodoroStreak));
      if (lastSessionDate) {
        localStorage.setItem('chronozen-last-session', lastSessionDate);
      }
    } catch (error) {
      console.error("Failed to save timer settings to localStorage", error);
    }
  }, [pomodoroWorkMins, pomodoroBreakMins, pomodoroWorkTitle, pomodoroBreakTitle, pomodoroSessions, pomodoroStreak, lastSessionDate]);


  // Pomodoro Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomodoroRunning) {
      timer = setInterval(() => {
        setPomodoroTime((prevTime) => {
          if (prevTime <= 1) {
            setPomodoroRunning(false);
            
            showNotification(pomodoroMode === 'work' ? "Work session complete!" : "Break's over!", { 
              body: pomodoroMode === 'work' ? "Time for a break." : "Time to get back to work." 
            });

            if (pomodoroMode === 'work') {
                const today = new Date().toISOString().split('T')[0];
                setPomodoroSessions(s => s + 1);

                if (lastSessionDate) {
                    const lastDate = new Date(lastSessionDate);
                    const todayDate = new Date(today);
                    const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays === 1) {
                        setPomodoroStreak(s => s + 1);
                    } else if (diffDays > 1) {
                        setPomodoroStreak(1);
                    }
                } else {
                    setPomodoroStreak(1);
                }
                setLastSessionDate(today);

                // Auto-complete task if one is selected
                if (pomodoroTaskIndex !== -1 && pendingTodos[pomodoroTaskIndex]) {
                  toggleTodo(pendingTodos[pomodoroTaskIndex].id);
                }
                
                // Open confirmation dialog to start break
                setIsBreakConfirmOpen(true);

            } else { // Break finished, switch to work
              setPomodoroMode('work');
              setPomodoroTime(pomodoroWorkMins * 60);
              toast({
                title: "Time to work!",
                description: `Starting work session.`,
              });
            }

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pomodoroRunning, pomodoroMode, pomodoroWorkMins, pomodoroBreakMins, lastSessionDate, pomodoroTaskIndex, pendingTodos, toggleTodo, toast]);
  
  // Stopwatch Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stopwatchRunning) {
      timer = setInterval(() => {
        setStopwatchTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stopwatchRunning]);

  // Document Title and URL Update Effect
  useEffect(() => {
    let title = 'ChronoZen';
    let hash = '';
    
    const pomodoroTitle = pomodoroTaskIndex !== -1 && pendingTodos[pomodoroTaskIndex] ? pendingTodos[pomodoroTaskIndex].text : (pomodoroMode === 'work' ? pomodoroWorkTitle : pomodoroBreakTitle);

    if (activeTab === 'pomodoro' && pomodoroRunning) {
      title = `${formatTime(pomodoroTime)} - ${pomodoroTitle} | ChronoZen`;
      hash = `pomodoro/${pomodoroMode}/${pomodoroTime}`;
    } else if (activeTab === 'stopwatch' && stopwatchRunning) {
      title = `${formatTime(stopwatchTime)} - Stopwatch | ChronoZen`;
      hash = `stopwatch/${stopwatchTime}`;
    } else {
      const pendingTaskCount = todos.filter(t => !t.completed).length;
      title = pendingTaskCount > 0 ? `(${pendingTaskCount}) ChronoZen` : 'ChronoZen';
    }
    
    document.title = title;

    if (hash) {
      window.history.replaceState(null, '', `#${hash}`);
    } else {
      // Clear hash if no timer is running, but preserve history state
      if(window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [pomodoroTime, pomodoroRunning, pomodoroMode, stopwatchTime, stopwatchRunning, todos, activeTab, pomodoroTaskIndex, pendingTodos, pomodoroWorkTitle, pomodoroBreakTitle]);

  
  // Pomodoro Handlers
  const togglePomodoro = useCallback(() => {
    setPomodoroRunning(prev => {
      if (!prev) {
        
        showNotification(pomodoroMode === 'work' ? 'Work session started!' : 'Break started!', { body: "Stay focused!" });
      } else {
        showNotification('Timer paused', { body: "Take a breath." });
      }
      return !prev;
    });
  }, [pomodoroMode]);
  
  const resetPomodoro = useCallback(() => {
    setPomodoroRunning(false);
    const newMode = 'work';
    setPomodoroMode(newMode);
    setPomodoroTime(pomodoroWorkMins * 60);
    showNotification('Pomodoro Reset', { body: "Ready for a new session when you are." });
  }, [pomodoroWorkMins]);

  const handleSettingsChange = useCallback((newWorkMins: number, newBreakMins: number, newWorkTitle: string, newBreakTitle: string) => {
    setPomodoroWorkMins(newWorkMins);
    setPomodoroBreakMins(newBreakMins);
    setPomodoroWorkTitle(newWorkTitle);
    setPomodoroBreakTitle(newBreakTitle);
    
    // If timer is not running, update it immediately
    if (!pomodoroRunning) {
      if (pomodoroMode === 'work') {
        setPomodoroTime(newWorkMins * 60);
      } else {
        setPomodoroTime(newBreakMins * 60);
      }
    }
    toast({ title: 'Settings Saved!', description: 'Your new timer settings have been saved.' });
  }, [pomodoroMode, pomodoroRunning, toast]);

  const handleCycleTask = (direction: 'next' | 'prev') => {
    if (pendingTodos.length === 0) return;

    if (direction === 'next') {
        setPomodoroTaskIndex(i => (i + 1) % pendingTodos.length);
    } else {
        setPomodoroTaskIndex(i => (i - 1 + pendingTodos.length) % pendingTodos.length);
    }
  };
  
  // Stopwatch Handlers
  const toggleStopwatch = useCallback(() => {
    setStopwatchRunning(prev => {
      if (!prev) {
        
        showNotification('Stopwatch started!');
      } else {
        showNotification('Stopwatch paused');
      }
      return !prev;
    });
  }, []);

  const resetStopwatch = useCallback(() => {
    setStopwatchRunning(false);
    setStopwatchTime(0);
    showNotification('Stopwatch Reset');
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const handleUsernameSave = (name: string) => {
    localStorage.setItem('chronozen-username', name);
    toast({ title: `Welcome, ${name}!`, description: "Let's get productive." });
    
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        setIsNotificationPermissionDialogOpen(true);
    } else {
        showWelcomeTour();
    }
  };

  const showWelcomeTour = () => {
    const hasTakenTour = localStorage.getItem('chronozen-tour-taken');
    if (!hasTakenTour) {
      setIsWelcomeModalOpen(true);
    }
  };
  
  const handleWelcomeEnd = () => {
    setIsWelcomeModalOpen(false);
    localStorage.setItem('chronozen-tour-taken', 'true');
  };

  const handleStartBreak = () => {
    setPomodoroMode('break');
    setPomodoroTime(pomodoroBreakMins * 60);
    setPomodoroRunning(true);
    
    showNotification("Break time!", { body: "Relax and recharge." });
    toast({
      title: "Time for a break!",
      description: `Starting break session.`,
    });
    setIsBreakConfirmOpen(false);
  };

  const handleSkipBreak = () => {
    setPomodoroMode('work');
    setPomodoroTime(pomodoroWorkMins * 60);
    setIsBreakConfirmOpen(false);
    toast({
      title: "Break skipped!",
      description: `New work session is ready when you are.`,
    });
  };

  const handleNotificationPermission = (allow: boolean) => {
    setIsNotificationPermissionDialogOpen(false);
    if (allow) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                toast({ title: "Awesome!", description: "You'll now receive timer notifications." });
            } else {
                toast({ title: "No worries!", description: "You can enable notifications in browser settings later.", variant: "destructive" });
            }
            showWelcomeTour();
        });
    } else {
        showWelcomeTour();
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ': // Spacebar
          e.preventDefault();
          if (activeTab === 'pomodoro') togglePomodoro();
          else toggleStopwatch();
          break;
        case 'r':
          if (activeTab === 'pomodoro') resetPomodoro();
          else resetStopwatch();
          break;
        case 's':
          setActiveTab(prev => prev === 'pomodoro' ? 'stopwatch' : 'pomodoro');
          break;
        case 't':
          e.preventDefault();
          setAddTodoOpen(true);
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, togglePomodoro, resetPomodoro, toggleStopwatch, resetStopwatch, toggleFullscreen]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="absolute top-4 right-4 z-50 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsShortcutsDialogOpen(true)}>
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsStatsDialogOpen(true)}>
              Statistics
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              const theme = localStorage.getItem('theme') === 'light' ? 'dark' : 'light';
              document.documentElement.classList.toggle('dark');
              localStorage.setItem('theme', theme);
            }}>
              Toggle Theme
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => supabase.auth.signOut()}>
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onClick={() => setIsAuthModalOpen(true)}>
                Sign In
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-grow p-4 md:p-8 flex items-center justify-center">
        <motion.div 
          className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="w-full" variants={itemVariants}>
            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 bg-muted">
                <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
                <TabsTrigger value="stopwatch">Stopwatch</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <TabsContent value="pomodoro" forceMount={true} className={activeTab !== 'pomodoro' ? 'hidden' : ''}>
                      <Card className="bg-transparent border">
                        <CardContent className="p-6">
                          <Pomodoro 
                            time={pomodoroTime}
                            mode={pomodoroMode}
                            isRunning={pomodoroRunning}
                            workMins={pomodoroWorkMins}
                            breakMins={pomodoroBreakMins}
                            workTitle={pomodoroWorkTitle}
                            breakTitle={pomodoroBreakTitle}
                            onToggle={togglePomodoro}
                            onReset={resetPomodoro}
                            onSettingsChange={handleSettingsChange}
                            sessions={pomodoroSessions}
                            streak={pomodoroStreak}
                            tasks={pendingTodos}
                            currentTaskIndex={pomodoroTaskIndex}
                            onCycleTask={handleCycleTask}
                          />
                        </CardContent>
                      </Card>
                  </TabsContent>
                  <TabsContent value="stopwatch" forceMount={true} className={activeTab !== 'stopwatch' ? 'hidden' : ''}>
                      <Card className="bg-transparent border">
                        <CardContent className="p-6">
                          <Stopwatch 
                            time={stopwatchTime}
                            isRunning={stopwatchRunning}
                            onToggle={toggleStopwatch}
                            onReset={resetStopwatch}
                          />
                        </CardContent>
                      </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </motion.div>
          <motion.div className="w-full lg:row-span-2" variants={itemVariants}>
            <TodoList
              todos={todos}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onDeleteTodo={deleteTodo}
              onEditTodo={editTodo}
              isAddTodoOpen={isAddTodoOpen}
              setAddTodoOpen={setAddTodoOpen}
            />
          </motion.div>
        </motion.div>
      </main>

       <div className="fixed bottom-4 right-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                  {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  <span className="sr-only">Toggle Fullscreen</span>
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <WelcomeModal isOpen={isWelcomeModalOpen} onEnd={handleWelcomeEnd} />
      <Dialog open={isShortcutsDialogOpen} onOpenChange={setIsShortcutsDialogOpen}>
        <DialogContent className="bg-background/80 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 text-sm">
             <div className="flex justify-between"><span>Pause/Play Timer</span><kbd className="px-2 py-1 rounded bg-muted">SPACE</kbd></div>
             <div className="flex justify-between"><span>Reset Timer</span><kbd className="px-2 py-1 rounded bg-muted">R</kbd></div>
             <div className="flex justify-between"><span>Switch Timer</span><kbd className="px-2 py-1 rounded bg-muted">S</kbd></div>
             <div className="flex justify-between"><span>Add Task</span><kbd className="px-2 py-1 rounded bg-muted">T</kbd></div>
             <div className="flex justify-between"><span>Fullscreen</span><kbd className="px-2 py-1 rounded bg-muted">F</kbd></div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="bg-background/80 backdrop-blur-md max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Statistics</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Monthly Pomodoro Sessions</p>
                <p className="text-2xl font-bold">{pomodoroSessions}</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Monthly Tasks Completed</p>
                <p className="text-2xl font-bold">{todos.filter(t => t.completed).length}</p>
              </Card>
            </div>
            <div className="w-full h-64 overflow-hidden">
              <p className="text-sm text-muted-foreground mb-4">Activity (Last 7 Days)</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Array.from({ length: 7 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), val: Math.floor(Math.random() * 8) + 1 };
                })}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="val" fill="hsl(var(--primary))" activeBar={false} />                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isBreakConfirmOpen} onOpenChange={setIsBreakConfirmOpen}>
        <AlertDialogContent className="bg-background/80 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Great job!</AlertDialogTitle>
            <AlertDialogDescription>
              You've completed a focus session. Time for a well-deserved break?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleSkipBreak}>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartBreak}>Start Break</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isNotificationPermissionDialogOpen} onOpenChange={setIsNotificationPermissionDialogOpen}>
        <AlertDialogContent className="bg-background/80 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Stay in the loop!</AlertDialogTitle>
            <AlertDialogDescription>
              Allow notifications to get alerts for timer sessions and sound cues. It's a great way to stay on track!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleNotificationPermission(false)}>Maybe Later</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleNotificationPermission(true)}>Allow</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
