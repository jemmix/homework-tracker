import Link from "next/link";

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

export function BookList({ books }: { books: Book[] }) {
  return (
    <ul className="space-y-2 mb-6">
      {books.map((book) => {
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
          <li
            key={book.id}
            className="bg-white rounded shadow p-4 flex items-center justify-between relative"
          >
            <span className="flex items-center gap-2">
              {allDone && (
                <span className="text-green-600" title="All units complete!">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 inline-block align-middle"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 6.29a1 1 0 0 1 .006 1.414l-6.01 6.1a1 1 0 0 1-1.42-.01l-3.01-3.1a1 1 0 1 1 1.428-1.4l2.3 2.37 5.3-5.38a1 1 0 0 1 1.406.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
              {book.title}
              <span className="text-xs text-gray-500 ml-2">
                ({completedTasks}/{totalTasks} tasks, {completedUnits}/{totalUnits} units)
              </span>
            </span>
            <span className="flex gap-4">
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
          </li>
        );
      })}
    </ul>
  );
}
