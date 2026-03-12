import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { LayoutWidth } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'LGBTQ+ Community Engagement & Mental Health in North Lake Tahoe',
  description:
    '2022 PRC Community Engagement & Behavioral Health Survey findings on LGBTQ+ housing, mental health, and social inclusion in the North Tahoe region.',
}

export default function MentalHealthPage() {
  return (
    <main className={LayoutWidth.prose}>
      <PageHeader
        title="LGBTQ+ community engagement and mental health in North Lake Tahoe"
        emoji="🏳️‍🌈"
      />

      <p>
        The{' '}
        <a href="https://www.ttcf.net/wp-content/uploads/2022/05/2022-PRC-Community-Engagement-Behavioral-Health-Survey-Report.pdf">
          <strong>
            2022 PRC Community Engagement &amp; Behavioral Health Survey Report
          </strong>
        </a>{' '}
        highlights significant disparities experienced by LGBTQ+ individuals in
        North Lake Tahoe, particularly in housing security, mental health, and
        community belonging.
      </p>

      <h2>Housing and Economic Instability</h2>

      <p>
        LGBTQ+ individuals in North Tahoe are disproportionately affected by
        economic instability. The report indicates that a high percentage of
        LGBTQ+ respondents have{' '}
        <strong>seriously considered leaving North Tahoe</strong> due to{' '}
        <strong>
          housing instability, lack of stable employment, or insufficient income
        </strong>
        . This aligns with broader economic challenges in the region, but LGBTQ+
        individuals, along with low-income residents and Hispanic populations,
        are especially vulnerable.
      </p>

      <h2>Mental Health and Community Support</h2>

      <p>
        Mental health challenges are a key concern. LGBTQ+ individuals in North
        Tahoe are:
      </p>
      <ul>
        <li>
          More likely to experience{' '}
          <strong>loneliness and social isolation</strong> compared to their
          non-LGBTQ+ peers.
        </li>
        <li>
          Less likely to feel that the community is{' '}
          <strong>
            caring and sympathetic toward people with mental health issues
          </strong>
          .
        </li>
        <li>
          Facing <strong>higher rates of healthcare insecurity</strong>, with
          many lacking <strong>health insurance coverage</strong>.
        </li>
      </ul>

      <h2>Community Engagement and Belonging</h2>

      <p>
        Despite North Tahoe&apos;s strong community identity, LGBTQ+ residents
        report lower levels of engagement and belonging. A significant portion
        of LGBTQ+ respondents do not feel that{' '}
        <strong>
          being a member of the community is part of their identity
        </strong>
        . This may be linked to lower levels of trust and support from the
        broader community.
      </p>

      <h2>Conclusion</h2>

      <p>
        The survey underscores the need for{' '}
        <strong>targeted interventions</strong> to support LGBTQ+ individuals in
        North Tahoe, particularly in{' '}
        <strong>
          affordable housing, mental health services, and social inclusion
          efforts
        </strong>
        . Addressing these disparities can contribute to a more inclusive and
        supportive community for all residents.
      </p>

      <h2>About the study</h2>

      <p>
        The 2022 PRC Community Engagement &amp; Behavioral Health Survey, a
        follow-up to a similar study in 2020, is a data-driven approach to
        measuring community engagement and behavioral health needs in three
        mountain-resort communities. Subsequently, this information may be used
        to inform decisions and guide efforts to improve community health and
        wellness. This assessment was conducted on behalf of Eagle Valley
        Behavioral Health, Building Hope Summit County, and Community
        Collaborative of Tahoe Truckee by PRC, Inc., with guidance and support
        from FSG consultants. FSG is a consulting firm that advises corporate,
        foundation, and nonprofit/NGO leaders on issues of social impact to
        create a more equitable and sustainable future. PRC is a nationally
        recognized healthcare consulting firm with extensive experience
        conducting community quality-of-life and health research in hundreds of
        communities across the United States since 1994.
      </p>
    </main>
  )
}
