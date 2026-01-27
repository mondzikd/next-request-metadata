import { InferGetServerSidePropsType, NextPage } from "next";
type SSRExamplePageProps = {
    someProp: string;
};
/**
 * Example of a Next.js page that uses getServerSideProps with metadata logging on the server.
 *
 * Because of metadataRequestWrapper we don't have to manually pass down metadata to invoked functions.
 */
export declare const getServerSideProps: import("next").GetServerSideProps<SSRExamplePageProps>;
export declare const SSRExamplePage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>>;
export default SSRExamplePage;
//# sourceMappingURL=%5Bid%5D.d.ts.map