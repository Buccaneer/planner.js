enum EventType {
  Query = "query",
  SubQuery = "sub-query",
  AbortQuery = "abort-query",
  InvalidQuery = "invalid-query",

  LDFetchGet = "ldfetch-get",

  Warning = "warning",

  ConnectionPrefetch = "connection-prefetch",
  ConnectionIteratorView = "connection-iterator-view",

  ConnectionScan = "connection-scan",
  FinalReachableStops = "final-reachable-stops",
  InitialReachableStops = "initial-reachable-stops",
  AddedNewTransferProfile = "added-new-transfer-profile",

  PathNotFound = "path-not-found",
  ClustersFound = "clusters-found",

}

export default EventType;
