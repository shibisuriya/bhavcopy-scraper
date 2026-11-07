import { defineConfig } from 'kysely-ctl'

import { dialect } from './dialect'

export default defineConfig({
    // replace me with a real dialect instance OR a dialect name + `dialectConfig` prop.
    dialect
    //   migrations: {
    //     migrationFolder: "migrations",
    //   },
    //   plugins: [],
    //   seeds: {
    //     seedFolder: "seeds",
    //   }
})
