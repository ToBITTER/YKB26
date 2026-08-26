import type { ReactNode } from "react";
import { QetsiyahNav } from "./qetsiyah-nav";

export default function QetsiyahLayout({ children }: { children: ReactNode }) {
  return <><QetsiyahNav />{children}</>;
}
