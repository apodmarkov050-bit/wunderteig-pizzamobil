import RestaurantStats from './RestaurantStats';

export default async function RestaurantStatsPage({ params }) {
  const { slug } = await params;
  return <RestaurantStats restaurantSlug={slug} />;
}
