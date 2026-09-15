import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="compareHero">
      <div className="compareHeroGlow compareHeroGlowBlue" />
      <div className="compareHeroGlow compareHeroGlowGreen" />

      <div className="compareHeroContainer">
        {/* LEFT CONTENT */}
        <div className="compareHeroContent">
          <div className="compareHeroBadge">
            <Sparkles size={17} />
            <span>AI Hiring Platform Comparisons</span>
          </div>

          <h1 className="compareHeroTitle">
            Compare AI Hiring
            <br />
            Platforms <span>with Confidence</span>
          </h1>

          <p className="compareHeroDescription">
            Explore independent comparisons of today&apos;s leading AI hiring
            platforms. Evaluate features, recruiter workflows, candidate
            experience, AI capabilities, pricing, integrations and enterprise
            readiness—all in one place.
          </p>

          <div className="compareHeroActions">
            <a href="#comparisons" className="compareHeroPrimaryButton" style={{ color: "#ffffff" }}>
              <span style={{ color: "#ffffff" }}>Compare Platforms</span>
              <ArrowRight size={19} style={{ color: "#ffffff" }} />
            </a>

            <Link
              href="/compare/methodology"
              className="compareHeroSecondaryButton"
              style={{ color: "#13264b" }}
            >
              <span style={{ color: "#13264b" }}>Our Methodology</span>
            </Link>
          </div>

          <div className="compareHeroTrust">
            <div className="compareHeroTrustItem">
              <ShieldCheck size={19} />
              <span>Editorially Independent</span>
            </div>

            <div className="compareHeroTrustItem">
              <CheckCircle2 size={19} />
              <span>Updated Monthly</span>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="compareHeroVisual">
          <div className="compareHeroImageFrame">
            <Image
              src="https://res.cloudinary.com/ddargmdbm/image/upload/v1783749211/Hireko_Hero_Image_ymjih6.png"
              alt="AI-powered Hireko interview platform comparison experience"
              width={1536}
              height={1024}
              priority
              className="compareHeroImage"
              sizes="(max-width: 960px) 100vw, 50vw"
            />

            <div className="compareHeroImageOverlay" />

          </div>
        </div>
      </div>
    </section>
  );
}