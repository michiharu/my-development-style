export const url = (path: string | undefined) => {
  if (path === undefined) return undefined;
  if (path === '/') return import.meta.env.BASE_URL;
  return `${import.meta.env.BASE_URL}${path}`;
};
