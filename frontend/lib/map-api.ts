import { getApiBase } from '@/lib/get-api-base';
import { serverFetch } from '@/lib/server-fetch';

export type MapMarkerType = 'found' | 'lost';

export type MapMarker = {
  id: string;
  type: MapMarkerType;
  description: string;
  latitude: string;
  longitude: string;
  createdAt: string;
  thumbnailUrl?: string | null;
};

export type MapMarkersResponse = {
  items: MapMarker[];
};

export async function fetchMapMarkers(
  type: 'found' | 'lost' | 'all' = 'all',
): Promise<MapMarkersResponse> {
  const query = type === 'all' ? '' : `?type=${type}`;
  const res = await serverFetch(`${getApiBase()}/map/markers${query}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch map markers: ${res.status}`);
  }

  return res.json();
}
