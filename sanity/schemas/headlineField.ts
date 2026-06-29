import { defineField } from 'sanity'

/**
 * Shared headline builder. A headline is an ordered array of inline segments;
 * each segment is either plain or `highlighted` (rendered with gradient/accent
 * styling on the site). Reused across every page singleton so the field shape,
 * validation, and preview stay identical everywhere.
 */
export const headlineField = (description?: string) =>
  defineField({
    name: 'headline',
    title: 'Headline',
    type: 'array',
    description,
    validation: rule => rule.required().min(1),
    of: [
      {
        type: 'object',
        name: 'segment',
        title: 'Segment',
        fields: [
          defineField({ name: 'text', title: 'Text', type: 'string', validation: rule => rule.required() }),
          defineField({ name: 'highlighted', title: 'Highlighted (accent styling)', type: 'boolean', initialValue: false }),
        ],
        preview: {
          select: { text: 'text', highlighted: 'highlighted' },
          prepare: ({ text, highlighted }: { text?: string; highlighted?: boolean }) => ({
            title: `${highlighted ? '✦ ' : ''}${text ?? '(empty)'}`,
          }),
        },
      },
    ],
  })
