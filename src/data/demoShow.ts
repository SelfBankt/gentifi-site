// Fictional trade show used by the Standards page diagram, example and explorer.
// Every exhibitor, stand, price and domain here is made up.

export interface Member {
  name: string;
  stand: string;
  category: 'glazing' | 'heating' | 'structure' | 'insulation' | 'energy' | 'roofing' | 'water';
  priceFrom: number; // GBP
  unit: string;
  domain: string;
}

export const show = {
  id: 'demo-selfbuild-2027',
  name: 'Demo Self Build Show 2027',
  kind: 'event' as const,
  publisher: { name: 'Demo Shows', domain: 'shows.example' },
  validFrom: '2027-05-14',
  validTo: '2027-05-16',
  facets: ['category', 'priceFrom', 'stand'],
};

export const members: Member[] = [
  { name: 'Example Windows', stand: 'B12', category: 'glazing', priceFrom: 540, unit: 'm²', domain: 'windows.example' },
  { name: 'Example Sash & Casement', stand: 'B20', category: 'glazing', priceFrom: 580, unit: 'm²', domain: 'sash.example' },
  { name: 'Example Glazing', stand: 'B14', category: 'glazing', priceFrom: 620, unit: 'm²', domain: 'glazing.example' },
  { name: 'Example Heat Pumps', stand: 'C04', category: 'heating', priceFrom: 7800, unit: 'installed', domain: 'heatpumps.example' },
  { name: 'Example Underfloor', stand: 'C09', category: 'heating', priceFrom: 45, unit: 'm²', domain: 'underfloor.example' },
  { name: 'Example Timber Frame', stand: 'A03', category: 'structure', priceFrom: 310, unit: 'm²', domain: 'timberframe.example' },
  { name: 'Example Insulation', stand: 'A07', category: 'insulation', priceFrom: 18, unit: 'm²', domain: 'insulation.example' },
  { name: 'Example Solar', stand: 'D02', category: 'energy', priceFrom: 5200, unit: 'installed', domain: 'solar.example' },
  { name: 'Example Roofing', stand: 'B03', category: 'roofing', priceFrom: 95, unit: 'm²', domain: 'roofing.example' },
  { name: 'Example Rainwater', stand: 'D05', category: 'water', priceFrom: 2100, unit: 'installed', domain: 'rainwater.example' },
];

export const catalogUrl = (m: Member) => `https://${m.domain}/.well-known/ai-catalog.json`;

/** The collection document for the show, as it would be published. */
export function collectionDoc(limit = members.length) {
  return {
    collection: {
      id: show.id,
      name: show.name,
      kind: show.kind,
      publisher: show.publisher,
      validFrom: show.validFrom,
      validTo: show.validTo,
      facets: show.facets,
      members: members.slice(0, limit).map((m) => ({
        catalog: catalogUrl(m),
        role: { stand: m.stand, category: m.category },
      })),
    },
  };
}

/** What a member adds to its own catalogue to confirm membership (rule 1). */
export const memberBacklink = {
  memberOf: [
    {
      collection: `https://${show.publisher.domain}/.well-known/collections/${show.id}.json`,
      role: { stand: members[0].stand },
    },
  ],
};
