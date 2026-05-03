import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gqanrvta'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  console.error('Missing SANITY_AUTH_TOKEN or SANITY_API_WRITE_TOKEN.')
  console.error('Create a write token in Sanity, then run:')
  console.error('SANITY_AUTH_TOKEN=your_token node scripts/seed-site-settings.mjs')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2026-04-25',
  token,
  useCdn: false,
})

const trustedLogos = [
  {
    _key: 'voltify',
    _type: 'trustedLogo',
    name: 'Voltify',
    altText: 'Voltify',
    enabled: true,
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    localLogoUrl: '/assets/logos/voltify.svg',
  },
  {
    _key: 'mesh',
    _type: 'trustedLogo',
    name: 'MESH',
    altText: 'MESH',
    enabled: true,
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    localLogoUrl: '/assets/logos/mesh.png',
  },
  {
    _key: 'wisor',
    _type: 'trustedLogo',
    name: 'Wisor.AI',
    altText: 'Wisor.AI',
    enabled: true,
    displayHeight: 31,
    maxWidth: 170,
    verticalOffset: -1,
    localLogoUrl: '/assets/logos/wisor.png',
  },
  {
    _key: 'quizell',
    _type: 'trustedLogo',
    name: 'Quizell',
    altText: 'Quizell',
    enabled: true,
    displayHeight: 24,
    maxWidth: 138,
    verticalOffset: 0,
    localLogoUrl: '/assets/logos/quizell.png',
  },
  {
    _key: 'nso',
    _type: 'trustedLogo',
    name: 'NSO Group',
    altText: 'NSO Group',
    enabled: true,
    displayHeight: 34,
    maxWidth: 98,
    verticalOffset: 1,
    localLogoUrl: '/assets/logos/nso.png',
  },
]

await client
  .createIfNotExists({
    _id: 'siteSettings',
    _type: 'siteSettings',
    title: 'Site settings',
  })
  .then(() =>
    client
      .patch('siteSettings')
      .set({
        title: 'Site settings',
        trustedLogos,
      })
      .commit()
  )

console.log('Seeded siteSettings title and trustedLogos.')
