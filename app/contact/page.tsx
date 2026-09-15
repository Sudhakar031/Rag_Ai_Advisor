import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-20">
        <Container>
          <SectionHeading
            eyebrow="Contact"
            title="Let’s talk about your hiring stack"
            description="Share your current process and we’ll help you find a better fit for your team."
          />
          <div className="mt-12 max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <Card title="Book a product walkthrough" description="Tell us what you need and we’ll tailor a walkthrough to your workflow.">
              <Button href="mailto:hello@hirekocompare.com" className="mt-4">hello@hirekocompare.com</Button>
            </Card>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
