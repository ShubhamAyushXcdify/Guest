import localFont from 'next/font/local'

export const geist = localFont({
  src: [
    {
      path: './fonts/Geist-Thin.ttf',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/Geist-ExtraLight.ttf',
      weight: '200',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './fonts/Geist-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/Geist-ExtraBold.ttf',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/Geist-Black.ttf',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
  display: 'swap',
}) 