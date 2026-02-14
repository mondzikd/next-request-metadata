const fakeHandlersFactory = () => {
  const metadataRequestWrapper = (original: unknown) => {
    return original;
  };

  const getMetadata = () => {
    return {};
  };

  return { metadataRequestWrapper, getMetadata };
};

export default fakeHandlersFactory;
