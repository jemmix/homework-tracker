import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { books, units } from "~/server/db/schema";

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
});
