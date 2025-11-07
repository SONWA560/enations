"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  UserPlus,
  Users,
  Trophy,
  Zap,
  Eye,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string; // CSS selector for the element to highlight
  position?: "top" | "bottom" | "left" | "right";
  page?: string; // Which page this step applies to
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to African Nations League!",
    description: "Let's take a quick tour to help you get started with the platform. This will only take a minute!",
    icon: <Sparkles className="h-6 w-6" />,
    page: "home"
  },
  {
    id: "registration",
    title: "Register Your Federation",
    description: "First, click 'Get Started' to register your federation and provide your details. You'll need your federation name and email.",
    icon: <UserPlus className="h-6 w-6" />,
    target: "[data-tour='register-button']",
    position: "bottom",
    page: "home"
  },
  {
    id: "squad",
    title: "Select Your Squad",
    description: "After registration, go to your Dashboard to select 5 players for your squad. Choose wisely - they represent your nation!",
    icon: <Users className="h-6 w-6" />,
    target: "[data-tour='dashboard-link']",
    position: "bottom",
    page: "home"
  },
  {
    id: "bracket",
    title: "View Tournament Bracket",
    description: "Check the Tournament Bracket to see all matches, fixtures, and live results. Click any match to view detailed commentary!",
    icon: <Trophy className="h-6 w-6" />,
    target: "[data-tour='bracket-link']",
    position: "bottom",
    page: "home"
  },
  {
    id: "leaderboard",
    title: "Track Top Scorers",
    description: "Visit the Leaderboard to see who's leading the golden boot race. Your players could be here!",
    icon: <Zap className="h-6 w-6" />,
    target: "[data-tour='leaderboard-link']",
    position: "bottom",
    page: "home"
  },
  {
    id: "matches",
    title: "Watch Matches Unfold",
    description: "Admins can play matches with live AI commentary or simulate them quickly. You'll receive email updates after each match!",
    icon: <Eye className="h-6 w-6" />,
    page: "home"
  },
  {
    id: "notifications",
    title: "Stay Updated",
    description: "You'll receive email notifications about match results, tournament progress, and important updates. Check your inbox!",
    icon: <Mail className="h-6 w-6" />,
    page: "home"
  }
];

interface OnboardingTourProps {
  page?: string;
}

export function OnboardingTour({ page = "home" }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("africon-tour-completed");
    if (!hasSeenTour && page === "home") {
      // Delay showing tour slightly for better UX
      setTimeout(() => setIsOpen(true), 1000);
    }
  }, [page]);

  // Highlight target element
  useEffect(() => {
    if (isOpen && tourSteps[currentStep]?.target) {
      const element = document.querySelector(tourSteps[currentStep].target!) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    setHighlightedElement(null);
  };

  const handleComplete = () => {
    localStorage.setItem("africon-tour-completed", "true");
    setIsOpen(false);
    setHighlightedElement(null);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    // Show a small button to restart tour
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRestart}
        className="fixed bottom-4 right-4 z-40 shadow-lg"
        data-tour="restart-tour"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Tour Guide
      </Button>
    );
  }

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" />

      {/* Highlight spotlight */}
      {highlightedElement && (
        <div
          className="fixed z-[45] pointer-events-none transition-all duration-300"
          style={{
            top: highlightedElement.getBoundingClientRect().top - 8,
            left: highlightedElement.getBoundingClientRect().left - 8,
            width: highlightedElement.getBoundingClientRect().width + 16,
            height: highlightedElement.getBoundingClientRect().height + 16,
            boxShadow: "0 0 0 4px rgba(var(--primary), 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5)",
            borderRadius: "0.5rem",
          }}
        />
      )}

      {/* Tour Card */}
      <Card
        className={cn(
          "fixed z-50 w-[90vw] max-w-md shadow-2xl border-2 border-primary/20",
          highlightedElement
            ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
      >
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              {step.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">{step.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                Step {currentStep + 1} of {tourSteps.length}
              </CardDescription>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-muted rounded-full mt-4 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {step.description}
          </p>

          {highlightedElement && (
            <Badge variant="secondary" className="mt-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Look at the highlighted area
            </Badge>
          )}
        </CardContent>

        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
          >
            Skip Tour
          </Button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            
            <Button
              size="sm"
              onClick={handleNext}
            >
              {currentStep < tourSteps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Finish
                  <Sparkles className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
