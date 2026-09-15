import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-20">
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple plans for growing hiring teams"
            description="Choose a plan that matches your hiring volume, collaboration needs, and reporting requirements."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <Card title="Starter" description="For lean teams that need a fast, modern setup.">
              <p className="text-3xl font-semibold text-slate-900">$99/mo</p>
              <Button href="/contact" className="mt-5 w-full">Book a demo</Button>
            </Card>
            <Card title="Growth" description="For scaling teams that want more automation and reporting.">
              <p className="text-3xl font-semibold text-slate-900">$299/mo</p>
              <Button href="/contact" className="mt-5 w-full">Talk to sales</Button>
            </Card>
            <Card title="Enterprise" description="For organizations that need advanced controls and tailored onboarding.">
              <p className="text-3xl font-semibold text-slate-900">Custom</p>
              <Button href="/contact" className="mt-5 w-full">Request quote</Button>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
