import { calculateSomeProp } from "@/lib/helperFunction";
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { logger, logMetadataRequestWrapper } from "@/lib/logger";

/**
 * Example of a Next.js page that uses getServerSideProps with metadata logging on the server.
 *
 * Because of logMetadataRequestWrapper we don't have to manually pass down metadata to invoked functions.
 */
// export const getServerSideProps = logMetadataRequestWrapper(async (context: GetServerSidePropsContext<{id: string}>) => {
//   const id = context.params?.id;

//   logger.info({ msg: `Received request for ID: ${id}` });

//   if (typeof id !== "string") {
//     return {
//       notFound: true,
//     };
//   }

//   // Call some function that uses logging. Don't need to pass metadata down.
//   const someProp = calculateSomeProp(id);

//   return {
//     props: { someProp },
//   };
// });

type SSRExamplePageProps = {
  someProp: string;
};

// Alternative: Using explicit typing for original getServerSideProps
const originalGetServerSideProps: GetServerSideProps<
  SSRExamplePageProps
> = async (context) => {
  const id = context.params?.id;

  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  // Call some function that uses logging. Don't need to pass metadata down.
  const someProp = calculateSomeProp(id);

  return {
    props: { someProp },
  };
};

export const getServerSideProps = logMetadataRequestWrapper(
  originalGetServerSideProps,
);

export const SSRExamplePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ someProp }) => {
  const printSomething = () => {
    logger.info({ msg: "FE test", other: "it works!" });
  };

  return (
    <div>
      <h1>SSR Example Page</h1>
      <p>Some Prop: {someProp}</p>
      <button onClick={printSomething}>Print Something</button>
    </div>
  );
};

export default SSRExamplePage;
