export const url = (path: string | undefined) => {
  if (path === undefined) return undefined;
  return `${import.meta.env.BASE_URL}${path}`;
};
