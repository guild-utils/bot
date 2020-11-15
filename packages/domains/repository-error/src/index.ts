export class RepositoryError<T> extends Error {
  constructor(message: string, public readonly cause: T) {
    super(message);
  }
}
