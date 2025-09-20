"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export function WalletButton() {
  const { connected, publicKey } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />;
  }

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-muted-foreground">
          {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
        <WalletMultiButton className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80" />
      </div>
    );
  }

  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
  );
}
