let counter = 0;

export const v4 = (): string => {
  counter += 1;
  return `test-uuid-${counter}`;
};
