import { defineCollection, z } from 'astro:content';

const urlSchema = z.custom<`/${string}`>((val) => {
  return /^\//.test(val as string);
});

const blog = defineCollection({
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Transform string to Date object
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: urlSchema.optional(),
  }),
});

export const collections = { blog };
