"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./FAQSection.css";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faq: FAQItem[];
}

export default function FAQSection({ faq }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="faqSection">
      <div className="faqContainer">
        <header className="faqHeader">
          <span className="faqEyebrow">
            Frequently Asked Questions
          </span>

          <h2>Frequently asked questions about Hireko</h2>

          <p>
            Learn more about Hireko&apos;s AI interviewing, candidate
            evaluation, recruiter workflows, and hiring capabilities.
          </p>
        </header>

        <div className="faqList">
          {faq.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                className={`faqItem ${isOpen ? "faqItemOpen" : ""}`}
                key={index}
              >
                <button
                  className="faqQuestion"
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>

                  <ChevronDown
                    className="faqChevron"
                    size={20}
                  />
                </button>

                {isOpen && (
                  <div className="faqAnswer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}