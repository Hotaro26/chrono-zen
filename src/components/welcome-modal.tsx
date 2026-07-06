"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ListTodo, Palette, Maximize, Keyboard, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Separator } from './ui/separator';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

interface WelcomeModalProps {
  isOpen: boolean;
  onEnd: () => void;
  onSetBackground: (url: string) => void;
  onSetBlur: (blur: boolean) => void;
  onSetColor?: (color: string) => void;
  initialBlur?: boolean;
  initialColor?: string;
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

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onEnd, onSetBackground, onSetBlur, onSetColor, initialBlur = true, initialColor = '' }) => {
  const [step, setStep] = useState(1);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const autoplayPlugin = React.useRef(Autoplay({ delay: 3000, stopOnInteraction: true, rootNode: (emblaRoot) => emblaRoot.parentElement }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' }, [autoplayPlugin.current]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [localBlur, setLocalBlur] = useState(initialBlur);
  const [localColor, setLocalColor] = useState(initialColor);

  const handleApplyBlur = (blur: boolean) => {
    setLocalBlur(blur);
    onSetBlur(blur);
  };

  const handleApplyColor = (color: string) => {
    setLocalColor(color);
    if (onSetColor) onSetColor(color);
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      fetch('/api/backgrounds').then(res => res.json()).then(data => setBackgrounds(data)).catch(() => setBackgrounds([]));
    }
  }, [isOpen]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    // If a new slide is selected via swiping, apply it automatically
    if (backgrounds.length > 0 && emblaApi) {
        onSetBackground(backgrounds[selectedIndex]);
    }
  }, [selectedIndex, backgrounds, onSetBackground, emblaApi]);

  const handleApplyBackground = (url: string) => {
    onSetBackground(url);
  };

  const scrollPrev = useCallback(() => { if (emblaApi) emblaApi.scrollPrev(); }, [emblaApi]);
  const scrollNext = useCallback(() => { if (emblaApi) emblaApi.scrollNext(); }, [emblaApi]);

  return (
    <Dialog open={isOpen} onOpenChange={onEnd}>
      <DialogContent className="bg-background/80 backdrop-blur-md max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Welcome to ChronoZen!' : step === 2 ? 'Choose your Vibe' : step === 3 ? 'Choose UI Style' : 'Pick a Theme Color'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Here’s a quick overview of what you can do:' : step === 2 ? 'Select a relaxing background to start with, or stick to the minimal look.' : step === 3 ? 'Select how your clocks and to-do lists should look over your background.' : 'Choose a solid color for your UI cards.'}
          </DialogDescription>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
                key="step1"
                className="space-y-6 py-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
            >
                <div className="space-y-4">
                     <FeatureItem 
                        icon={<Timer className="h-5 w-5" />}
                        title="Dual Timers"
                        description="Switch between a structured Pomodoro timer and a flexible Stopwatch to match your workflow."
                    />
                     <FeatureItem 
                        icon={<ListTodo className="h-5 w-5" />}
                        title="Task Management"
                        description="Keep your focus sharp by adding, editing, and completing tasks in the integrated to-do list."
                    />
                     <FeatureItem 
                        icon={<Palette className="h-5 w-5" />}
                        title="Theme Customization"
                        description="Personalize your workspace by switching between light and dark modes."
                    />
                </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              className="py-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {backgrounds.length > 0 ? (
                <div className="w-full">
                  <div className="relative group">
                    <div className="overflow-hidden" ref={emblaRef}>
                      <div className="flex touch-pan-y h-56 -ml-4">
                        {backgrounds.map((bg, idx) => (
                          <div key={bg} className="flex-[0_0_85%] min-w-0 relative pl-4 cursor-pointer" onClick={() => { handleApplyBackground(bg); emblaApi?.scrollTo(idx); }}>
                            <div className={`w-full h-full relative transition-all duration-500 ease-out ${idx === selectedIndex ? 'scale-100 opacity-100' : 'scale-[0.85] opacity-50 hover:opacity-75'}`}>
                              <img src={bg} alt="Background" className={`w-full h-full object-cover rounded-2xl shadow-xl border-2 transition-colors duration-300 ${idx === selectedIndex ? 'border-primary ring-4 ring-primary/20 ring-offset-2 ring-offset-background' : 'border-transparent'}`} />
                              {idx === selectedIndex && (
                                <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg animate-in zoom-in duration-300">
                                  <Check className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="secondary" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-md bg-background/50 hover:bg-background/80" onClick={scrollPrev}>
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md backdrop-blur-md bg-background/50 hover:bg-background/80" onClick={scrollNext}>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="relative mt-8 mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background/80 px-2 text-muted-foreground font-semibold">Or</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-2">
                    <Button variant="secondary" className="bg-secondary/60 hover:bg-secondary border border-border/50 text-foreground shadow-sm transition-all rounded-full px-6 py-2" onClick={() => handleApplyBackground('')}>
                      Use Minimal (No Background)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-xl">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No backgrounds found in public/bg</p>
                  <Button variant="ghost" className="mt-4" onClick={() => handleApplyBackground('')}>Proceed with Minimal Theme</Button>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              className="py-6 space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="grid grid-cols-2 gap-4">
                <div 
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${localBlur ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'}`}
                    onClick={() => handleApplyBlur(true)}
                >
                    <div className="h-24 rounded-lg relative overflow-hidden flex items-center justify-center mb-3 border border-border/50">
                        {/* Background elements to blur */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                        <div className="absolute top-1 left-2 w-12 h-12 bg-blue-500 rounded-full mix-blend-screen filter blur-md opacity-70" />
                        <div className="absolute bottom-1 right-2 w-14 h-14 bg-pink-500 rounded-full mix-blend-screen filter blur-md opacity-70" />
                        
                        {/* Glass Card */}
                        <div className="relative z-10 w-4/5 h-3/4 rounded-xl bg-background/20 backdrop-blur-xl shadow-2xl border border-white/20 flex items-center justify-center">
                            <Palette className="h-6 w-6 text-primary drop-shadow-lg" />
                        </div>
                    </div>
                    <h4 className="font-semibold">Glassmorphism</h4>
                    <p className="text-xs text-muted-foreground mt-1">Frosted glass effect that blends beautifully with backgrounds.</p>
                </div>
                <div 
                    className={`cursor-pointer border-2 rounded-xl p-4 text-center transition-all ${!localBlur ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background' : 'border-transparent'}`}
                    onClick={() => handleApplyBlur(false)}
                >
                    <div className="h-24 rounded-lg relative overflow-hidden flex items-center justify-center mb-3 bg-muted/30 border border-border/50">
                        {/* Background elements */}
                        <div className="absolute top-2 left-3 w-10 h-10 bg-blue-500/80 rounded-full" />
                        <div className="absolute bottom-1 right-3 w-12 h-12 bg-pink-500/80 rounded-full" />
                        
                        {/* Solid Card */}
                        <div className="relative z-10 w-4/5 h-3/4 rounded-xl bg-card shadow-xl border border-border flex items-center justify-center">
                            <Palette className="h-6 w-6 text-muted-foreground" />
                        </div>
                    </div>
                    <h4 className="font-semibold">Solid Colors</h4>
                    <p className="text-xs text-muted-foreground mt-1">Clean, opaque cards for maximum legibility and contrast.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              className="py-6 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="flex flex-wrap justify-center gap-3">
                  {['', '#1e293b', '#0f172a', '#3f2c38', '#1a3636', '#3b2518'].map((color) => (
                    <div 
                      key={color || 'default'}
                      onClick={() => handleApplyColor(color)}
                      className={`w-12 h-12 rounded-full cursor-pointer transition-all border-2 flex items-center justify-center shadow-md ${localColor === color ? 'border-primary scale-110' : 'border-border/50 hover:scale-105'}`}
                      style={{ backgroundColor: color || 'hsl(var(--card))' }}
                    >
                      {localColor === color && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                    </div>
                  ))}
                </div>
                
                <div className="relative mt-4 mb-2 w-full">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background/80 px-2 text-muted-foreground font-semibold">Or Custom</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full justify-center">
                  <label htmlFor="custom-color" className="text-sm font-medium">Custom Color:</label>
                  <input 
                    id="custom-color" 
                    type="color" 
                    value={localColor || '#000000'}
                    onChange={(e) => handleApplyColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          {step > 1 && (
             <Button variant="outline" onClick={() => setStep(step - 1)}>Back</Button>
          )}
          {step === 1 ? (
            <Button onClick={() => setStep(2)}>Next: Choose Vibe <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : step === 2 ? (
            <Button onClick={() => setStep(3)}>Next: UI Style <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : step === 3 && !localBlur ? (
            <Button onClick={() => setStep(4)}>Next: Pick Color <ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <Button onClick={onEnd}>Finish Setup</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;
