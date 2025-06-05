import { Test } from 'supertest';

declare module 'supertest' {
  interface Test {
    send(data: any): this;
    type(contentType: string): this;
    set(key: string, value: string): this;
    set(headers: Record<string, string>): this;
    expect(status: number): this;
    query(data: any): this;
  }
}
