"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSRExamplePage = exports.getServerSideProps = void 0;
const helperFunction_1 = require("@/lib/helperFunction");
const next_1 = require("next");
const src_1 = require("../../../../../src");
/**
 * Example of a Next.js page that uses getServerSideProps with metadata logging on the server.
 *
 * Because of metadataRequestWrapper we don't have to manually pass down metadata to invoked functions.
 */
exports.getServerSideProps = (0, src_1.metadataRequestWrapper)(async (context) => {
    const id = context.params?.id;
    if (typeof id !== "string") {
        return {
            notFound: true,
        };
    }
    // Call some function that uses logging. Don't need to pass metadata down.
    const someProp = (0, helperFunction_1.calculateSomeProp)(id);
    return {
        props: { someProp },
    };
});
const SSRExamplePage = ({ someProp }) => {
    return (<div>
      <h1>SSR Example Page</h1>
      <p>Some Prop: {someProp}</p>
    </div>);
};
exports.SSRExamplePage = SSRExamplePage;
exports.default = exports.SSRExamplePage;
//# sourceMappingURL=%5Bid%5D.js.map