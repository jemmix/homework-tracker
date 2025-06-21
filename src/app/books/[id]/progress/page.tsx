"use client";
import { useParams } from "next/navigation";
import { api } from "../../../../trpc/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../../components/ui/accordion";
import { Checkbox } from "../../../../components/ui/checkbox";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "../../../_components/navbar";

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

export default function BookProgressPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: book, isLoading, refetch } = api.book.progress.useQuery({ id: id ?? "" });
  const addTask = api.book.addTask.useMutation({ onSuccess: () => refetch() });
  const splitTask = api.book.splitTask.useMutation({ onSuccess: () => refetch() });
  const toggleTask = api.book.toggleTask.useMutation({ onSuccess: () => refetch() });
  const togglePart = api.book.togglePart.useMutation({ onSuccess: () => refetch() });
  const removeTask = api.book.removeTask.useMutation({ onSuccess: () => refetch() });
  const addPart = api.book.addPart.useMutation({ onSuccess: () => refetch() });
  const removePart = api.book.removePart.useMutation({ onSuccess: () => refetch() });
  const undoSplit = api.book.undoSplit.useMutation({ onSuccess: () => refetch() });

  // Optimistic state for saving
  const [savingTask, setSavingTask] = useState<number | null>(null);
  const [savingPart, setSavingPart] = useState<number | null>(null);
  const [savingUnit, setSavingUnit] = useState<number | null>(null); // for addTask
  const [splittingTask, setSplittingTask] = useState<number | null>(null);
  const [undoingSplitTask, setUndoingSplitTask] = useState<number | null>(null);
  const [removingTask, setRemovingTask] = useState<number | null>(null);
  const [addingPartTask, setAddingPartTask] = useState<number | null>(null);
  const [removingPart, setRemovingPart] = useState<number | null>(null);

  // Optimistic completion state
  const [optimisticTaskState, setOptimisticTaskState] = useState<Record<number, boolean>>({});
  const [optimisticPartState, setOptimisticPartState] = useState<Record<number, boolean>>({});

  if (isLoading)
    return <div className="p-8 text-center">Loading...</div>;
  if (!book)
    return <div className="p-8 text-center">Book not found.</div>;

  // Calculate progress
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

  // Handler for toggling a task (including split tasks)
  const handleToggleTask = async (task: Task) => {
    setSavingTask(task.id);
    if (task.parts.length > 0) {
      // For split tasks, update all parts
      const newCompleted = !task.parts.every((p) => optimisticPartState[p.id] ?? p.completed);
      // Optimistically update all parts
      setOptimisticPartState((prev) => {
        const next = { ...prev };
        task.parts.forEach((part) => {
          next[part.id] = newCompleted;
        });
        return next;
      });
      await Promise.all(
        task.parts.map((part) =>
          togglePart.mutateAsync({ id: part.id, completed: newCompleted })
        )
      );
      // Clear optimistic state for these parts
      setOptimisticPartState((prev) => {
        const next = { ...prev };
        task.parts.forEach((part) => {
          delete next[part.id];
        });
        return next;
      });
    } else {
      const newCompleted = !(optimisticTaskState[task.id] ?? task.completed);
      setOptimisticTaskState((prev) => ({ ...prev, [task.id]: newCompleted }));
      await toggleTask.mutateAsync({ id: task.id, completed: newCompleted });
      setOptimisticTaskState((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
    }
    setSavingTask(null);
  };

  // Handler for toggling a part
  const handleTogglePart = async (part: TaskPart) => {
    setSavingPart(part.id);
    const newCompleted = !(optimisticPartState[part.id] ?? part.completed);
    setOptimisticPartState((prev) => ({ ...prev, [part.id]: newCompleted }));
    await togglePart.mutateAsync({ id: part.id, completed: newCompleted });
    setOptimisticPartState((prev) => {
      const next = { ...prev };
      delete next[part.id];
      return next;
    });
    setSavingPart(null);
  };

  // Handler for add task
  const handleAddTask = async (unitId: number) => {
    setSavingUnit(unitId);
    await addTask.mutateAsync({ unitId });
    setSavingUnit(null);
  };

  // Handler for split task
  const handleSplitTask = async (taskId: number) => {
    setSplittingTask(taskId);
    await splitTask.mutateAsync({ id: taskId });
    setSplittingTask(null);
  };

  // Handler for undo split
  const handleUndoSplit = async (taskId: number) => {
    setUndoingSplitTask(taskId);
    await undoSplit.mutateAsync({ id: taskId });
    setUndoingSplitTask(null);
  };

  // Handler for remove task
  const handleRemoveTask = async (taskId: number) => {
    setRemovingTask(taskId);
    await removeTask.mutateAsync({ id: taskId });
    setRemovingTask(null);
  };

  // Handler for add part
  const handleAddPart = async (taskId: number) => {
    setAddingPartTask(taskId);
    await addPart.mutateAsync({ taskId });
    setAddingPartTask(null);
  };

  // Handler for remove part
  const handleRemovePart = async (partId: number) => {
    setRemovingPart(partId);
    await removePart.mutateAsync({ id: partId });
    setRemovingPart(null);
  };

  return (
    <>
      <main className="min-h-screen bg-slate-50 pb-16 flex flex-col">
        <Navbar progress={percent} bookTitle={book.title} showLogout />
        <div className="max-w-xl mx-auto pt-8">
          <div className="w-full flex justify-center pt-8">
            <div className="w-[800px]">
              <Accordion type="multiple" className="mb-8">
                {book.units.map((unit) => (
                  <AccordionItem value={unit.id.toString()} key={unit.id}>
                    <AccordionTrigger>
                      <div className="flex items-center min-w-0 w-full gap-2">
                        <span className="font-semibold min-w-[110px]">Unit {unit.number}:</span>
                        <span className="truncate flex-1">{unit.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {unit.tasks.map((task) => {
                          // For split tasks, checked if all parts are checked (optimistically)
                          const taskChecked = task.parts.length > 0
                            ? task.parts.every((p) => optimisticPartState[p.id] ?? p.completed)
                            : optimisticTaskState[task.id] ?? task.completed;
                          return (
                            <li key={task.id} className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id={`task-${task.id}`}
                                  checked={taskChecked}
                                  onCheckedChange={() => handleToggleTask(task)}
                                  disabled={!!savingTask || !!savingPart || splittingTask === task.id || undoingSplitTask === task.id || removingTask === task.id}
                                />
                                <label htmlFor={`task-${task.id}`} className="cursor-pointer select-none flex items-center mx-1" onClick={() => handleToggleTask(task)}>
                                  {task.number}
                                </label>
                                {task.parts.length > 0 && (
                                  <span className="text-xs text-gray-500">(split)</span>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSplitTask(task.id)}
                                  disabled={!!savingTask || !!savingPart || splittingTask === task.id || undoingSplitTask === task.id || removingTask === task.id}
                                >
                                  Split
                                  {splittingTask === task.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-red-500"
                                  title="Remove Task"
                                  onClick={() => handleRemoveTask(task.id)}
                                  disabled={!!savingTask || !!savingPart || splittingTask === task.id || undoingSplitTask === task.id || removingTask === task.id}
                                >
                                  🗑️
                                  {removingTask === task.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                                </Button>
                                {task.parts.length > 0 && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    title="Undo Split"
                                    onClick={() => handleUndoSplit(task.id)}
                                    disabled={!!savingTask || !!savingPart || splittingTask === task.id || undoingSplitTask === task.id || removingTask === task.id}
                                  >
                                    ⬅️
                                    {undoingSplitTask === task.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                                  </Button>
                                )}
                                <span style={{ display: 'inline-block', width: 20, height: 20, marginLeft: 4 }}>
                                  {(savingTask === task.id || splittingTask === task.id || undoingSplitTask === task.id || removingTask === task.id) ? (
                                    <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
                                  ) : null}
                                </span>
                              </div>
                              {task.parts.length > 0 && (
                                <ul className="ml-8 flex flex-wrap gap-4">
                                  {task.parts.map((part) => {
                                    const partChecked = optimisticPartState[part.id] ?? part.completed;
                                    return (
                                      <li key={part.id} className="flex items-center gap-1">
                                        <Checkbox
                                          id={`part-${part.id}`}
                                          checked={partChecked}
                                          onCheckedChange={() => handleTogglePart(part)}
                                          disabled={!!savingTask || !!savingPart || removingPart === part.id}
                                        />
                                        <label htmlFor={`part-${part.id}`} className="cursor-pointer select-none flex items-center mx-1" onClick={() => handleTogglePart(part)}>
                                          {part.letter}
                                        </label>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="text-red-500"
                                          title="Remove Part"
                                          onClick={() => handleRemovePart(part.id)}
                                          disabled={!!savingTask || !!savingPart || removingPart === part.id}
                                        >
                                          🗑️
                                          {removingPart === part.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                                        </Button>
                                        <span style={{ display: 'inline-block', width: 20, height: 20, marginLeft: 4 }}>
                                          {(savingPart === part.id || removingPart === part.id) ? (
                                            <Loader2 className="animate-spin text-gray-400 w-4 h-4" />
                                          ) : null}
                                        </span>
                                      </li>
                                    );
                                  })}
                                  <li>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleAddPart(task.id)}
                                      disabled={!!savingTask || !!savingPart || addingPartTask === task.id}
                                    >
                                      + Add Part
                                      {addingPartTask === task.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                                    </Button>
                                  </li>
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                      <div className="mt-4 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAddTask(unit.id)}
                          disabled={!!savingTask || !!savingPart || savingUnit === unit.id}
                        >
                          + Add Task
                          {savingUnit === unit.id && <Loader2 className="animate-spin ml-1 w-4 h-4" />}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
