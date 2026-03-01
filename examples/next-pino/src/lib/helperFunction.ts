import { logger } from "./logger";
import { get } from "./network";

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

/**
 * Simulate external API call - we can use Next.js api routes for the demonstration
 */
export const fetchExternalData = async () => {
  logger.info({ msg: "This is a log before fetching external API, passing down metadata." });

  return await get("http://localhost:3000/api/hello");
};
