'use client';

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, Users, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroHeader } from './header'
import { useAuth } from '@/contexts/AuthContext'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function HeroSection() {
    const { userData, loading } = useAuth();

    // Determine CTA based on user role
    const getCallToAction = () => {
        if (loading) {
            return {
                badge: { text: 'Loading...', href: '#' },
                primary: { text: 'Loading...', href: '#', icon: ArrowRight },
                secondary: { text: 'View Tournament', href: '/bracket' }
            };
        }

        if (!userData) {
            // Not logged in
            return {
                badge: { text: 'Register Your Nation Today', href: '/auth' },
                primary: { text: 'Register Federation', href: '/auth', icon: Users },
                secondary: { text: 'View Tournament', href: '/bracket' }
            };
        }

        if (userData.role === 'admin') {
            // Admin user
            return {
                badge: { text: 'Welcome Back, Admin', href: '/admin/dashboard' },
                primary: { text: 'Admin Dashboard', href: '/admin/dashboard', icon: Shield },
                secondary: { text: 'View Tournament', href: '/bracket' }
            };
        }

        // Federation representative
        return {
            badge: { text: 'Welcome Back to Your Federation', href: '/dashboard' },
            primary: { text: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
            secondary: { text: 'View Bracket', href: '/bracket' }
        };
    };

    const cta = getCallToAction();

    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <AnimatedGroup variants={transitionVariants}>
                                    <Link
                                        href={cta.badge.href}
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">{cta.badge.text}</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </AnimatedGroup>

                                <TextEffect
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    as="h1"
                                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                                    African Nations League Championship
                                </TextEffect>
                                <TextEffect
                                    per="line"
                                    preset="fade-in-blur"
                                    speedSegment={0.3}
                                    delay={0.5}
                                    as="p"
                                    className="mx-auto mt-8 max-w-2xl text-balance text-lg">
                                    Register your nation, build your squad of 23 players, and compete in the ultimate African football tournament. Experience AI-powered match simulations with real-time commentary.
                                </TextEffect>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <div
                                        key={1}
                                        className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="rounded-xl px-5 text-base">
                                            <Link href={cta.primary.href} className="flex items-center gap-2">
                                                <cta.primary.icon className="h-4 w-4" />
                                                <span className="text-nowrap">{cta.primary.text}</span>
                                            </Link>
                                        </Button>
                                    </div>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-10.5 rounded-xl px-5">
                                        <Link href={cta.secondary.href}>
                                            <span className="text-nowrap">{cta.secondary.text}</span>
                                        </Link>
                                    </Button>
                                </AnimatedGroup>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
