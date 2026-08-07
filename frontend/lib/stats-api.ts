import { getApiBase } from '@/lib/get-api-base';

export type HomeStats = {
  dogsTotal: number;
};

export async function fetchHomeStats(): Promise<HomeStats | null> {
  try {
    const res = await fetch(`${getApiBase()}/stats/home`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}
