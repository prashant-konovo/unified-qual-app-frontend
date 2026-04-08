import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const { priority, fill, ...rest } = props as Record<string, unknown>;
    return <img {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)} />;
  },
}));
