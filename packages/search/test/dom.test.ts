import { afterEach, describe, expect, it, vi } from "vitest";

import { debounce } from "../src/dom.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("runs once with the latest call after input settles", () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 150);

    run("v");
    run("ve");
    vi.advanceTimersByTime(149);
    run("verse");
    expect(calls).toEqual([]);

    vi.advanceTimersByTime(150);
    expect(calls).toEqual(["verse"]);
  });

  it("can flush a pending call immediately", () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 150);

    run("verse");
    run.flush();
    vi.advanceTimersByTime(500);
    expect(calls).toEqual(["verse"]);
  });

  it("can cancel a pending call", () => {
    vi.useFakeTimers();
    const calls: string[] = [];
    const run = debounce((value: string) => calls.push(value), 150);

    run("verse");
    run.cancel();
    vi.advanceTimersByTime(500);
    expect(calls).toEqual([]);
  });
});
