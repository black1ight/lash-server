export const slugGenerate = (str: string) => {
  return str.split(' ').join('-').toLowerCase();
};
