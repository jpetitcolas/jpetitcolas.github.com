import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

const FILENAME_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)$/;

export function parsePostId(id: string) {
  const match = id.match(FILENAME_RE);
  if (!match) throw new Error(`Post id does not match YYYY-MM-DD-slug: ${id}`);
  const [, year, month, day, slug] = match;
  return {
    year,
    month,
    day,
    slug,
    date: new Date(`${year}-${month}-${day}T00:00:00Z`),
    url: `/${year}/${month}/${day}/${slug}/`,
  };
}

export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort(
    (a, b) => parsePostId(b.id).date.getTime() - parsePostId(a.id).date.getTime(),
  );
}
