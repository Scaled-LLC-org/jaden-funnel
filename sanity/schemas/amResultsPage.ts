import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amResultsPage = defineType({
  name: 'amResultsPage',
  title: 'Aesthetic Mastery — Results',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'eyebrowCopy', title: 'Eyebrow', type: 'string' }),
    headlineField('Highlight the emphasized phrase ("physique blueprint").'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
    defineField({
      name: 'bullets',
      title: "What's Possible Bullets",
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({ name: 'summaryHeading', title: 'Summary Heading', type: 'string' }),
    defineField({ name: 'summaryBody', title: 'Summary Body', type: 'text', rows: 4 }),
    defineField({ name: 'ctaButtonText', title: 'CTA Button Text', type: 'string' }),
    defineField({ name: 'countdownText', title: 'Countdown Text', type: 'string' }),
  ],
  preview: { prepare: () => ({ title: 'Results' }) },
})
