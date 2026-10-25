'use client';

import { useParams } from 'next/navigation';
import RestaurantDashboard from '../RestaurantDashboard';

export default function RestaurantAccountPage() {
  const params = useParams();
  return <RestaurantDashboard restaurantSlug={params.slug} />;
}
