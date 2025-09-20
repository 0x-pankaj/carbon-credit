"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeafIcon, ShieldCheckIcon } from "@/components/icons";

interface CertificatePreviewProps {
  certificateNumber: string;
  carbonAmount: number;
  projectName: string;
  issueDate: string;
}

export function CertificatePreview({
  certificateNumber,
  carbonAmount,
  projectName,
  issueDate,
}: CertificatePreviewProps) {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <LeafIcon className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Carbon Credit Certificate</CardTitle>
        </div>
        <Badge variant="secondary" className="w-fit mx-auto">
          <ShieldCheckIcon className="h-4 w-4 mr-1" />
          Verified on Solana
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">
              Certificate #
            </div>
            <div className="font-mono text-lg font-semibold text-primary">
              {certificateNumber || "CC-XXXX-XXXX"}
            </div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">CO₂ Amount</div>
            <div className="text-2xl font-bold text-secondary">
              {carbonAmount || 0}{" "}
              <span className="text-sm font-normal">tons</span>
            </div>
          </div>
        </div>

        <div className="text-center p-4 bg-card rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Project</div>
          <div className="font-semibold">
            {projectName || "Environmental Project"}
          </div>
        </div>

        <div className="text-center p-4 bg-card rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">Issue Date</div>
          <div className="font-mono">
            {issueDate || new Date().toLocaleDateString()}
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground pt-4 border-t">
          This certificate represents verified carbon credits on the Solana
          blockchain
        </div>
      </CardContent>
    </Card>
  );
}
