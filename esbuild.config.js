import { buildSync } from "esbuild";

/* buildSync({
    entryPoints: ['./src/links.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ['es6'],
    outfile: './dist/wpucLinks.txt',
})
 */
buildSync({
    entryPoints: ['./src/worker.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ['es6'],
    outfile: './temp/worker.txt',
})

buildSync({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ['es6'],
    outfile: './dist/wpuc.js',
})



