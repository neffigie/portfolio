import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

import { describe, expect, it, vi } from "vitest";

type Operation = "create" | "update" | "delete";
type Logger = {
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
};
type HookEvent = {
  app: { logger: () => Logger };
  next: ReturnType<typeof vi.fn>;
  record: { id: string };
};
type Handler = (event: HookEvent) => void;

function hookEvent(): HookEvent & { logs: Logger } {
  const logs = { error: vi.fn(), info: vi.fn() };
  return {
    app: { logger: () => logs },
    logs,
    next: vi.fn(),
    record: { id: "record-123" },
  };
}

async function loadHook(options: {
  webhookUrl?: string | undefined;
  send?: ReturnType<typeof vi.fn>;
}): Promise<{
  handlers: Map<Operation, Handler>;
  send: ReturnType<typeof vi.fn>;
}> {
  const handlers = new Map<Operation, Handler>();
  const send = options.send ?? vi.fn(() => ({ statusCode: 200 }));
  const register = (operation: Operation) =>
    vi.fn((handler: Handler, collection: string) => {
      expect(collection).toBe("entries");
      handlers.set(operation, handler);
    });
  const source = await readFile(
    new URL(
      "../../pocketbase/pb_hooks/amplify-publication.pb.js",
      import.meta.url,
    ),
    "utf8",
  );

  runInNewContext(source, {
    $http: { send },
    onRecordAfterCreateSuccess: register("create"),
    onRecordAfterDeleteSuccess: register("delete"),
    onRecordAfterUpdateSuccess: register("update"),
    process: {
      env: {
        AMPLIFY_BUILD_WEBHOOK_URL: options.webhookUrl,
      },
    },
  });

  return { handlers, send };
}

function runHandler(handlers: Map<Operation, Handler>, operation: Operation) {
  const current = hookEvent();
  const handler = handlers.get(operation);
  expect(handler).toBeTypeOf("function");
  expect(() => handler?.(current)).not.toThrow();
  return current;
}

function logCallsContain(logger: ReturnType<typeof vi.fn>, value: string) {
  return logger.mock.calls.flat().some((item) => String(item).includes(value));
}

describe("PocketHost Amplify publication hook", () => {
  it.each(["create", "update", "delete"] as const)(
    "continues %s and posts one build request",
    async (operation) => {
      const { handlers, send } = await loadHook({
        webhookUrl: "https://example.test/amplify-hook",
      });

      const current = runHandler(handlers, operation);

      expect(current.next).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith({
        body: "{}",
        headers: { "content-type": "application/json" },
        method: "POST",
        timeout: 10,
        url: "https://example.test/amplify-hook",
      });
      expect(current.logs.error).not.toHaveBeenCalled();
      expect(current.logs.info).toHaveBeenCalledWith(
        "Amplify publication build requested.",
        "operation",
        operation,
        "recordId",
        "record-123",
      );
    },
  );

  it.each([undefined, "   "])(
    "continues without sending when the webhook URL is %s",
    async (webhookUrl) => {
      const { handlers, send } = await loadHook({ webhookUrl });

      const current = runHandler(handlers, "update");

      expect(current.next).toHaveBeenCalledTimes(1);
      expect(send).not.toHaveBeenCalled();
      expect(current.logs.error).toHaveBeenCalledWith(
        "Amplify publication webhook is not configured.",
        "operation",
        "update",
        "recordId",
        "record-123",
      );
      expect(current.logs.info).not.toHaveBeenCalled();
    },
  );

  it("continues and hides the webhook URL when the request throws", async () => {
    const webhookUrl = "https://example.test/private-amplify-hook";
    const { handlers } = await loadHook({
      webhookUrl,
      send: vi.fn(() => {
        throw new Error(`Request to ${webhookUrl} failed`);
      }),
    });

    const current = runHandler(handlers, "create");

    expect(current.next).toHaveBeenCalledTimes(1);
    expect(current.logs.error).toHaveBeenCalledWith(
      "Amplify publication webhook could not be reached.",
      "operation",
      "create",
      "recordId",
      "record-123",
    );
    expect(logCallsContain(current.logs.error, webhookUrl)).toBe(false);
    expect(current.logs.info).not.toHaveBeenCalled();
  });

  it.each([199, 300, 500])(
    "continues and logs an unsuccessful HTTP %i response",
    async (statusCode) => {
      const webhookUrl = "https://example.test/private-amplify-hook";
      const { handlers } = await loadHook({
        webhookUrl,
        send: vi.fn(() => ({ statusCode })),
      });

      const current = runHandler(handlers, "delete");

      expect(current.next).toHaveBeenCalledTimes(1);
      expect(current.logs.error).toHaveBeenCalledWith(
        "Amplify publication webhook returned an unsuccessful response.",
        "operation",
        "delete",
        "recordId",
        "record-123",
        "statusCode",
        statusCode,
      );
      expect(logCallsContain(current.logs.error, webhookUrl)).toBe(false);
      expect(current.logs.info).not.toHaveBeenCalled();
    },
  );

  it("accepts an HTTP 204 response", async () => {
    const { handlers } = await loadHook({
      webhookUrl: "https://example.test/amplify-hook",
      send: vi.fn(() => ({ statusCode: 204 })),
    });

    const current = runHandler(handlers, "update");

    expect(current.logs.error).not.toHaveBeenCalled();
    expect(current.logs.info).toHaveBeenCalledOnce();
  });
});
