export const getDefaultTypeContent = (type: string) => {
  switch (type) {
    case "string":
      return '""';
    case "number":
      return "0";
    case "boolean":
      return "false";
    case "object":
      return "{}";
    default:
      return "null";
  }
};
