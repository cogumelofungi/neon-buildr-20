import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	safelist: [
		// Font sizes
		'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 
		'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
		// Responsive font sizes
		'md:text-xs', 'md:text-sm', 'md:text-base', 'md:text-lg', 'md:text-xl', 
		'md:text-2xl', 'md:text-3xl', 'md:text-4xl', 'md:text-5xl', 'md:text-6xl',
		'lg:text-xs', 'lg:text-sm', 'lg:text-base', 'lg:text-lg', 'lg:text-xl', 
		'lg:text-2xl', 'lg:text-3xl', 'lg:text-4xl', 'lg:text-5xl', 'lg:text-6xl',
		'lg:text-7xl', 'lg:text-8xl',
		// Font weights
		'font-thin', 'font-light', 'font-normal', 'font-medium', 'font-semibold', 
		'font-bold', 'font-extrabold', 'font-black',
		// Responsive font weights
		'md:font-thin', 'md:font-light', 'md:font-normal', 'md:font-medium', 
		'md:font-semibold', 'md:font-bold', 'md:font-extrabold',
		'lg:font-thin', 'lg:font-light', 'lg:font-normal', 'lg:font-medium', 
		'lg:font-semibold', 'lg:font-bold', 'lg:font-extrabold',
		// Font families
		'font-sans', 'font-serif', 'font-mono',
		// Animations
		'opacity-0', 'opacity-100', 'translate-y-0', 'translate-y-10',
		// Hover and transitions
		'hover:scale-105', 'hover:scale-110', 'scale-105', 'scale-[1.06]',
		'hover:shadow-xl', 'hover:shadow-lg', 'hover:shadow-2xl',
		'transition-all', 'transition-transform', 'transition-colors', 'transition-shadow',
		'duration-200', 'duration-300', 'duration-700',
	],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'bebas': ['Bebas Neue', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Custom MigraBook colors
				'app-bg': 'hsl(var(--app-bg))',
				'app-surface': 'hsl(var(--app-surface))',
				'app-surface-hover': 'hsl(var(--app-surface-hover))',
				'app-border': 'hsl(var(--app-border))',
				'app-muted': 'hsl(var(--app-muted))',
				'neon-blue': 'hsl(var(--neon-blue))',
				'neon-pink': 'hsl(var(--neon-pink))',
				'phone-bg': 'hsl(var(--phone-bg))',
				'phone-screen': 'hsl(var(--phone-screen))',
			},
			backgroundImage: {
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-surface': 'var(--gradient-surface)',
			},
			boxShadow: {
				'neon': 'var(--shadow-neon)',
				'elegant': 'var(--shadow-elegant)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'scroll': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(-50%)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'scroll': 'scroll 30s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
