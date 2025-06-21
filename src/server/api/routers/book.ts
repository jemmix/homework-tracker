import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { books, units, tasks, taskParts } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const bookRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.books.findMany({
      where: (book, { eq }) => eq(book.userId, ctx.session.user.id),
      orderBy: (book, { desc }) => [desc(book.createdAt)],
    });
  }),
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.query.books.findFirst({
        where: (book, { eq }) => eq(book.id, Number(input.id)),
      });
      if (!book) return null;
      const bookUnits = await ctx.db.query.units.findMany({
        where: (unit, { eq }) => eq(unit.bookId, book.id),
        orderBy: (unit, { asc }) => [asc(unit.number)],
      });
      return { ...book, units: bookUnits };
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        units: z.array(z.object({ number: z.number(), title: z.string().min(1) })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [book] = await ctx.db
        .insert(books)
        .values({
          title: input.title,
          userId: ctx.session.user.id,
        })
        .returning();
      if (book && input.units.length > 0) {
        await ctx.db.insert(units).values(
          input.units.map((u) => ({
            bookId: book.id,
            number: u.number,
            title: u.title,
          }))
        );
      }
      return book;
    }),
  progress: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const book = await ctx.db.query.books.findFirst({
        where: (book, { eq }) => eq(book.id, Number(input.id)),
      });
      if (!book) return null;
      const bookUnits = await ctx.db.query.units.findMany({
        where: (unit, { eq }) => eq(unit.bookId, book.id),
        orderBy: (unit, { asc }) => [asc(unit.number)],
      });
      const unitIds = bookUnits.map((u) => u.id);
      const allTasks = unitIds.length
        ? await ctx.db.query.tasks.findMany({
            where: (task, { inArray }) => inArray(task.unitId, unitIds),
            orderBy: (task, { asc }) => [asc(task.unitId), asc(task.number)],
          })
        : [];
      const taskIds = allTasks.map((t) => t.id);
      const allParts = taskIds.length
        ? await ctx.db.query.taskParts.findMany({
            where: (part, { inArray }) => inArray(part.taskId, taskIds),
            orderBy: (part, { asc }) => [asc(part.taskId), asc(part.letter)],
          })
        : [];
      return {
        ...book,
        units: bookUnits.map((unit) => ({
          ...unit,
          tasks: allTasks
            .filter((t) => t.unitId === unit.id)
            .map((task) => ({
              ...task,
              parts: allParts.filter((p) => p.taskId === task.id),
            })),
        })),
      };
    }),
  addTask: protectedProcedure
    .input(z.object({ unitId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Find the next task number for this unit
      const lastTask = await ctx.db.query.tasks.findFirst({
        where: (task, { eq }) => eq(task.unitId, input.unitId),
        orderBy: (task, { desc }) => [desc(task.number)],
      });
      const nextNumber = lastTask ? lastTask.number + 1 : 1;
      const [task] = await ctx.db
        .insert(tasks)
        .values({ unitId: input.unitId, number: nextNumber })
        .returning();
      return task;
    }),
  splitTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Add two parts a, b if not already split
      const parts = await ctx.db.query.taskParts.findMany({
        where: (part, { eq }) => eq(part.taskId, input.id),
      });
      if (parts.length === 0) {
        await ctx.db.insert(taskParts).values([
          { taskId: input.id, letter: "a" },
          { taskId: input.id, letter: "b" },
        ]);
      }
      return true;
    }),
  toggleTask: protectedProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(tasks)
        .set({ completed: input.completed })
        .where(eq(tasks.id, input.id));
      return true;
    }),
  togglePart: protectedProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(taskParts)
        .set({ completed: input.completed })
        .where(eq(taskParts.id, input.id));
      return true;
    }),
  removeTask: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Remove all parts for this task
      await ctx.db.delete(taskParts).where(eq(taskParts.taskId, input.id));
      // Remove the task itself
      await ctx.db.delete(tasks).where(eq(tasks.id, input.id));
      return true;
    }),
  addPart: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Find next letter
      const parts = await ctx.db.query.taskParts.findMany({
        where: (part, { eq }) => eq(part.taskId, input.taskId),
        orderBy: (part, { asc }) => [asc(part.letter)],
      });
      let nextLetter = "a";
      if (parts.length > 0) {
        const lastLetter = parts[parts.length - 1]?.letter;
        nextLetter = String.fromCharCode((lastLetter ? lastLetter.charCodeAt(0) : 96) + 1);
      }
      const [part] = await ctx.db
        .insert(taskParts)
        .values({ taskId: input.taskId, letter: nextLetter })
        .returning();
      return part;
    }),
  removePart: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(taskParts).where(eq(taskParts.id, input.id));
      return true;
    }),
  undoSplit: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Remove all parts for this task
      await ctx.db.delete(taskParts).where(eq(taskParts.taskId, input.id));
      return true;
    }),
});
