const projects = [
  {
    text: 'spell-a-story',
    url: 'https://github.com/immjustjoshin/SpellAStory',
    icon: 'book',
  },
  {
    text: 'better-rym',
    url: 'https://github.com/jgchk/betterRYM',
    icon: 'spotify',
  },
  {
    text: 'portfolio',
    url: 'https://github.com/jgchk/portfolio',
    icon: 'briefcase',
  },
  {
    text: 'auto-dm',
    url: 'https://github.com/redline-forensics/auto-dm',
    icon: 'car',
  },
  {
    text: 'galaga',
    url: 'https://github.com/jgchk/gba-galaga',
    icon: 'gamepad',
  },
  {
    text: 'uttt',
    url: 'https://github.com/jgchk/uttt-react',
    icon: 'hashtag',
  },
]

const elsewhere = [
  {
    text: 'linkedin',
    url: 'https://www.linkedin.com/in/jgchk/',
    icon: 'linkedin',
  },
  {
    text: 'github',
    url: 'https://github.com/jgchk',
    icon: 'github',
  },
  {
    text: 'insta',
    url: 'https://www.instagram.com/jake.cafe/',
    icon: 'instagram',
  },
  {
    text: 'rym',
    url: 'https://rateyourmusic.com/~CaptainMocha',
    icon: 'music',
  },
]

const data = [
  {
    type: 'title',
    text: 'jake.cheek',
  },
  {
    type: 'blurb',
    text: 'people, design, code',
  },
  {
    type: 'header',
    text: 'projects',
  },
  ...projects.map(item => ({
    type: 'item',
    ...item,
  })),
  {
    type: 'header',
    text: 'elsewhere',
  },
  ...elsewhere.map(item => ({
    type: 'item',
    ...item,
  })),
]

export default data
