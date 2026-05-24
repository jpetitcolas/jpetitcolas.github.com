import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const tags = z.union([
  z.array(z.string()),
  z.string().transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean)),
]);

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
    illustration: z.string().optional(),
    illustration_thumbnail: z.string().optional(),
    illustration_title: z.string().optional(),
    illustration_link: z.string().optional(),
    illustration_author: z.string().optional(),
    unsplash_account: z.string().optional(),
    canonical: z.string().optional(),
    tags: tags.optional(),
    layout: z.string().optional(),
  }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/talks' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    event: z.string(),
    location: z.string(),
    layout: z.string().optional(),
  }),
});

export const collections = { posts, talks };
