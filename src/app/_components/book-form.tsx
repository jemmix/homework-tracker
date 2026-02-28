"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../trpc/react";
import { Loader2, Trash2, Plus } from "lucide-react";

type Unit = { number: number; title: string };
type UnitWithId = { id: number; number: number; title: string };

export interface BookFormInitialData {
  id: number;
  title: string;
  archived?: boolean;
  units: UnitWithId[];
}

interface BookFormProps {
  initialData?: BookFormInitialData;
  onSave?: () => void;
}

export default function BookForm({ initialData, onSave }: BookFormProps) {
  const bookId = initialData ? String(initialData.id) : undefined;
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [units, setUnits] = useState<Unit[]>(
    initialData?.units.map((u) => ({ number: u.number, title: u.title })) ?? []
  );
  const [unitTitle, setUnitTitle] = useState("");
  const [unitNumber, setUnitNumber] = useState(
    initialData?.units.length
      ? Math.max(...initialData.units.map((u) => u.number)) + 1
      : 1
  );
  const [archived, setArchived] = useState(initialData?.archived ?? false);
  const router = useRouter();
  const createBook = api.book.create.useMutation({
    onSuccess: () => {
      if (onSave) onSave();
      router.push("/");
    },
  });
  const updateBook = api.book.update.useMutation({
    onSuccess: () => {
      if (onSave) onSave();
      router.push("/");
    },
  });

  function addUnit() {
    setUnits([...units, { number: unitNumber, title: unitTitle }]);
    setUnitTitle("");
    setUnitNumber(unitNumber + 1);
  }

  function removeUnit(idx: number) {
    setUnits(units.filter((_, i) => i !== idx));
  }

  function handleUnitTitleChange(idx: number, newTitle: string) {
    setUnits(units.map((u, i) => i === idx ? { ...u, title: newTitle } : u));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (bookId && initialData) {
      const mergedUnits = units.map((unit, idx) => ({
        ...unit,
        id: initialData.units[idx]?.id,
      }));
      updateBook.mutate({ id: bookId, title, units: mergedUnits, archived });
    } else {
      createBook.mutate({ title, units, archived });
    }
  }

  return (
    <Card className="p-8 w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit}>
        <h2 className="font-serif text-2xl font-semibold mb-6 text-foreground">
          {bookId ? "Edit Book" : "Create Book"}
        </h2>

        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Book Title
          </label>
          <Input
            placeholder="e.g. Linear Algebra"
            value={title}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-5 flex items-center gap-2.5">
          <input
            type="checkbox"
            id="archived"
            checked={archived}
            onChange={e => setArchived(e.target.checked)}
            className="size-4 rounded border-border accent-primary cursor-pointer"
          />
          <label htmlFor="archived" className="select-none cursor-pointer text-sm text-muted-foreground">
            Archived
          </label>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Units
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Unit title"
              value={unitTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnitTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              value={unitNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnitNumber(Number(e.target.value))}
              className="w-20"
            />
            <Button type="button" variant="outline" onClick={addUnit} disabled={!unitTitle}>
              <Plus className="size-4" />
              Add
            </Button>
          </div>
          {units.length > 0 && (
            <ul className="space-y-2">
              {units.map((unit, idx) => (
                <li key={idx} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
                  <span className="text-sm font-semibold text-primary/70 w-8 shrink-0">{unit.number}.</span>
                  <Input
                    value={unit.title}
                    onChange={e => handleUnitTitleChange(idx, e.target.value)}
                    className="flex-1 h-8 text-sm border-border/50"
                    required
                  />
                  <Button type="button" size="icon" variant="ghost" onClick={() => removeUnit(idx)} className="text-destructive/60 hover:text-destructive size-8">
                    <Trash2 className="size-3.5" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={createBook.isPending || updateBook.isPending}>
          {(createBook.isPending || updateBook.isPending) ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin size-4" /> Saving...
            </span>
          ) : bookId ? "Save Changes" : "Save Book"}
        </Button>
      </form>
    </Card>
  );
}
