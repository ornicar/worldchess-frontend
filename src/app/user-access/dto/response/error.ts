export interface ResponseError {
  errors: Error[];
}

export interface Error {
  field: string;
  code: string;
  defaultMessage: string;
}
