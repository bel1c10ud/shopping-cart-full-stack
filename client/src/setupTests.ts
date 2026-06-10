import '@testing-library/jest-dom/vitest';
import { queryCache } from './hooks/useQueryCache';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  queryCache.clear();
});
afterAll(() => server.close());
