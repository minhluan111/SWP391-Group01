/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary — xanh sáng #007BFF (Header, nút, icon, nhấn — hiện đại, có màu)
        primary: {
          50: '#E6F2FF',
          100: '#CCE5FF',
          200: '#99CBFF',
          300: '#66B0FF',
          400: '#3396FF',
          500: '#007BFF',
          600: '#0062CC',
          700: '#004A99',
          800: '#003166',
          900: '#001933',
        },
        // Navy — #003366 (tiêu đề lớn, nhấn thương hiệu đậm)
        navy: {
          DEFAULT: '#003366',
          50: '#E8EEF5',
          100: '#D1DDEB',
          200: '#A3BBD6',
          300: '#7599C2',
          400: '#4777AD',
          500: '#003366',
          600: '#002952',
          700: '#001F3D',
          800: '#001429',
          900: '#000A14',
        },
        surface: '#F7F9FC',
        ink: {
          DEFAULT: '#1A1C1E',
          muted: '#44474E',
        },
      }
    },
  },
  plugins: [],
}
