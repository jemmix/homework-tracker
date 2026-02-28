"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../components/ui/accordion";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Button } from "../../../../components/ui/button";
import { useState, useCallback } from "react";
import { Loader2, Check, Plus, Trash2, Scissors, Undo2 } from "lucide-react";
import { Progress } from "../../../../components/ui/progress";
import { api } from "../../../../trpc/react";

interface TaskPart {
  id: number;
  letter: string;
  completed: boolean;
}

interface Task {
  id: number;
  unitId: number;
  number: number;
  completed: boolean;
  parts: TaskPart[];
}

interface Unit {
  id: number;
  number: number;
  title: string;
  expanded: boolean;
  tasks: Task[];
}

export interface BookData {
  id: number;
  title: string;
  units: Unit[];
}

// ─── Individual part row ────────────────────────────────────────────

function PartItem({
  part,
  onToggle,
  onRemove,
}: {
  part: TaskPart;
  onToggle: (partId: number, newCompleted: boolean) => Promise<void>;
  onRemove: (partId: number) => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);
  const [removing, setRemoving] = useState(false);

  return (
    <li className="flex items-center gap-1.5">
      <div className="flex items-center w-7 shrink-0">
        <Checkbox
          id={`part-${part.id}`}
          checked={part.completed}
          onCheckedChange={async () => {
            setToggling(true);
            await onToggle(part.id, !part.completed);
            setToggling(false);
          }}
          disabled={removing}
          className="size-4"
        />
        <span className="w-3 flex items-center justify-center ml-0.5">
          {toggling && <Loader2 className="animate-spin size-2.5 text-muted-foreground" />}
        </span>
      </div>
      <label
        htmlFor={`part-${part.id}`}
        className={`cursor-pointer select-none text-xs font-medium transition-colors ${part.completed ? 'text-sage' : 'text-foreground'}`}
      >
        {part.letter}
      </label>
      <Button
        size="icon"
        variant="ghost"
        className="size-5 text-destructive/40 hover:text-destructive"
        title="Remove Part"
        onClick={async () => {
          setRemoving(true);
          await onRemove(part.id);
        }}
        disabled={removing}
      >
        {removing ? <Loader2 className="animate-spin size-3" /> : <Trash2 className="size-3" />}
      </Button>
    </li>
  );
}

// ─── Individual task row ────────────────────────────────────────────

