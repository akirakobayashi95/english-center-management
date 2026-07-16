import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			/* Hum palette — named accents (multi-accent on cream) */
  			hum: {
  				mint: 'oklch(80% 0.16 150)',
  				'mint-deep': 'oklch(70% 0.18 150)',
  				pear: 'oklch(86% 0.18 95)',
  				'pear-deep': 'oklch(76% 0.20 95)',
  				cyan: 'oklch(66% 0.18 235)',
  				'cyan-deep': 'oklch(56% 0.20 235)',
  				coral: 'oklch(68% 0.24 18)',
  				'coral-deep': 'oklch(58% 0.26 18)',
  				lavender: 'oklch(74% 0.16 305)',
  				'lavender-deep': 'oklch(64% 0.18 305)',
  			},
  			/*
  			 * Brand retint: the dashboard paints its accent with `bg-amber-*` /
  			 * `focus:border-amber-*` and a `from-amber-500 to-orange-500` gradient.
  			 * Repoint amber->mint and orange->pear at the token layer so the entire
  			 * existing surface retints to Hum without editing page literals.
  			 */
  			amber: {
  				50: 'oklch(95% 0.05 150)',
  				100: 'oklch(90% 0.08 150)',
  				200: 'oklch(85% 0.11 150)',
  				300: 'oklch(80% 0.14 150)',
  				400: 'oklch(76% 0.17 150)',
  				500: 'oklch(80% 0.16 150)',
  				600: 'oklch(70% 0.18 150)',
  				700: 'oklch(62% 0.17 150)',
  				800: 'oklch(52% 0.15 150)',
  				900: 'oklch(42% 0.13 150)',
  			},
  			orange: {
  				50: 'oklch(96% 0.06 95)',
  				100: 'oklch(92% 0.09 95)',
  				200: 'oklch(88% 0.12 95)',
  				300: 'oklch(86% 0.18 95)',
  				400: 'oklch(82% 0.19 95)',
  				500: 'oklch(86% 0.18 95)',
  				600: 'oklch(76% 0.20 95)',
  				700: 'oklch(68% 0.19 95)',
  				800: 'oklch(60% 0.17 95)',
  				900: 'oklch(52% 0.15 95)',
  			},
  		},
  		fontFamily: {
  			sans: ['var(--font-display)', 'Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  			mono: ['var(--font-label)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: 'calc(var(--radius) + 4px)',
  			'2xl': 'calc(var(--radius) + 8px)',
  		},
  		spacing: {
  			'4.5': '1.125rem',
  			'13': '3.25rem',
  			'15': '3.75rem',
  			'18': '4.5rem',
  		},
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;