import { defineType, defineField } from 'sanity'
import { headlineField } from './headlineField'

export const amHomePage = defineType({
  name: 'amHomePage',
  title: 'Aesthetic Mastery — Home / Quiz Intro',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'eyebrowCopy',
      title: 'Eyebrow',
      type: 'string',
      description: 'Small label above the headline (e.g. "Get your personalized").',
    }),
    headlineField('The quiz intro headline. Highlight the emphasized word ("Physique").'),
    defineField({ name: 'subheadline', title: 'Subheadline', type: 'text', rows: 3 }),
    defineField({
      name: 'introQuestion',
      title: 'Intro Question',
      type: 'string',
      description: 'The first quiz question shown under the intro copy.',
    }),
    defineField({
      name: 'ctaNote',
      title: 'CTA Note',
      type: 'string',
      description: 'Reassurance line under the intro options (e.g. "Built on Jaden Levin\'s natural method").',
    }),
  ],
  preview: { prepare: () => ({ title: 'Home / Quiz Intro' }) },
})
