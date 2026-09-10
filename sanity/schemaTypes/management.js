export default {
  name: 'management',
  title: 'Management',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Full Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used in the profile page URL, e.g. /team-member.html?slug=daniel-owor-agbor',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'position',
      title: 'Position',
      type: 'string',
    },
    {
      name: 'bio',
      title: 'Biography',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'displayOrder',
      title: 'Display Order',
      type: 'number',
    },
    {
      name: 'linkedin',
      title: 'LinkedIn URL',
      type: 'url',
    },
  ],
}