"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletButton } from "@/components/wallet-button";
import {
  LeafIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "@/components/icons";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LeafIcon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">
                CarbonChain
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                How it Works
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

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            <LeafIcon className="h-4 w-4 mr-2" />
            Powered by Solana Blockchain
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-balance mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Carbon Credit Trading for a Sustainable Future
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto leading-relaxed">
            Mint, trade, and manage verified carbon credits on the blockchain.
            Join the revolution in environmental sustainability with
            transparent, secure, and efficient carbon credit transactions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mint">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Minting Credits
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6 bg-transparent"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,250+</div>
              <div className="text-muted-foreground">Carbon Credits Minted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary mb-2">850</div>
              <div className="text-muted-foreground">Tons CO₂ Offset</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Verification Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-balance mb-4">
              Why Choose CarbonChain?
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Built on Solana for fast, secure, and cost-effective carbon credit
              management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Verified & Secure</CardTitle>
                <CardDescription>
                  Every carbon credit is verified and secured on the Solana
                  blockchain with immutable records
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUpIcon className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Real-time Trading</CardTitle>
                <CardDescription>
                  Trade carbon credits instantly with low fees and fast
                  settlement times on Solana
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <LeafIcon className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Environmental Impact</CardTitle>
                <CardDescription>
                  Track your environmental impact with detailed analytics and
                  certificate generation
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-balance mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Simple steps to start trading carbon credits on the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Solana wallet to start minting and trading carbon
                credits
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4">Mint Credits</h3>
              <p className="text-muted-foreground">
                Create verified carbon credits with certificate numbers and CO₂
                amounts
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4">Trade & Transfer</h3>
              <p className="text-muted-foreground">
                Transfer credits to other wallets or trade them on the
                marketplace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-balance mb-6">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Join thousands of users already trading carbon credits on
            CarbonChain
          </p>
          <Link href="/mint">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Now
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <LeafIcon className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">CarbonChain</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span>Built on Solana Devnet</span>
              <span>•</span>
              <span>Hackathon Project</span>
              <span>•</span>
              <span>© 2024 CarbonChain</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
