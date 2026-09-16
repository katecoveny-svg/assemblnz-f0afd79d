"use client";

import type { ComponentProps } from "react";
import { DoBuilder } from "./DoBuilder";

export function DoWorkspace(props: ComponentProps<typeof DoBuilder>) {
  return <DoBuilder {...props} />;
}