function TaskRow({
  task,
  onToggleTask,
  onTogglePart,
  onSplit,
  onUndoSplit,
  onRemoveTask,
  onAddPart,
  onRemovePart,
}: {
  task: Task;
  onToggleTask: (taskId: number, newCompleted: boolean) => Promise<void>;
  onTogglePart: (partId: number, newCompleted: boolean) => Promise<void>;
  onSplit: (taskId: number) => Promise<void>;
  onUndoSplit: (taskId: number) => Promise<void>;
  onRemoveTask: (taskId: number) => Promise<void>;
  onAddPart: (taskId: number) => Promise<void>;
  onRemovePart: (partId: number) => Promise<void>;
}) {
  const [toggling, setToggling] = useState(false);
  const [splitting, setSplitting] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [addingPart, setAddingPart] = useState(false);

  const isSplit = task.parts.length > 0;
  const taskChecked = isSplit
    ? task.parts.every((p) => p.completed)
    : task.completed;
  const structuralBusy = splitting || undoing || removing;

  return (
    <li className="flex flex-col gap-1">
      <div className={`flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-colors ${taskChecked ? 'bg-sage-light/40' : 'hover:bg-secondary/50'}`}>
        <div className="flex items-center w-9 shrink-0">
          <Checkbox
            id={`task-${task.id}`}
            checked={taskChecked}
            onCheckedChange={async () => {
              setToggling(true);
              if (isSplit) {
                const newVal = !taskChecked;
                await Promise.all(task.parts.map((p) => onTogglePart(p.id, newVal)));
              } else {
                await onToggleTask(task.id, !task.completed);
              }
              setToggling(false);
            }}
            disabled={structuralBusy}
          />
          <span className="w-4 flex items-center justify-center ml-0.5">
            {toggling && <Loader2 className="animate-spin size-3 text-muted-foreground" />}
          </span>
        </div>
        <label
          htmlFor={`task-${task.id}`}
          className={`cursor-pointer select-none text-sm font-medium transition-colors ${taskChecked ? 'text-sage' : 'text-foreground'}`}
        >
          {task.number}
        </label>
        <div className="flex items-center gap-0.5 ml-auto">
          {isSplit ? (
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Undo Split"
              onClick={async () => { setUndoing(true); await onUndoSplit(task.id); setUndoing(false); }}
              disabled={structuralBusy}
            >
              {undoing ? <Loader2 className="animate-spin size-3.5" /> : <Undo2 className="size-3.5" />}
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground hover:text-primary"
              title="Split"
              onClick={async () => { setSplitting(true); await onSplit(task.id); setSplitting(false); }}
              disabled={structuralBusy}
            >
              {splitting ? <Loader2 className="animate-spin size-3.5" /> : <Scissors className="size-3.5" />}
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-destructive/50 hover:text-destructive"
            title="Remove Task"
            onClick={async () => { setRemoving(true); await onRemoveTask(task.id); }}
            disabled={structuralBusy}
          >
            {removing ? <Loader2 className="animate-spin size-3.5" /> : <Trash2 className="size-3.5" />}
          </Button>
        </div>
      </div>
      {isSplit && (
        <ul className="ml-9 flex flex-wrap gap-x-4 gap-y-1.5 py-1">
          {task.parts.map((part) => (
            <PartItem
              key={part.id}
              part={part}
              onToggle={onTogglePart}
              onRemove={onRemovePart}
            />
          ))}
          <li>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-muted-foreground hover:text-primary"
              onClick={async () => { setAddingPart(true); await onAddPart(task.id); setAddingPart(false); }}
              disabled={addingPart}
            >
              {addingPart ? <Loader2 className="animate-spin size-3" /> : <Plus className="size-3" />}
              Add Part
            </Button>
          </li>
        </ul>
      )}
    </li>
  );
}

// ─── Add Task button ────────────────────────────────────────────────

function AddTaskButton({ unitId, onAdd }: { unitId: number; onAdd: (unitId: number) => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => { setAdding(true); await onAdd(unitId); setAdding(false); }}
      disabled={adding}
      className="text-xs"
    >
      {adding ? <Loader2 className="animate-spin size-3.5" /> : <Plus className="size-3.5" />}
      Add Task
    </Button>
  );
}

// ─── Main client component ──────────────────────────────────────────

export default function ProgressClient({ initialBook }: { initialBook: BookData }) {
  const [book, setBook] = useState<BookData>(initialBook);

  // Mutations
  const toggleTaskMut = api.book.toggleTask.useMutation();
  const togglePartMut = api.book.togglePart.useMutation();
  const addTaskMut = api.book.addTask.useMutation();
  const splitTaskMut = api.book.splitTask.useMutation();
  const removeTaskMut = api.book.removeTask.useMutation();
  const addPartMut = api.book.addPart.useMutation();
  const removePartMut = api.book.removePart.useMutation();
  const undoSplitMut = api.book.undoSplit.useMutation();
  const setUnitExpandedMut = api.book.setUnitExpanded.useMutation();

  // ── Accordion expanded state ─────────────────────────────────────

  const expandedValue = book.units.filter((u) => u.expanded).map((u) => u.id.toString());

  const handleAccordionChange = useCallback(
    (newValue: string[]) => {
      const newSet = new Set(newValue);
      for (const unit of book.units) {
        const wasExpanded = unit.expanded;
        const isExpanded = newSet.has(unit.id.toString());
        if (wasExpanded !== isExpanded) {
          setUnitExpandedMut.mutate({ unitId: unit.id, expanded: isExpanded });
        }
      }
      setBook((prev) => ({
        ...prev,
        units: prev.units.map((u) => ({
          ...u,
          expanded: newSet.has(u.id.toString()),
        })),
      }));
    },
    [book, setUnitExpandedMut],
  );

  // ── Local state updaters ──────────────────────────────────────────

  const updateTask = useCallback((taskId: number, updater: (t: Task) => Task) => {
    setBook((prev) => ({
      ...prev,
      units: prev.units.map((u) => ({
        ...u,
        tasks: u.tasks.map((t) => t.id === taskId ? updater(t) : t),
      })),
    }));
  }, []);

  const updatePart = useCallback((partId: number, updater: (p: TaskPart) => TaskPart) => {
    setBook((prev) => ({
      ...prev,
      units: prev.units.map((u) => ({
        ...u,
        tasks: u.tasks.map((t) => ({
          ...t,
          parts: t.parts.map((p) => p.id === partId ? updater(p) : p),
        })),
      })),
    }));
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────

  const handleToggleTask = useCallback(async (taskId: number, newCompleted: boolean) => {
    updateTask(taskId, (t) => ({ ...t, completed: newCompleted }));
    await toggleTaskMut.mutateAsync({ id: taskId, completed: newCompleted });
  }, [updateTask, toggleTaskMut]);

  const handleTogglePart = useCallback(async (partId: number, newCompleted: boolean) => {
    updatePart(partId, (p) => ({ ...p, completed: newCompleted }));
    await togglePartMut.mutateAsync({ id: partId, completed: newCompleted });
  }, [updatePart, togglePartMut]);

  const handleAddTask = useCallback(async (unitId: number) => {
    const newTask = await addTaskMut.mutateAsync({ unitId });
    if (!newTask) return;
    setBook((prev) => ({
      ...prev,
      units: prev.units.map((u) =>
        u.id === unitId
          ? { ...u, tasks: [...u.tasks, { ...newTask, parts: [] }] }
          : u
      ),
    }));
  }, [addTaskMut]);

  const handleRemoveTask = useCallback(async (taskId: number) => {
    await removeTaskMut.mutateAsync({ id: taskId });
    setBook((prev) => ({
      ...prev,
      units: prev.units.map((u) => ({
        ...u,
        tasks: u.tasks.filter((t) => t.id !== taskId),
      })),
    }));
  }, [removeTaskMut]);

  const handleSplit = useCallback(async (taskId: number) => {
    const parts = await splitTaskMut.mutateAsync({ id: taskId });
    updateTask(taskId, (t) => ({
      ...t,
      parts: parts.map((p) => ({ id: p.id, letter: p.letter ?? "", completed: p.completed })),
    }));
  }, [splitTaskMut, updateTask]);

  const handleUndoSplit = useCallback(async (taskId: number) => {
    await undoSplitMut.mutateAsync({ id: taskId });
    updateTask(taskId, (t) => ({ ...t, parts: [], completed: false }));
  }, [undoSplitMut, updateTask]);

  const handleAddPart = useCallback(async (taskId: number) => {
    const newPart = await addPartMut.mutateAsync({ taskId });
    if (!newPart) return;
    updateTask(taskId, (t) => ({
      ...t,
      parts: [...t.parts, { id: newPart.id, letter: newPart.letter ?? "", completed: newPart.completed }],
    }));
  }, [addPartMut, updateTask]);

  const handleRemovePart = useCallback(async (partId: number) => {
    const result = await removePartMut.mutateAsync({ id: partId });
    updateTask(result.taskId, (t) => ({
      ...t,
      parts: t.parts.filter((p) => p.id !== partId),
    }));
  }, [removePartMut, updateTask]);

  // ── Progress calculation ──────────────────────────────────────────

  let total = 0,
    completed = 0;
  book.units.forEach((unit) => {
    unit.tasks.forEach((task) => {
      if (task.parts.length > 0) {
        total += task.parts.length;
        completed += task.parts.filter((p) => p.completed).length;
      } else {
        total += 1;
        if (task.completed) completed += 1;
      }
    });
  });
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Render ────────────────────────────────────────────────────────

  return (
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6 flex flex-col items-center gap-1.5">
          <Progress value={percent} className="w-full" />
          <span className="text-xs font-medium text-muted-foreground tracking-wide">
            {percent}% complete
          </span>
        </div>
        <Accordion type="multiple" value={expandedValue} onValueChange={handleAccordionChange} className="space-y-1">
          {book.units.map((unit) => {
            let unitTotal = 0, unitCompleted = 0;
            unit.tasks.forEach((task) => {
              if (task.parts.length > 0) {
                unitTotal += task.parts.length;
                unitCompleted += task.parts.filter((p) => p.completed).length;
              } else {
                unitTotal += 1;
                if (task.completed) unitCompleted += 1;
              }
            });
            const unitDone = unitTotal > 0 && unitCompleted === unitTotal;
            const unitPct = unitTotal > 0 ? Math.round((unitCompleted / unitTotal) * 100) : 0;
            return (
              <AccordionItem value={unit.id.toString()} key={unit.id} className="border-b-0 rounded-xl bg-card border-2 border-border/40 mb-3 overflow-hidden">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center min-w-0 w-full gap-2">
                    <span className="inline-flex items-baseline gap-2 min-w-0 flex-1">
                      <span className="text-sm font-bold text-primary/70 shrink-0 tabular-nums">
                        {unit.number}.
                      </span>
                      <span className="truncate text-foreground font-medium text-sm">
                        {unit.title}
                      </span>
                    </span>
                    {unitDone ? (
                      <span className="flex items-center justify-center size-6 rounded-full bg-sage-light text-sage shrink-0" title="All done!">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="flex items-center justify-center h-6 text-xs font-medium text-muted-foreground bg-secondary px-2 rounded-full shrink-0">
                        {unitPct}%
                      </span>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <ul className="space-y-1.5">
                    {unit.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onToggleTask={handleToggleTask}
                        onTogglePart={handleTogglePart}
                        onSplit={handleSplit}
                        onUndoSplit={handleUndoSplit}
                        onRemoveTask={handleRemoveTask}
                        onAddPart={handleAddPart}
                        onRemovePart={handleRemovePart}
                      />
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-border/30">
                    <AddTaskButton unitId={unit.id} onAdd={handleAddTask} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </main>
  );
}
