'use client';

import { useEffect } from 'react';
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from '@vis.gl/react-google-maps';

const DEFAULT_CENTER = { lat: 13.7563, lng: 100.5018 };
const DEFAULT_ZOOM = 11;
const PIN_ZOOM = 16;

type LocationPickerMapProps = {
  apiKey: string;
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (latitude: number, longitude: number) => void;
  pickMode: boolean;
  hint: string;
  missingApiKeyMessage: string;
};

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) {
      return;
    }

    map.panTo({ lat: latitude, lng: longitude });
    map.setZoom(PIN_ZOOM);
  }, [map, latitude, longitude]);

  return null;
}

function MapPicker({
  latitude,
  longitude,
  onLocationChange,
  hint,
}: Omit<LocationPickerMapProps, 'apiKey' | 'missingApiKeyMessage' | 'pickMode'>) {
  const hasPin = latitude !== null && longitude !== null;

  function handleMapClick(event: {
    detail: { latLng: google.maps.LatLngLiteral | null };
  }) {
    const latLng = event.detail.latLng;
    if (!latLng) {
      return;
    }

    onLocationChange(latLng.lat, latLng.lng);
  }

  function handleMarkerDrag(event: google.maps.MapMouseEvent) {
    const latLng = event.latLng;
    if (!latLng) {
      return;
    }

    onLocationChange(latLng.lat(), latLng.lng());
  }

  return (
    <div className="space-y-2">
      <div className="h-[280px] overflow-hidden rounded-lg border border-zinc-200">
        <Map
          defaultCenter={
            hasPin ? { lat: latitude, lng: longitude } : DEFAULT_CENTER
          }
          defaultZoom={hasPin ? PIN_ZOOM : DEFAULT_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="h-full w-full"
          onClick={handleMapClick}
        >
          {hasPin ? (
            <>
              <RecenterMap latitude={latitude} longitude={longitude} />
              <Marker
                position={{ lat: latitude, lng: longitude }}
                draggable
                onDragEnd={handleMarkerDrag}
              />
            </>
          ) : null}
        </Map>
      </div>
      <p className="text-sm text-zinc-600">{hint}</p>
    </div>
  );
}

export function LocationPickerMap({
  apiKey,
  latitude,
  longitude,
  onLocationChange,
  pickMode,
  hint,
  missingApiKeyMessage,
}: LocationPickerMapProps) {
  if (!apiKey) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        {missingApiKeyMessage}
      </p>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <MapPicker
        latitude={latitude}
        longitude={longitude}
        onLocationChange={onLocationChange}
        hint={hint}
      />
    </APIProvider>
  );
}
