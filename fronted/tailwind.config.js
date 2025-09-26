/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'base': ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"Helvetica Neue"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      fontSize: {
        'caption': ['10px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'card-title': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'page-title': ['18px', { lineHeight: '1.5', fontWeight: '600' }],
        'headline': ['24px', { lineHeight: '1.5', fontWeight: '700' }],
        'display': ['32px', { lineHeight: '1.5', fontWeight: '700' }],
      },
      spacing: {
        'tight': '8px',
        'compact': '12px',
        'standard': '16px',
        'comfortable': '24px',
        'spacious': '32px',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        'small': '8px',
        'medium': '12px',
        'large': '16px',
        'extra-large': '20px',
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          base: "#7FB069",
          lighter: "#A4C98A", 
          darker: "#65935A",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          'warm-yellow': '#F5E6A3',
          'soft-coral': '#FFB3BA',
          'mint-blue': '#B3E5D1',
          'lavender': '#D4C5F9',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
        // 文字颜色系统
        'text-primary': '#2D5016',
        'text-secondary': '#2D5016',
        'text-tertiary': '#2D5016',
        'text-quaternary': '#2D5016',
        'text-on-glass': '#2D5016',
        'text-accent': '#7FB069',
        // 功能色彩
        'success': {
          DEFAULT: '#81C784',
          light: '#C8E6C9',
        },
        'error': {
          DEFAULT: '#E57373',
          light: '#FFCDD2',
        },
        'warning': {
          DEFAULT: '#FFB74D',
          light: '#FFE0B2',
        },
        'info': {
          DEFAULT: '#64B5F6',
          light: '#BBDEFB',
        },
      },
    },
  },
      plugins: [
    require("tailwindcss-animate"),
    function({ addUtilities }) {
      const newUtilities = {
        // 背景渐变 - 清新薄荷色调
        '.bg-page': {
          background: 'linear-gradient(135deg, #E0F2F1 0%, #E8F5E8 50%, #F0FDF4 100%)',
        },
        '.dark .bg-page': {
          background: 'linear-gradient(135deg, #0F1419 0%, #1A2332 50%, #1E293B 100%)',
        },
        // 玻璃拟态容器
        '.bg-container-primary': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.dark .bg-container-primary': {
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(30, 41, 59, 0.8)',
        },
        '.bg-container-secondary': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark .bg-container-secondary': {
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(30, 41, 59, 0.6)',
        },
        '.bg-container-elevated': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },
        '.dark .bg-container-elevated': {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(30, 41, 59, 0.9)',
        },
        '.bg-container-warm': {
          backgroundColor: 'rgba(245, 230, 163, 0.15)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(245, 230, 163, 0.2)',
        },
        '.dark .bg-container-warm': {
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(30, 41, 59, 0.7)',
        },
        '.bg-card-glass': {
          backgroundColor: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        },
        '.dark .bg-card-glass': {
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(30, 41, 59, 0.8)',
        },
        // 文字颜色工具类
        '.color-text-primary': {
          color: 'rgba(45, 80, 22, 0.85)',
        },
        '.dark .color-text-primary': {
          color: 'rgba(248, 250, 252, 0.9)',
        },
        '.color-text-secondary': {
          color: 'rgba(45, 80, 22, 0.65)',
        },
        '.dark .color-text-secondary': {
          color: 'rgba(248, 250, 252, 0.7)',
        },
        '.color-text-tertiary': {
          color: 'rgba(45, 80, 22, 0.45)',
        },
        '.dark .color-text-tertiary': {
          color: 'rgba(248, 250, 252, 0.5)',
        },
        '.color-text-quaternary': {
          color: 'rgba(45, 80, 22, 0.25)',
        },
        '.dark .color-text-quaternary': {
          color: 'rgba(248, 250, 252, 0.3)',
        },
        '.color-text-on-glass': {
          color: 'rgba(45, 80, 22, 0.8)',
        },
        '.dark .color-text-on-glass': {
          color: 'rgba(248, 250, 252, 0.85)',
        },
        '.color-text-accent': {
          color: '#7FB069',
        },
        '.dark .color-text-accent': {
          color: '#7FB069',
        },
        // 功能色背景
        '.color-success-light': {
          backgroundColor: 'rgba(200, 230, 201, 0.6)',
        },
        '.dark .color-success-light': {
          backgroundColor: 'rgba(129, 199, 132, 0.3)',
        },
        '.color-error-light': {
          backgroundColor: 'rgba(255, 205, 210, 0.6)',
        },
        '.dark .color-error-light': {
          backgroundColor: 'rgba(229, 115, 115, 0.3)',
        },
        '.color-warning-light': {
          backgroundColor: 'rgba(255, 224, 178, 0.6)',
        },
        '.dark .color-warning-light': {
          backgroundColor: 'rgba(255, 183, 77, 0.3)',
        },
        '.color-info-light': {
          backgroundColor: 'rgba(187, 222, 251, 0.6)',
        },
        '.dark .color-info-light': {
          backgroundColor: 'rgba(100, 181, 246, 0.3)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
};
