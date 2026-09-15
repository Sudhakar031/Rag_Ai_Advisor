import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const posts = {
  "how-to-choose-between-assessment-platforms": {
    title: "How to choose between assessment platforms",
    body: "Start by clarifying your hiring workflow, team structure, and candidate experience goals. Then evaluate each platform against implementation effort, reporting depth, and pricing transparency.",
  },
  "why-pricing-transparency-matters": {
    title: "Why pricing transparency matters in recruiting tech",
    body: "Transparent pricing helps teams avoid surprises, budget with confidence, and compare vendors on equal footing. It also reduces friction during procurement and rollout.",
  },
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = posts[slug as keyof typeof posts];

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 py-20">
        <Container className="max-w-3xl">
          <article className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Blog</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{post.title}</h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">{post.body}</p>
          </article>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
