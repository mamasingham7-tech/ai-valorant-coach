import { useState, useEffect } from 'react';
import { getLinkedAccount, type LinkedAccount } from '@/lib/api';

export function useLinkedAccount() {
  const [linked, setLinked] = useState<LinkedAccount | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setLinked(getLinkedAccount());
  }, []);

  return { linked, setLinked, isMounted };
}
