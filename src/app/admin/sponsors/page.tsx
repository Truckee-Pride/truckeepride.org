import Image from 'next/image'
import { asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { sponsors } from '@/db/schema'
import { PageHeader } from '@/components/PageHeader'
import { DeleteSponsorButton } from './DeleteSponsorButton'
import { ToggleSponsorButton } from './ToggleSponsorButton'
import { AddSponsorForm } from './AddSponsorForm'
import { LayoutWidth } from '@/lib/constants'
import { EditableText } from '@/components/forms/EditableText'
import { updateSponsorName } from './actions'

const sponsorRowClasses =
  'flex items-center gap-4 rounded-lg border border-border bg-surface p-4'
const sponsorImageClasses = 'h-16 w-16 flex-shrink-0 rounded object-contain'

export default async function AdminSponsorsPage() {
  const sponsorsList = await db
    .select()
    .from(sponsors)
    .orderBy(asc(sponsors.name))

  return (
    <main className={LayoutWidth.wide}>
      <PageHeader
        title="Sponsors"
        subtitle="Manage the sponsor logos displayed on the homepage."
      />

      <section className="space-y-3">
        {sponsorsList.length === 0 ? (
          <p className="text-muted">No sponsors yet. Add one below.</p>
        ) : (
          <ul className="space-y-3 p-0">
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
                  <EditableText
                    value={sponsor.name}
                    onSaveAction={updateSponsorName.bind(null, sponsor.id)}
                    ariaLabel={`Edit sponsor name for ${sponsor.name}`}
                    emptyErrorMessage="Sponsor name is required"
                    textClassName="m-0 font-medium"
                    suffix={
                      !sponsor.enabled ? (
                        <span className="ml-2 text-sm text-muted">
                          (disabled)
                        </span>
                      ) : undefined
                    }
                  />
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
    </main>
  )
}
