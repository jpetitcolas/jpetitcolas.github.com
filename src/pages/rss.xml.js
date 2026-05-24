import rss from '@astrojs/rss';
import { getSortedPosts, parsePostId } from '../lib/posts';

export async function GET(context) {
  const posts = await getSortedPosts();
  return rss({
    title: 'Jonathan Petitcolas - Web developer and open-source aficionado',
    description: 'Personal blog of Jonathan Petitcolas',
    site: context.site,
    items: posts.map((post) => {
      const { url, date } = parsePostId(post.id);
      return {
        title: post.data.title,
        description: post.data.excerpt ?? '',
        link: url,
        pubDate: date,
      };
    }),
  });
}
