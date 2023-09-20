/**
 * ```typescript
 * url('/blog/') => '/my-repo/blog/'
 * url('/image.png') => '/my-repo/image.png'
 * ```
 */
export const url = (path: `/${string}` | undefined) => {
  if (path === undefined) return undefined;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};
