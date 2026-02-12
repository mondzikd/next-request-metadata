const fakeHandlersFactory = (prepareMetadataDefault: any) => {
  const metadataRequestWrapper = (original: any) => {
    return original;
  };

  const getMetadata = () => {
    return {};
  };

  return { metadataRequestWrapper, getMetadata };
};

export default fakeHandlersFactory;
