"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../trpc/react";
import { Loader2, Trash2, Plus } from "lucide-react";

interface BookFormProps {
  bookId?: string;
  onSave?: () => void;
}

type Unit = { number: number; title: string };
type UnitWithId = { id: number; number: number; title: string };

export default function BookForm({ bookId, onSave }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTitle, setUnitTitle] = useState("");
  const [unitNumber, setUnitNumber] = useState(1);
  const [archived, setArchived] = useState(false);
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
  const getBook = api.book.get.useQuery(
    { id: bookId! },
    {
      enabled: !!bookId,
      refetchOnMount: true,
      refetchOnWindowFocus: true,
      staleTime: 0,
    }
  );

  useEffect(() => {
    if (getBook.data) {
      setTitle(getBook.data.title);
      setUnits(getBook.data.units as Unit[]);
      setUnitNumber(
        getBook.data.units.length > 0
          ? Math.max(...(getBook.data.units as Unit[]).map((u) => u.number)) + 1
          : 1
      );
      setArchived(!!getBook.data.archived);
    }
  }, [getBook.data]);

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
    if (bookId) {
      const unitsWithIds: UnitWithId[] = (getBook.data?.units ?? []).map((u: UnitWithId) => ({ id: u.id, number: u.number, title: u.title }));
      const mergedUnits = units.map((unit, idx) => ({
        ...unit,
        id: unitsWithIds[idx]?.id,
      }));
      updateBook.mutate({ id: bookId, title, units: mergedUnits, archived });
    } else {
      createBook.mutate({ title, units, archived });
    }
  }

  if (bookId && getBook.isLoading) {
    return (
      <Card className="p-8 w-full max-w-lg mx-auto text-center">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin w-5 h-5" /> Loading...
        </span>
      </Card>
    );
  }
  if (bookId && !getBook.data) {
    return (
      <Card className="p-8 w-full max-w-lg mx-auto text-center">
        <span className="text-destructive font-medium">Book not found or you do not have access.</span>
      </Card>
    );
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
