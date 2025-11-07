'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import HeroSection from "@/components/hero-section";
import { HomeStats } from "@/components/home-stats";
import { SiteFooter } from "@/components/site-footer";
import { OnboardingTour } from "@/components/onboarding-tour";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { userData } = useAuth();

  // Determine button text and href based on user role
  const getActionButton = () => {
    if (!userData) {
      return { text: 'Get Started', href: '/auth' };
    }
    if (userData.role === 'admin') {
      return { text: 'Admin Dashboard', href: '/admin/dashboard' };
    }
    return { text: 'My Dashboard', href: '/dashboard' };
  };

  const actionButton = getActionButton();

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      <OnboardingTour page="home" />
      <HeroSection />
      <main className="flex-1 p-6">
        <section className="text-center py-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
            The Ultimate African Nations League
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Experience the thrill of African football. Simulate matches, manage
            your federation, and climb to glory.
          </p>
          <Link href={actionButton.href}>
            <Button className="mt-8" data-tour="register-button">{actionButton.text}</Button>
          </Link>
        </section>

        <HomeStats />
      </main>
      <SiteFooter />
    </div>
  );
}

function TrophyIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
    )
  }
