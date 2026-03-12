import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LGBTQ+ Engagement & Mental Health in Truckee',
  description:
    '2022 PRC Community Engagement & Behavioral Health Survey findings on LGBTQ+ housing, mental health, and social inclusion in the North Tahoe region.',
}

export default function MentalHealthPage() {
  return (
    <main className="max-w-2xl px-8 py-12">
      <h1>LGBTQ+ Engagement &amp; Mental Health in Truckee</h1>

      <p className="mt-4">
        In 2022, PRC, Inc. — a nationally recognized consulting firm
        specializing in community health research since 1994 — conducted a
        Community Engagement &amp; Behavioral Health Survey for Eagle Valley
        Behavioral Health and local collaborative organizations in the North
        Tahoe region.
      </p>

      <h2 className="mt-10">Key Findings</h2>
      <ul className="mt-4 space-y-3">
        <li>
          Housing instability, lack of stable employment, and insufficient
          income are driving residents — including LGBTQ+ community members — to
          consider leaving the area.
        </li>
        <li>
          LGBTQ+ individuals in the region experience elevated rates of
          isolation compared to the broader population.
        </li>
        <li>
          The broader community lacks sufficient understanding of the mental
          health struggles facing LGBTQ+ residents.
        </li>
        <li>
          Healthcare access remains a barrier for many, particularly due to
          insurance gaps.
        </li>
        <li>
          Many LGBTQ+ respondents do not identify as part of the broader local
          community, suggesting gaps in trust and social support structures.
        </li>
      </ul>

      <h2 className="mt-10">Recommendations</h2>
      <p className="mt-4">
        The survey identified a need for targeted interventions in three areas:
      </p>
      <ul className="mt-4 space-y-2">
        <li>Affordable and stable housing options</li>
        <li>Accessible mental health services for LGBTQ+ individuals</li>
        <li>Programs that foster social inclusion and community belonging</li>
      </ul>

      <h2 className="mt-10">How Truckee Pride Helps</h2>
      <p className="mt-4">
        Truckee Pride exists to address exactly these gaps — building community,
        creating visible spaces for LGBTQ+ people in the mountains, and
        connecting residents to resources and support networks.
      </p>
      <ul className="mt-6 space-y-2">
        <li>
          <a href="https://chat.whatsapp.com/L9a8ogUvcbP2FieSIrMT1Z">
            Join our WhatsApp community
          </a>
        </li>
        <li>
          <a href="https://www.canva.com/design/DAF-NFd991g/p5CqdBbERNwJZJ2Y5ex0Sg/view">
            Suicide Prevention resources
          </a>
        </li>
        <li>
          <a href="mailto:hello@truckeepride.org">Get in touch</a>
        </li>
      </ul>
    </main>
  )
}
