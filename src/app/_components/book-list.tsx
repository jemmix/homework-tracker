"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../trpc/react";
import { GripVertical, Check } from "lucide-react";

interface TaskPart {
  completed: boolean;
}
interface Task {
  parts: TaskPart[];
  completed: boolean;
}
interface Unit {
  tasks: Task[];
}
interface Book {
  id: number;
  title: string;
  archived?: boolean;
  units?: Unit[];
}

function DragHandle() {
  return (
    <span className="cursor-grab pr-2 text-gray-400 hover:text-gray-600" title="Drag to reorder">
      <GripVertical className="w-5 h-5" />
    </span>
  );
}

function SortableBookItem({ book, children }: { book: Book; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="bg-white rounded shadow p-4 flex items-center justify-between relative"
    >
      <div className="flex items-center flex-1 min-w-0 gap-2">
        <div className="flex items-center h-full">
          {hydrated ? (
            <span {...attributes} {...listeners} className="flex items-center h-full"><DragHandle /></span>
          ) : (
            <span aria-hidden="true" className="flex items-center h-full"><DragHandle /></span>
          )}
        </div>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {children}
        </div>
      </div>
    </li>
  );
}

export function BookList({ books }: { books: Book[] }) {
  const [items, setItems] = useState(books.map(b => b.id));
  const reorderBooks = api.book.reorder.useMutation();
  const sensors = useSensors(useSensor(PointerSensor));

  // Keep local order in sync with prop changes
  useEffect(() => {
    setItems(books.map(b => b.id));
  }, [books]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as number);
    const newIndex = items.indexOf(over.id as number);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorderBooks.mutate({ ids: newItems });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2 mb-6">
          {items.map((id) => {
            const book = books.find((b) => b.id === id)!;
            let totalTasks = 0,
              completedTasks = 0,
              totalUnits = 0,
              completedUnits = 0;
            if (book.units) {
              totalUnits = book.units.length;
              book.units.forEach((unit: Unit) => {
                let unitTotal = 0,
                  unitCompleted = 0;
                unit.tasks.forEach((task: Task) => {
                  if (task.parts && task.parts.length > 0) {
                    unitTotal += task.parts.length;
                    unitCompleted += task.parts.filter((p: TaskPart) => p.completed).length;
                  } else {
                    unitTotal += 1;
                    if (task.completed) unitCompleted += 1;
                  }
                });
                totalTasks += unitTotal;
                completedTasks += unitCompleted;
                if (unitTotal > 0 && unitCompleted === unitTotal) completedUnits += 1;
              });
            }
            const allDone = totalUnits > 0 && completedUnits === totalUnits;
            return (
              <SortableBookItem key={book.id} book={book}>
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="truncate font-medium">{book.title}</span>
                  {allDone && (
                    <span className="text-green-600" title="All units complete!">
                      <Check className="w-5 h-5 inline-block align-middle" />
                    </span>
                  )}
                  <span className="text-xs text-gray-500 ml-2 shrink-0">
                    ({completedTasks}/{totalTasks} tasks, {completedUnits}/{totalUnits} units)
                  </span>
                </div>
                <span className="flex gap-4 ml-4 shrink-0 items-center justify-end">
                  <Link
                    href={`/books/${book.id}/progress`}
                    className="text-blue-600 hover:underline"
                  >
                    Open
                  </Link>
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="text-gray-600 hover:underline"
                  >
                    Edit
                  </Link>
                </span>
                {/* Progress bar */}
                <span
                  className="absolute left-4 right-4 bottom-2 h-1 rounded bg-gray-200 overflow-hidden"
                  aria-hidden="true"
                  style={{ pointerEvents: 'none' }}
                >
                  <span
                    className="block h-full bg-green-500 transition-all duration-300"
                    style={{ width: totalTasks > 0 ? `${(completedTasks / totalTasks) * 100}%` : 0 }}
                  />
                </span>
              </SortableBookItem>
            );
          })}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
