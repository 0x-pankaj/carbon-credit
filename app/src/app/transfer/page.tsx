"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/wallet-button";
import {
  LeafIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SendIcon,
} from "@/components/icons";
import { toast } from "sonner";
import Link from "next/link";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from "@solana/spl-token";

export default function TransferPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [formData, setFormData] = useState({
    mintAddress: "",
    recipientAddress: "",
    amount: "",
    memo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [transferHistory, setTransferHistory] = useState<
    Array<{
      signature: string;
      recipient: string;
      amount: number;
      timestamp: string;
      status: "success" | "pending" | "failed";
    }>
  >([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    if (
      !formData.mintAddress ||
      !formData.recipientAddress ||
      !formData.amount
    ) {
      return "Please fill in all required fields";
    }

    try {
      new PublicKey(formData.mintAddress);
      new PublicKey(formData.recipientAddress);
    } catch {
      return "Invalid wallet or mint address format";
    }

    if (Number.parseFloat(formData.amount) <= 0) {
      return "Amount must be greater than 0";
    }

    return null;
  };

  const handleTransfer = async () => {
    if (!connected || !publicKey) {
      toast(`{
        title: "Wallet not connected",
        description: "Please connect your wallet to transfer carbon credits",
        variant: "destructive",
      }`);
      return;
    }

    const validationError = validateInputs();
    if (validationError) {
      toast(`{
        title: "Invalid input",
        description: validationError,
        variant: "destructive",
      }`);
      return;
    }

    setIsLoading(true);

    try {
      const mintPublicKey = new PublicKey(formData.mintAddress);
      const recipientPublicKey = new PublicKey(formData.recipientAddress);

      // Get associated token accounts
      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        publicKey
      );
      const recipientTokenAccount = await getAssociatedTokenAddress(
        mintPublicKey,
        recipientPublicKey
      );

      const transaction = new Transaction();

      // Check if recipient token account exists, if not create it
      try {
        await getAccount(connection, recipientTokenAccount);
      } catch {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            recipientTokenAccount,
            recipientPublicKey,
            mintPublicKey
          )
        );
      }

      // Add transfer instruction
      const transferAmount =
        Number.parseFloat(formData.amount) * Math.pow(10, 6); // 6 decimals
      transaction.add(
        createTransferInstruction(
          senderTokenAccount,
          recipientTokenAccount,
          publicKey,
          transferAmount
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      // Add to transfer history
      const newTransfer = {
        signature,
        recipient: formData.recipientAddress,
        amount: Number.parseFloat(formData.amount),
        timestamp: new Date().toISOString(),
        status: "success" as const,
      };

      setTransferHistory((prev) => [newTransfer, ...prev]);

      toast(`{
        title: "Transfer successful!",
        description: ${formData.amount} carbon credits transferred successfully,
          }`);

      // Reset form
      setFormData({
        mintAddress: "",
        recipientAddress: "",
        amount: "",
        memo: "",
      });
    } catch (error) {
      console.error("Transfer error:", error);
      toast(`{
        title: "Transfer failed",
        description:
          "There was an error transferring your carbon credits. Please try again.",
        variant: "destructive",
        }`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <LeafIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                CarbonChain
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <Link
                href="/mint"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Mint
              </Link>
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
            </nav>
            <WalletButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <SendIcon className="h-4 w-4 mr-2" />
              Transfer Carbon Credits
            </Badge>
            <h1 className="text-4xl font-bold text-balance mb-4">
              Send Carbon Credits
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Transfer your carbon credits to other wallets securely on the
              Solana blockchain
            </p>
          </div>

          {!connected && (
            <Alert className="mb-8">
              <ShieldCheckIcon className="h-4 w-4" />
              <AlertDescription>
                Connect your Solana wallet to transfer carbon credits.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transfer Form */}
            <div className="lg:col-span-2">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SendIcon className="h-5 w-5 text-primary" />
                    Transfer Details
                  </CardTitle>
                  <CardDescription>
                    Enter the details for your carbon credit transfer
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="mintAddress">
                      Carbon Credit Mint Address
                    </Label>
                    <Input
                      id="mintAddress"
                      placeholder="Enter the mint address of your carbon credits"
                      value={formData.mintAddress}
                      onChange={(e) =>
                        handleInputChange("mintAddress", e.target.value)
                      }
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the mint address you received when creating the
                      carbon credits
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress">
                      Recipient Wallet Address
                    </Label>
                    <Input
                      id="recipientAddress"
                      placeholder="Enter the recipient's Solana wallet address"
                      value={formData.recipientAddress}
                      onChange={(e) =>
                        handleInputChange("recipientAddress", e.target.value)
                      }
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (tons of CO₂)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                      value={formData.amount}
                      onChange={(e) =>
                        handleInputChange("amount", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="memo">Memo (Optional)</Label>
                    <Input
                      id="memo"
                      placeholder="Add a note for this transfer"
                      value={formData.memo}
                      onChange={(e) =>
                        handleInputChange("memo", e.target.value)
                      }
                    />
                  </div>

                  <Button
                    onClick={handleTransfer}
                    disabled={!connected || isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? (
                      "Processing Transfer..."
                    ) : (
                      <>
                        Transfer Carbon Credits
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Transfer Summary & History */}
            <div className="space-y-6">
              {/* Transfer Summary */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">Transfer Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-secondary">
                      {formData.amount || "0"} tons CO₂
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Network</span>
                    <Badge variant="outline">Solana Devnet</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Est. Fee</span>
                    <span className="font-semibold">~0.00025 SOL</span>
                  </div>
                  {formData.recipientAddress && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-muted-foreground mb-1">
                        Recipient
                      </div>
                      <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                        {formData.recipientAddress}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Transfers */}
              {transferHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transfers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {transferHistory.slice(0, 3).map((transfer, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold text-sm">
                              {transfer.amount} tons
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(
                                transfer.timestamp
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge
                            variant={
                              transfer.status === "success"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {transfer.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Help Card */}
              <Card className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheckIcon className="h-5 w-5 text-accent" />
                    Transfer Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>Double-check addresses:</strong> Transfers on
                    blockchain are irreversible
                  </div>
                  <div>
                    <strong>Network fees:</strong> Small SOL fee required for
                    transaction processing
                  </div>
                  <div>
                    <strong>Confirmation time:</strong> Transfers typically
                    confirm within seconds
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
