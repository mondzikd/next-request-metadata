// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { logMetadataRequestWrapper } from "@/lib/logger";
import { calculateSomeProp } from "@/lib/helperFunction";

type Data = {
  someProp: string;
};

function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const someProp = calculateSomeProp("API handler");

  res.status(200).json({ someProp });
}

export default logMetadataRequestWrapper(handler);
