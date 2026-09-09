import React from 'react';
import Head from '@docusaurus/Head';

export type FaqItem = { question: string; answer: string };

/**
 * FAQ block for documentation pages. Renders the questions as collapsible items and emits
 * FAQPage JSON-LD (https://schema.org/FAQPage) so answer engines can quote them.
 * Answers are plain text on purpose: the same string feeds the structured data.
 */
export default function FaqSection({ items }: { items: FaqItem[] }): JSX.Element {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  return (
    <>
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <div className="faq-section">
        {items.map((item) => (
          <details key={item.question} className="faq-section__item">
            <summary>
              <strong>{item.question}</strong>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
