import { HeightProps } from "styled-system";

export interface ProgressBarProps extends HeightProps {
  value: number, 
  max?: number, 
  desc?: string, 
  counter?: string,
  variant?: Variant
}


export const variants = {
  EXPIRED: "expired",
  DEFAULT: "default",
  COMPLETED: "completed",
  ERROR: "error"
} as const;

export type Variant = typeof variants[keyof typeof variants];