export interface RemoteStoreResponse<T> {
  DataWasChanged: boolean | undefined;
  UnixTimestamp: number;
  Data: T;
}
