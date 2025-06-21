"use client";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../trpc/react";

interface BookFormProps {
  bookId?: string;
  onSave?: () => void;
}

type Unit = { number: number; title: string };

type BookWithUnits = {
  id: number;
  title: string;
  units: Unit[];
};

export default function BookForm({ bookId, onSave }: BookFormProps) {
  const [title, setTitle] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [unitTitle, setUnitTitle] = useState("");
  const [unitNumber, setUnitNumber] = useState(1);
  const router = useRouter();
  const createBook = api.book.create.useMutation({
    onSuccess: (book) => {
      if (onSave) onSave();
      router.push("/");
    },
  });
  const getBook = api.book.get.useQuery(
    { id: bookId! },
    { enabled: !!bookId }
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

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createBook.mutate({ title, units });
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
                <span>{unit.title}</span>
                <Button type="button" size="sm" variant="destructive" onClick={() => removeUnit(idx)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
        <Button type="submit" className="w-full" disabled={createBook.isPending}>
          {createBook.isPending ? "Saving..." : bookId ? "Save Changes" : "Save Book"}
        </Button>
      </form>
    </Card>
  );
}
