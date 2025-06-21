"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../trpc/react";
import { Loader2 } from "lucide-react";

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
      // If editing, include unit ids if present
      const unitsWithIds: UnitWithId[] = (getBook.data?.units ?? []).map((u: UnitWithId) => ({ id: u.id, number: u.number, title: u.title }));
      // Merge ids into units array
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
      <Card className="p-6 max-w-lg mx-auto mt-8 text-center">
        <span className="inline-flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin w-5 h-5" /> Loading...</span>
      </Card>
    );
  }
  if (bookId && !getBook.data) {
    return (
      <Card className="p-6 max-w-lg mx-auto mt-8 text-center">
        <span className="text-red-500">Book not found or you do not have access.</span>
      </Card>
    );
  }

  return (
    <Card className="p-6 max-w-lg mx-auto mt-8">
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-bold mb-4">{bookId ? "Edit Book" : "Create Book"}</h2>
        <Input
          placeholder="Book Title"
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
          className="mb-4"
          required
        />
        <div className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            id="archived"
            checked={archived}
            onChange={e => setArchived(e.target.checked)}
          />
          <label htmlFor="archived" className="select-none cursor-pointer">Archived</label>
        </div>
        <div className="mb-4">
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Unit Title"
              value={unitTitle}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnitTitle(e.target.value)}
            />
            <Input
              type="number"
              min={1}
              value={unitNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUnitNumber(Number(e.target.value))}
              className="w-20"
            />
            <Button type="button" onClick={addUnit} disabled={!unitTitle}>
              Add Unit
            </Button>
          </div>
          <ul>
            {units.map((unit, idx) => (
              <li key={idx} className="flex items-center gap-2 mb-1">
                <span className="font-mono">{unit.number}.</span>
                <Input
                  value={unit.title}
                  onChange={e => handleUnitTitleChange(idx, e.target.value)}
                  className="w-48"
                  required
                />
                <Button type="button" size="sm" variant="destructive" onClick={() => removeUnit(idx)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <Button type="submit" className="w-full" disabled={createBook.isPending || updateBook.isPending}>
          {(createBook.isPending || updateBook.isPending) ? "Saving..." : bookId ? "Save Changes" : "Save Book"}
        </Button>
      </form>
    </Card>
  );
}
