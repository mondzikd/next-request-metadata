export const setup = (prepareMetadataDefault: any) => {
  const metadataRequestWrapper = (original: any, prepareMetadata?: any) => {
    return original;
  };

  const getMetadata = () => {
    return {};
  };

  return { metadataRequestWrapper, getMetadata };
};
