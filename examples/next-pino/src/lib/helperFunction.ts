import { logger } from "./logger";

/**
 * Some function to show logging with metadata usage.
 */
export const calculateSomeProp = (id: string) => {
  logger.info({ msg: `Calculating someProp for ID: ${id}` });

  return `someValue for ID ${id}. Nested function returned: ${nestedFunction()}`;
};

/**
 * A nested function to demonstrate logging with metadata.
 */
const nestedFunction = () => {
  logger.info({ msg: "This is a log from a nested function." });

  return 123;
};
