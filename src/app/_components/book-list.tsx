"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "../../trpc/react";
import { GripVertical, Check, ArrowRight, Pencil } from "lucide-react";

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
    <span className="cursor-grab active:cursor-grabbing pr-1 text-warm-gray hover:text-primary transition-colors" title="Drag to reorder">
      <GripVertical className="w-4 h-4" />
    </span>
  );
}

function SortableBookItem({ book, children }: { book: Book; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: book.id });
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const subscribe = () => () => {};
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="group bg-card rounded-xl border-2 border-border/50 px-4 py-4 pb-5 flex items-center justify-between relative hover:border-primary/20 hover:shadow-md transition-all duration-200"
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
  const bookIds = books.map(b => b.id);
  const [localOrder, setLocalOrder] = useState<number[] | null>(null);
  const items = localOrder ?? bookIds;

  // Reset local order when props change (e.g. after revalidation)
  const [prevBookIds, setPrevBookIds] = useState(bookIds);
  if (JSON.stringify(prevBookIds) !== JSON.stringify(bookIds)) {
    setPrevBookIds(bookIds);
    setLocalOrder(null);
  }

  const reorderBooks = api.book.reorder.useMutation();
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.indexOf(active.id as number);
    const newIndex = items.indexOf(over.id as number);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setLocalOrder(newItems);
    reorderBooks.mutate({ ids: newItems });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3 mb-6">
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
            const progressPct = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
            return (
              <SortableBookItem key={book.id} book={book}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-serif text-base font-semibold text-foreground">{book.title}</span>
                      {allDone && (
                        <span className="flex items-center justify-center size-5 rounded-full bg-sage-light text-sage" title="All units complete!">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {completedTasks}/{totalTasks} tasks &middot; {completedUnits}/{totalUnits} units
                    </span>
                  </div>
                </div>
                <span className="flex gap-1.5 ml-4 shrink-0 items-center">
                  <Link
                    href={`/books/${book.id}/progress`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-primary/5"
                  >
                    Open
                    <ArrowRight className="size-3.5" />
                  </Link>
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-accent/60"
                  >
                    <Pencil className="size-3" />
                  </Link>
                </span>
                {/* Progress bar */}
                <span
                  className="absolute left-4 right-4 bottom-1.5 h-1 rounded-full bg-secondary overflow-hidden"
                  aria-hidden="true"
                  style={{ pointerEvents: 'none' }}
                >
                  <span
                    className="block h-full rounded-full bg-sage/70 transition-all duration-500 ease-out"
                    style={{ width: totalTasks > 0 ? `${progressPct}%` : '0%' }}
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
