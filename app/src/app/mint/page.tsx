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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WalletButton } from "@/components/wallet-button";
import { CertificatePreview } from "@/components/certificate-preview";
import { LeafIcon, ArrowRightIcon, ShieldCheckIcon } from "@/components/icons";
import { toast } from "sonner";
import Link from "next/link";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createInitializeMintInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";

export default function MintPage() {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [formData, setFormData] = useState({
    certificateNumber: "",
    carbonAmount: "",
    projectName: "",
    projectDescription: "",
    verificationStandard: "VCS",
    location: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mintAddress, setMintAddress] = useState<string>("");

  const generateCertificateNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CC-${timestamp}-${random}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateCertificate = () => {
    const certNumber = generateCertificateNumber();
    setFormData((prev) => ({ ...prev, certificateNumber: certNumber }));
  };

  const handleMintTokens = async () => {
    if (!connected || !publicKey) {
      toast(`{
        title: "Wallet not connected",
        description: "Please connect your wallet to mint carbon credits",
        variant: "destructive",
      }`);
      return;
    }

    if (
      !formData.certificateNumber ||
      !formData.carbonAmount ||
      !formData.projectName
    ) {
      toast(`{
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      }`);
      return;
    }

    setIsLoading(true);

    try {
      // Create a new mint
      const mintKeypair = Keypair.generate();
      const lamports = await getMinimumBalanceForRentExemptMint(connection);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: MINT_SIZE,
          lamports,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          6, // 6 decimals
          publicKey, // mint authority
          publicKey // freeze authority
        )
      );

      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      setMintAddress(mintKeypair.publicKey.toString());

      toast(`{
        title: "Carbon credits minted successfully!",
        description: Certificate ${formData.certificateNumber} has been created on Solana,
        }`);

      // Reset form
      setFormData({
        certificateNumber: "",
        carbonAmount: "",
        projectName: "",
        projectDescription: "",
        verificationStandard: "VCS",
        location: "",
      });
    } catch (error) {
      console.error("Minting error:", error);
      toast(`{
        title: "Minting failed",
        description:
          "There was an error minting your carbon credits. Please try again.",
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
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
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
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              <LeafIcon className="h-4 w-4 mr-2" />
              Mint Carbon Credits
            </Badge>
            <h1 className="text-4xl font-bold text-balance mb-4">
              Create Verified Carbon Credits
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Mint blockchain-verified carbon credits with certificate numbers
              and environmental impact tracking
            </p>
          </div>

          {!connected && (
            <Alert className="mb-8 max-w-2xl mx-auto">
              <ShieldCheckIcon className="h-4 w-4" />
              <AlertDescription>
                Connect your Solana wallet to start minting carbon credits on
                the blockchain.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Minting Form */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LeafIcon className="h-5 w-5 text-primary" />
                  Carbon Credit Details
                </CardTitle>
                <CardDescription>
                  Enter the details for your carbon credit certificate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="certificateNumber">
                      Certificate Number
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="certificateNumber"
                        placeholder="CC-XXXX-XXXX"
                        value={formData.certificateNumber}
                        onChange={(e) =>
                          handleInputChange("certificateNumber", e.target.value)
                        }
                        className="font-mono"
                      />
                      <Button
                        variant="outline"
                        onClick={handleGenerateCertificate}
                        className="shrink-0 bg-transparent"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbonAmount">CO₂ Amount (tons)</Label>
                    <Input
                      id="carbonAmount"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.1"
                      value={formData.carbonAmount}
                      onChange={(e) =>
                        handleInputChange("carbonAmount", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., Solar Farm Project Brazil"
                    value={formData.projectName}
                    onChange={(e) =>
                      handleInputChange("projectName", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription">
                    Project Description
                  </Label>
                  <Textarea
                    id="projectDescription"
                    placeholder="Describe the environmental project and its impact..."
                    value={formData.projectDescription}
                    onChange={(e) =>
                      handleInputChange("projectDescription", e.target.value)
                    }
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="verificationStandard">
                      Verification Standard
                    </Label>
                    <select
                      id="verificationStandard"
                      value={formData.verificationStandard}
                      onChange={(e) =>
                        handleInputChange(
                          "verificationStandard",
                          e.target.value
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="VCS">
                        VCS (Verified Carbon Standard)
                      </option>
                      <option value="CDM">
                        CDM (Clean Development Mechanism)
                      </option>
                      <option value="GS">Gold Standard</option>
                      <option value="CAR">CAR (Climate Action Reserve)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., São Paulo, Brazil"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleMintTokens}
                  disabled={!connected || isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? (
                    "Minting..."
                  ) : (
                    <>
                      Mint Carbon Credits
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {mintAddress && (
                  <Alert>
                    <ShieldCheckIcon className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <div>Carbon credits minted successfully!</div>
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          Mint Address: {mintAddress}
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Certificate Preview */}
            <div className="space-y-6">
              <CertificatePreview
                certificateNumber={formData.certificateNumber}
                carbonAmount={Number.parseFloat(formData.carbonAmount) || 0}
                projectName={formData.projectName}
                issueDate={new Date().toLocaleDateString()}
              />

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Environmental Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">CO₂ Offset</span>
                      <span className="font-semibold text-secondary">
                        {formData.carbonAmount || 0} tons
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Equivalent to
                      </span>
                      <span className="font-semibold">
                        {Math.round(
                          (Number.parseFloat(formData.carbonAmount) || 0) * 2.2
                        )}{" "}
                        trees planted
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Car miles offset
                      </span>
                      <span className="font-semibold">
                        {Math.round(
                          (Number.parseFloat(formData.carbonAmount) || 0) * 2400
                        ).toLocaleString()}{" "}
                        miles
                      </span>
                    </div>
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
