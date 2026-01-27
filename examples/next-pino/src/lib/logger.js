"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const index_1 = require("../../../../src/index");
const enrichedWithMetadata = (msg) => {
    const metadata = (0, index_1.getMetadata)();
    return { ...metadata, ...msg };
};
/**
 * Simple console logger, that enriches the message with metadata before logging.
 */
const logger = (msg) => {
    console.log(`[LOG]: ${JSON.stringify(enrichedWithMetadata(msg))}`);
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map