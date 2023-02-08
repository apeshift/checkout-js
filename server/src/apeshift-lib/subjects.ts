export const Subjects = {
  Block: 'block',
  Mempool: 'mempool'
} as const

export type Subject = typeof Subjects[keyof typeof Subjects]
