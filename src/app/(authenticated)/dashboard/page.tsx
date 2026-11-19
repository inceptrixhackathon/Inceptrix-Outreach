import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader
        title="Dashboard"
        description="Send event outreach communications seamlessly via Email or WhatsApp."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Email Card */}
        <Card className="group border-border/60 transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-blue/20">
              <Mail className="h-5 w-5 text-brand-dark" />
            </div>
            <CardTitle className="text-lg">Send Email</CardTitle>
            <CardDescription>
              Send the official event invitation & brochure attachment from our central Gmail account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/send/email">
              <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                Compose Email
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* WhatsApp Card */}
        <Card className="group border-border/60 transition-shadow hover:shadow-md">
          <CardHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-mint/40">
              <MessageCircle className="h-5 w-5 text-brand-dark" />
            </div>
            <CardTitle className="text-lg">Send WhatsApp</CardTitle>
            <CardDescription>
              Open an Indian WhatsApp (+91) chat prefilled with our official invitation message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/send/whatsapp">
              <Button
                variant="outline"
                className="w-full gap-2 border-brand-dark/20 hover:bg-brand-sage/20"
              >
                Open WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="border-border/60 bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <p className="font-medium text-foreground">Email Outreach</p>
              <p className="mt-1">
                Dispatched server-side through central Gmail with the PDF brochure attached automatically.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">WhatsApp Outreach</p>
              <p className="mt-1">
                Opens the recipient&apos;s chat with prefilled text. Download the brochure to attach manually.
              </p>
            </div>
            <div>
              <p className="font-medium text-foreground">Central Templates</p>
              <p className="mt-1">
                Subject and message copy are maintained centrally by the Admin without redeploying code.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

