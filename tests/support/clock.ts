import { vi } from "vitest";

export function freezeSeoulTime(isoWithOffset: string) {
	vi.useFakeTimers({ toFake: ["Date"] });
	vi.setSystemTime(new Date(isoWithOffset));
}
