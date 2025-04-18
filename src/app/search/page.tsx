'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchShows } from '@/lib/tmdb';
import ShowGrid from '@/components/ShowGrid';
import Loading from '@/components/Loading';

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for &ldquo;{query}&rdquo;
      </h1>
      <ShowGrid getShows={() => searchShows(query)} />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchResults />
    </Suspense>
  );
} 