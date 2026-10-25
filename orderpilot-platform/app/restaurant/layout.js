export const metadata = {
  title: 'OrderPilot Restaurant',
  manifest: '/restaurant/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'OrderPilot Restaurant',
  },
};

export default function RestaurantLayout({ children }) {
  return children;
}
