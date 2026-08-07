'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  APIProvider,
  InfoWindow,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';
import { useTranslations } from 'next-intl';
import type { MapMarker, MapMarkerType } from '@/lib/map-api';

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };
const DEFAULT_ZOOM = 11;

type Filter = 'all' | MapMarkerType;

type ReportsMapProps = {
  markers: MapMarker[];
  apiKey: string;
};

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || markers.length === 0) {
      return;
    }

    if (markers.length === 1) {
      const marker = markers[0];
      map.setCenter({
        lat: Number(marker.latitude),
        lng: Number(marker.longitude),
      });
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    for (const marker of markers) {
      bounds.extend({
        lat: Number(marker.latitude),
        lng: Number(marker.longitude),
      });
    }
    map.fitBounds(bounds, 48);
  }, [map, markers]);

  return null;
}

function truncate(text: string, max = 200): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max).trim()}…`;
}

export function ReportsMap({ markers, apiKey }: ReportsMapProps) {
  const t = useTranslations('map');
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredMarkers = useMemo(() => {
    if (filter === 'all') {
      return markers;
    }
    return markers.filter((marker) => marker.type === filter);
  }, [filter, markers]);

  const selectedMarker =
    filteredMarkers.find((marker) => marker.id === selectedId) ?? null;

  if (!apiKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-sm text-amber-900">
        {t('missingApiKey')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'found', 'lost'] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setFilter(value);
              setSelectedId(null);
            }}
            className={`rounded-full px-3 py-1.5 text-sm ${
              filter === value
                ? 'bg-amber-800 text-white'
                : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            {t(
              value === 'all'
                ? 'filterAll'
                : value === 'found'
                  ? 'filterFound'
                  : 'filterLost',
            )}
          </button>
        ))}
      </div>

      {filteredMarkers.length === 0 ? (
        <p className="text-sm text-zinc-600">{t('empty')}</p>
      ) : null}

      <div className="h-[480px] overflow-hidden rounded-lg border border-zinc-200">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="h-full w-full"
          >
            <FitBounds markers={filteredMarkers} />
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                position={{
                  lat: Number(marker.latitude),
                  lng: Number(marker.longitude),
                }}
                onClick={() => setSelectedId(marker.id)}
                title={marker.type === 'found' ? t('foundLabel') : t('lostLabel')}
              />
            ))}
            {selectedMarker ? (
              <InfoWindow
                position={{
                  lat: Number(selectedMarker.latitude),
                  lng: Number(selectedMarker.longitude),
                }}
                onCloseClick={() => setSelectedId(null)}
              >
                <div className="max-w-xs space-y-2 text-sm text-zinc-800">
                  <p className="font-medium">
                    {selectedMarker.type === 'found'
                      ? t('foundLabel')
                      : t('lostLabel')}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(selectedMarker.createdAt).toLocaleString()}
                  </p>
                  <p>{truncate(selectedMarker.description)}</p>
                  {selectedMarker.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMarker.thumbnailUrl}
                      alt=""
                      className="max-h-32 rounded object-cover"
                    />
                  ) : null}
                </div>
              </InfoWindow>
            ) : null}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
