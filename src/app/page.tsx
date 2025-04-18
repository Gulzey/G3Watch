'use client';

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchTrending, fetchMovies, fetchTVShows, fetchAnime, getImageUrl, TMDBShow } from "@/lib/tmdb";
import Link from "next/link";
import ShowList from '@/components/ShowList';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 lg:px-24">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4">
            Your Entertainment Hub
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl">
            Discover and track your favorite movies, TV shows, and anime all in one place.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="px-6 md:px-12 lg:px-24 space-y-12 pb-24">
        {/* Movies Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">Movies</h2>
            <Link href="/movies" className="text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </Link>
          </div>
          <ShowList getShows={fetchMovies} />
        </div>

        {/* TV Shows Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">TV Shows</h2>
            <Link href="/series" className="text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </Link>
          </div>
          <ShowList getShows={fetchTVShows} />
        </div>

        {/* Anime Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold">Anime</h2>
            <Link href="/anime" className="text-purple-400 hover:text-purple-300 transition-colors">
              View All
            </Link>
          </div>
          <ShowList getShows={fetchAnime} />
        </div>
      </section>
    </main>
  );
}
