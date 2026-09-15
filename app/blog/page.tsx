import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Card } from "@/components/shared/Card";

const posts = [
  {
    title: "How to choose between assessment platforms",
    description: "A practical framework for evaluating modern hiring platforms and deciding what matters most.",
  },
  {
    title: "Why pricing transparency matters in recruiting tech",
    description: "Transparent pricing helps teams avoid hidden costs and make stronger budget decisions.",
  },
];

export default function BlogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-20">
        <Container>
          <SectionHeading
            eyebrow="Blog"
            title="Insights for modern hiring teams"
            description="Read practical guidance on hiring tools, workflows, and evaluation strategies."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <Card key={post.title} title={post.title} description={post.description} />
            ))}
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
