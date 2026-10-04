// @ts-check

/**
 * Formato de código del proyecto.
 * Ejecuta `npm run format` para formatear todos los archivos.
 *
 * @type {import("prettier").Config}
 */
export default {
	plugins: ["prettier-plugin-astro"],
	useTabs: true,
	tabWidth: 4,
	printWidth: 110,
	semi: true,
	singleQuote: true,
	trailingComma: "all",
	overrides: [
		{
			files: "*.astro",
			options: { parser: "astro" },
		},
		{
			files: ["*.md", "*.yml", "*.yaml"],
			options: { useTabs: false, tabWidth: 2 },
		},
	],
};
