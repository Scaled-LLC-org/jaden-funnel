import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amCommunityPage = defineType({
  name: 'amCommunityPage',
  title: 'Aesthetic Mastery — Community',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'eyebrowCopy', title: 'Eyebrow', type: 'string' }),
    headlineField('Highlight the emphasized phrase ("Aesthetic Mastery").'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 4 }),
    defineField({
      name: 'priceText',
      title: 'Price Text',
      type: 'string',
      description: 'The displayed price (e.g. "$97").',
    }),
    defineField({ name: 'ctaButtonText', title: 'CTA Button Text', type: 'string' }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      of: [{ type: 'string' }],
    }),
  ],
  preview: { prepare: () => ({ title: 'Community' }) },
})
