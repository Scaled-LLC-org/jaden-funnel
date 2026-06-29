import { defineType, defineField } from 'sanity'

export const amSettings = defineType({
  name: 'amSettings',
  title: 'Aesthetic Mastery — Settings',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'announcementBarText',
      title: 'Announcement Bar Text',
      type: 'string',
      description: 'Global announcement bar copy.',
    }),
    defineField({
      name: 'urgencyBarText',
      title: 'Urgency Bar Text',
      type: 'string',
      description: 'Global urgency bar copy.',
    }),
    defineField({
      name: 'calendlyUrl',
      title: 'Calendly URL',
      type: 'url',
      description: 'Booking widget URL used on the Book page.',
    }),
    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: 'youtube', title: 'YouTube URL', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram URL', type: 'url' }),
        defineField({ name: 'tiktok', title: 'TikTok URL', type: 'url' }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Settings' }) },
})
