'use client';

import { ReactNode } from 'react';
import { TrashProvider } from '@/contexts/TrashContext';

export function Providers({ children }: { children: ReactNode }) {
  return <TrashProvider>{children}</TrashProvider>;
}
