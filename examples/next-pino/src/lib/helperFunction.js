"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSomeProp = void 0;
const logger_1 = require("./logger");
/**
 * Some function to show logging with metadata usage.
 */
const calculateSomeProp = (id) => {
    (0, logger_1.logger)({ msg: `Calculating someProp for ID: ${id}` });
    return `someValue for ID ${id}. Nested function returned: ${nestedFunction()}`;
};
exports.calculateSomeProp = calculateSomeProp;
/**
 * A nested function to demonstrate logging with metadata.
 */
const nestedFunction = () => {
    (0, logger_1.logger)({ msg: "This is a log from a nested function." });
    return 123;
};
//# sourceMappingURL=helperFunction.js.map