export const fillInStoryTemplate = (
  template: string,
  templateParameters: string[][]
): string => {
  let result = template;

  for (const parameters of templateParameters) {
    const [search, replace] = parameters;
    result = result.replaceAll(search, replace);
  }

  return result;
};
