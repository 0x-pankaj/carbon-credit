"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/wallet-button";
import {
  LeafIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  SendIcon,
  ArrowRightIcon,
} from "@/components/icons";
import Link from "next/link";

interface TokenHolding {
  mint: string;
  balance: number;
  certificateNumber: string;
  projectName: string;
  issueDate: string;
  status: "active" | "transferred" | "retired";
}

interface TransactionHistory {
  signature: string;
  type: "mint" | "transfer" | "receive";
  amount: number;
  timestamp: string;
  status: "confirmed" | "pending";
  counterparty?: string;
}

export default function DashboardPage() {
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();

  const [tokenHoldings, setTokenHoldings] = useState<TokenHolding[]>([]);
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCarbonCredits, setTotalCarbonCredits] = useState(0);
  const [totalCO2Offset, setTotalCO2Offset] = useState(0);

  useEffect(() => {
    const fetchUserTokens = async () => {
      if (!connected || !publicKey || !wallet) return;

      setIsLoading(true);
      try {
        const provider = new AnchorProvider(
          connection,
          wallet.adapter as any,
          {}
        );
        const carbonCreditService = new (
          await import("@/lib/program")
        ).CarbonCreditService(connection, wallet.adapter, provider);

        // Fetch user's token accounts
        // @ts-ignore
        const userTokens = await carbonCreditService.getUserTokenAccounts(
          publicKey
        );
        console.log("[v0] User tokens:", userTokens);

        // Convert to TokenHolding format
        const holdings: TokenHolding[] = userTokens.map((token, index) => ({
          mint: token.mint.toString(),
          balance: token.balance,
          certificateNumber: `CC-${token.mint.toString().slice(-6)}-${index
            .toString()
            .padStart(3, "0")}`,
          projectName: `Carbon Credit Project ${index + 1}`,
          issueDate: new Date().toISOString().split("T")[0],
          status: token.balance > 0 ? "active" : ("transferred" as const),
        }));

        setTokenHoldings(holdings);

        // Calculate totals
        const activeHoldings = holdings.filter((h) => h.status === "active");
        const totalCredits = activeHoldings.reduce(
          (sum, h) => sum + h.balance,
          0
        );
        setTotalCarbonCredits(totalCredits);
        setTotalCO2Offset(totalCredits);

        // Fetch recent transactions (simplified for demo)
        const recentTxs = await connection.getSignaturesForAddress(publicKey, {
          limit: 10,
        });
        const mockTransactions: TransactionHistory[] = recentTxs
          .slice(0, 5)
          .map((tx, index) => ({
            signature: tx.signature,
            type:
              index % 3 === 0
                ? "mint"
                : index % 3 === 1
                ? "transfer"
                : "receive",
            amount: Math.random() * 50 + 1,
            timestamp: new Date(tx.blockTime! * 1000).toISOString(),
            status:
              tx.confirmationStatus === "confirmed" ? "confirmed" : "pending",
          }));

        setTransactions(mockTransactions);
      } catch (error) {
        console.error("[v0] Error fetching user tokens:", error);
        // Fallback to mock data if there's an error
        setTokenHoldings([]);
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTokens();
  }, [connected, publicKey, wallet, connection]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
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
                href="/transfer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Transfer
              </Link>
            </nav>
            <WalletButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Portfolio Dashboard
            </Badge>
            <h1 className="text-4xl font-bold text-balance mb-4">
              Your Carbon Credit Portfolio
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
              Track your carbon credits, view transaction history, and manage
              your environmental impact
            </p>
          </div>

          {!connected ? (
            <Alert className="mb-8">
              <ShieldCheckIcon className="h-4 w-4" />
              <AlertDescription>
                Connect your Solana wallet to view your carbon credit portfolio.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Portfolio Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Credits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">
                      {totalCarbonCredits.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Carbon Credits
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-secondary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      CO₂ Offset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-secondary">
                      {totalCO2Offset.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tons CO₂
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-accent">
                      {
                        tokenHoldings.filter((h) => h.status === "active")
                          .length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Projects
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Trees Equivalent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(totalCO2Offset * 2.2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Trees Planted
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Token Holdings */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LeafIcon className="h-5 w-5 text-primary" />
                        Your Carbon Credits
                      </CardTitle>
                      <CardDescription>
                        Manage your carbon credit certificates and track their
                        status
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">
                            Loading your carbon credits...
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {tokenHoldings.map((holding, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">
                                    {holding.projectName}
                                  </h3>
                                  <p className="text-sm text-muted-foreground font-mono">
                                    {holding.certificateNumber}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    holding.status === "active"
                                      ? "default"
                                      : holding.status === "transferred"
                                      ? "secondary"
                                      : "outline"
                                  }
                                >
                                  {holding.status}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <div className="text-muted-foreground">
                                    Balance
                                  </div>
                                  <div className="font-semibold text-secondary">
                                    {holding.balance.toFixed(2)} tons CO₂
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Issue Date
                                  </div>
                                  <div className="font-semibold">
                                    {formatDate(holding.issueDate)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">
                                    Mint Address
                                  </div>
                                  <div className="font-mono text-xs">
                                    {formatAddress(holding.mint)}
                                  </div>
                                </div>
                              </div>

                              {holding.status === "active" &&
                                holding.balance > 0 && (
                                  <div className="flex gap-2 mt-4">
                                    <Link
                                      href={`/transfer?mint=${holding.mint}`}
                                    >
                                      <Button variant="outline" size="sm">
                                        <SendIcon className="h-4 w-4 mr-1" />
                                        Transfer
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                            </div>
                          ))}

                          {tokenHoldings.length === 0 && !isLoading && (
                            <div className="text-center py-8">
                              <LeafIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <h3 className="text-lg font-semibold mb-2">
                                No Carbon Credits Yet
                              </h3>
                              <p className="text-muted-foreground mb-4">
                                Start by minting your first carbon credit
                                certificate
                              </p>
                              <Link href="/mint">
                                <Button>
                                  Mint Carbon Credits
                                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link href="/mint" className="block">
                        <Button
                          className="w-full justify-start bg-transparent"
                          variant="outline"
                        >
                          <LeafIcon className="h-4 w-4 mr-2" />
                          Mint New Credits
                        </Button>
                      </Link>
                      <Link href="/transfer" className="block">
                        <Button
                          className="w-full justify-start bg-transparent"
                          variant="outline"
                        >
                          <SendIcon className="h-4 w-4 mr-2" />
                          Transfer Credits
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                      <CardDescription>
                        Your latest carbon credit transactions
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((tx, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-2 w-2 rounded-full ${
                                  tx.type === "mint"
                                    ? "bg-primary"
                                    : tx.type === "transfer"
                                    ? "bg-secondary"
                                    : "bg-accent"
                                }`}
                              />
                              <div>
                                <div className="font-semibold text-sm capitalize">
                                  {tx.type}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(tx.timestamp)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">
                                {tx.type === "transfer" ? "-" : "+"}
                                {tx.amount.toFixed(1)} tons
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {tx.status}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {transactions.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No transactions yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Environmental Impact */}
                  <Card className="border-accent/20">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUpIcon className="h-5 w-5 text-accent" />
                        Environmental Impact
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          CO₂ Offset
                        </span>
                        <span className="font-semibold text-secondary">
                          {totalCO2Offset.toFixed(1)} tons
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Equivalent Cars Off Road
                        </span>
                        <span className="font-semibold">
                          {Math.round(totalCO2Offset * 0.22)} cars/year
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Miles Driven Offset
                        </span>
                        <span className="font-semibold">
                          {(totalCO2Offset * 2400).toLocaleString()} miles
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
