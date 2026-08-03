import type { Metadata } from 'next'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { AddFilamentSheet, EditFilamentSheet } from '@/components/filaments/filament-sheet'
import { DeleteFilamentDialog } from '@/components/filaments/delete-filament-dialog'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Filament profiles',
  description: 'Manage your filament profile templates',
}

export default async function FilamentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profiles } = await supabase
    .from('filament_profiles')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Filament profiles</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Templates used when adding spools to your inventory
          </p>
        </div>
        <AddFilamentSheet />
      </div>

      {profiles && profiles.length > 0 ? (
        <div className="data-table-container">
          <table>
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12" />
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Material
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Color
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Default weight
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Default cost
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-4 py-3">
                    <div className="w-9 h-9 rounded border border-border bg-muted overflow-hidden flex items-center justify-center shrink-0">
                      {profile.image_url ? (
                        <Image
                          src={profile.image_url}
                          alt={`${profile.brand} ${profile.color}`}
                          width={36}
                          height={36}
                          sizes="36px"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Package
                          size={14}
                          className="text-muted-foreground"
                          strokeWidth={1.75}
                        />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {profile.brand}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                      {profile.material_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {profile.color}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-foreground tabular-nums">
                    {profile.default_weight} g
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-foreground tabular-nums">
                    ₹{Number(profile.default_cost).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <EditFilamentSheet profile={profile} />
                      <DeleteFilamentDialog
                        profileId={profile.id}
                        profileName={`${profile.brand} ${profile.color}`}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state border border-dashed border-border rounded-lg">
          <Package size={32} className="text-muted-foreground mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground mb-1">
            No filament profiles yet
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Create a profile to start tracking your filament spools
          </p>
          <AddFilamentSheet />
        </div>
      )}
    </div>
  )
}
