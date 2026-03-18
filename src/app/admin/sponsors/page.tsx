import Image from 'next/image'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sponsors } from '@/db/schema'
import { PageHeader } from '@/components/PageHeader'
import { DeleteSponsorButton } from './DeleteSponsorButton'
import { ToggleSponsorButton } from './ToggleSponsorButton'
import { AddSponsorForm } from './AddSponsorForm'

const sponsorRowClasses =
  'flex items-center gap-4 rounded-lg border border-border bg-surface p-4'
const sponsorImageClasses = 'h-16 w-16 flex-shrink-0 rounded object-contain'

export default async function AdminSponsorsPage() {
  const sponsorsList = await db
    .select()
    .from(sponsors)
    .orderBy(asc(sponsors.name))

  return (
    <div className="space-y-8">
      <PageHeader
        title="Sponsors"
        subtitle="Manage the sponsor logos displayed on the homepage."
      />

      <section className="space-y-3">
        <h2>Current sponsors ({sponsorsList.length})</h2>
        {sponsorsList.length === 0 ? (
          <p className="text-muted">No sponsors yet. Add one below.</p>
        ) : (
          <ul className="space-y-3">
            {sponsorsList.map((sponsor) => (
              <li key={sponsor.id} className={sponsorRowClasses}>
                <Image
                  src={sponsor.imageUrl}
                  alt={sponsor.name}
                  width={80}
                  height={80}
                  className={sponsorImageClasses}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {sponsor.name}
                    {!sponsor.enabled && (
                      <span className="ml-2 text-sm text-muted">
                        (disabled)
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {sponsor.imageUrl}
                  </p>
                </div>
                <ToggleSponsorButton
                  id={sponsor.id}
                  enabled={sponsor.enabled}
                />
                <DeleteSponsorButton id={sponsor.id} name={sponsor.name} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2>Add a sponsor</h2>
        <AddSponsorForm />
      </section>
    </div>
  )
}
