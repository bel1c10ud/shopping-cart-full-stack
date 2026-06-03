const JSDOMEnvironment = require('jest-environment-jsdom').TestEnvironment;

const nodeGlobals = {
  fetch: globalThis.fetch,
  Request: globalThis.Request,
  Response: globalThis.Response,
  Headers: globalThis.Headers,
  FormData: globalThis.FormData,
  TextEncoder: globalThis.TextEncoder,
  TextDecoder: globalThis.TextDecoder,
  BroadcastChannel: globalThis.BroadcastChannel,
  ReadableStream: globalThis.ReadableStream,
  WritableStream: globalThis.WritableStream,
  TransformStream: globalThis.TransformStream,
};

module.exports = class TestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    Object.assign(this.global, nodeGlobals);
  }
};
