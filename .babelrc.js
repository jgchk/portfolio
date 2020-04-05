module.exports = {
  presets: [
    [
      'next/babel',
      {
        'preset-env': {
          useBuiltIns: 'usage',
          corejs: {
            version: 3,
            proposals: true,
          },
        },
      },
    ],
  ],
  plugins: ['inline-react-svg'],
}
