import { calculateSomeProp, fetchExternalData } from "@/lib/helperFunction";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { logger, logMetadataRequestWrapper } from "@/lib/logger";

type SSRExamplePageProps = {
  someProp: string;
  externalData: string;
};

/**
 * Example of a Next.js page that uses getServerSideProps with metadata logging on the server.
 *
 * Because of logMetadataRequestWrapper we don't have to manually pass down metadata to invoked functions.
 */
const originalGetServerSideProps: GetServerSideProps<
  SSRExamplePageProps
> = async (context) => {
  const id = context.params?.id;

  logger.info({ msg: `Calculating getServerSideProps for ID: ${id}` });

  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  // Call some function that uses logging. Don't need to pass metadata down.
  const someProp = calculateSomeProp(id);

  const externalData = await fetchExternalData();

  return {
    props: { someProp, externalData: externalData.someProp },
  };
};

export const getServerSideProps = logMetadataRequestWrapper(
  originalGetServerSideProps,
);

export const SSRExamplePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ someProp, externalData }) => {
  const printSomething = () => {
    logger.info({ msg: "FE test", other: "it works!", caveat: "(but in this config, it's hidden on the production)" });
  };

  return (
    <div>
      <h1>SSR Example Page</h1>
      <p>Some Prop: {someProp}</p>
      <p>External Data: {externalData}</p>
      <button onClick={printSomething}>Print Something</button>
    </div>
  );
};

export default SSRExamplePage;
