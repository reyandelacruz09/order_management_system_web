import { describe, expect, it } from "vitest";

import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₱0.00");
  });

  it("formats a whole number with two decimals", () => {
    expect(formatCurrency(200)).toBe("₱200.00");
  });

  it("formats a decimal value", () => {
    expect(formatCurrency(1234.5)).toBe("₱1234.50");
  });

  it("formats negative values", () => {
    expect(formatCurrency(-5.25)).toBe("₱-5.25");
  });

  it("rounds to the nearest centavo", () => {
    expect(formatCurrency(0.555)).toBe("₱0.56");
  });
});