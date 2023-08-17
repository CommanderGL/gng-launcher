module.exports = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: "CrossScar",
          homepage: 'https://crossscardev.itch.io/gng',
          categories: ["Game"],
          description: "A basic cross-platform puzzle game.",
          productDescription: `A basic cross-platform puzzle game where everything is color coded!
With Support For:
    * Linux
    * Windows (HTML Electron)
    * HTML
    * And the Wii U`,
          productName: "GNG Launcher",
          name: "gng-launcher",
          version: "1.2",
          icon: 'logo.png'
        }
      },
    }
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
        // If you are familiar with Vite configuration, it will look really familiar.
        build: [
          {
            // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
            entry: 'src/index.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
          }
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
  ],
};
