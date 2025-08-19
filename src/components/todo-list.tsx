
"use client";

import React, { useState, useMemo } from 'react';
import { Plus, Trash2, Edit, Check, X, ChevronsUpDown } from 'lucide-react';
import type { Todo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  isAddTodoOpen: boolean;
  setAddTodoOpen: (isOpen: boolean) => void;
}

const todoItemVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const TodoItem = ({ todo, onToggleTodo, onSetEditingTodo, onSetDeletingTodo }: { todo: Todo, onToggleTodo: (id: string) => void, onSetEditingTodo: (todo: Todo) => void, onSetDeletingTodo: (todo: Todo) => void }) => (
  <motion.div
    layoutId={`todo-item-${todo.id}`}
    variants={todoItemVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    className="flex items-center space-x-4 p-3 rounded-lg bg-transparent border transition-all hover:bg-accent/50"
  >
    <Checkbox
      id={todo.id}
      checked={todo.completed}
      onCheckedChange={() => onToggleTodo(todo.id)}
    />
    <label
      htmlFor={todo.id}
      className={`flex-1 text-sm ${todo.completed ? 'line-through text-foreground/50' : ''}`}
    >
      {todo.text}
    </label>
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-primary" onClick={() => onSetEditingTodo(todo)}>
        <Edit className="h-4 w-4" />
      </Button>
    </motion.div>
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-destructive" onClick={() => onSetDeletingTodo(todo)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.div>
  </motion.div>
);


const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo, onEditTodo, isAddTodoOpen, setAddTodoOpen }) => {
  const { toast } = useToast();
  const [newTodoText, setNewTodoText] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

  const { pending, completed } = useMemo(() => {
    return todos.reduce<{ pending: Todo[], completed: Todo[] }>((acc, todo) => {
      if (todo.completed) {
        acc.completed.push(todo);
      } else {
        acc.pending.push(todo);
      }
      return acc;
    }, { pending: [], completed: [] });
  }, [todos]);

  const handleAddTodo = () => {
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim());
      setNewTodoText('');
      setAddTodoOpen(false);
      toast({ title: 'Task Added!', description: 'Your new task has been added successfully.' });
    }
  };

  const handleEditTodo = () => {
    if (editingTodo && editingTodo.text.trim()) {
      onEditTodo(editingTodo.id, editingTodo.text.trim());
      setEditingTodo(null);
      toast({ title: 'Task Updated!', description: 'Your task has been updated.' });
    }
  };

  const handleDeleteTodo = () => {
    if (deletingTodo) {
      onDeleteTodo(deletingTodo.id);
      setDeletingTodo(null);
      toast({ title: 'Task Deleted!', variant: 'destructive', description: 'Your task has been removed.' });
    }
  };

  return (
    <Card className="bg-transparent border h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary">To-Do List</CardTitle>
        <Dialog open={isAddTodoOpen} onOpenChange={setAddTodoOpen}>
          <DialogTrigger asChild>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </motion.div>
          </DialogTrigger>
          <DialogContent className="bg-background/80 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Add a new task</DialogTitle>
            </DialogHeader>
            <Input
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="e.g. Finish project report"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              className="bg-transparent"
              autoFocus
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddTodo}>Add Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ScrollArea className="h-96 pr-6">
          <div className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <AnimatePresence>
                {pending.length > 0 ? (
                  pending.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} onToggleTodo={onToggleTodo} onSetEditingTodo={setEditingTodo} onSetDeletingTodo={setDeletingTodo} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-10 text-foreground/50"
                  >
                    <Check className="mx-auto h-12 w-12" />
                    <p className="mt-4">You're all caught up!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {completed.length > 0 && (
              <Collapsible defaultOpen={true} className="pt-4">
                 <div className="flex items-center justify-between">
                    <Separator className="flex-1" />
                    <CollapsibleTrigger asChild>
                       <Button variant="ghost" size="sm" className="mx-4">
                          <h3 className="text-sm font-medium text-foreground/60">Completed</h3>
                          <ChevronsUpDown className="h-4 w-4 ml-2" />
                       </Button>
                    </CollapsibleTrigger>
                    <Separator className="flex-1" />
                 </div>
                <CollapsibleContent className="space-y-2 mt-4">
                  <AnimatePresence>
                    {completed.map((todo) => (
                       <TodoItem key={todo.id} todo={todo} onToggleTodo={onToggleTodo} onSetEditingTodo={setEditingTodo} onSetDeletingTodo={setDeletingTodo} />
                    ))}
                  </AnimatePresence>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTodo} onOpenChange={() => setEditingTodo(null)}>
        <DialogContent className="bg-background/80 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          <Input
            value={editingTodo?.text || ''}
            onChange={(e) => editingTodo && setEditingTodo({ ...editingTodo, text: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleEditTodo()}
            className="bg-transparent"
            autoFocus
          />
          <DialogFooter>
            <Button onClick={() => setEditingTodo(null)} variant="secondary">Cancel</Button>
            <Button onClick={handleEditTodo}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert Dialog */}
      <AlertDialog open={!!deletingTodo} onOpenChange={() => setDeletingTodo(null)}>
        <AlertDialogContent className="bg-background/80 backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTodo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TodoList;
