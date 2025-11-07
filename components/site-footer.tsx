import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Globe } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">African Nations League</h3>
            <p className="text-sm text-muted-foreground">
              The ultimate African football tournament platform with AI-powered simulations.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/bracket" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tournament Bracket
                </Link>
              </li>
              <li>
                <Link 
                  href="/leaderboard" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/auth" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin/dashboard" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Connect</h3>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild>
                <Link 
                  href="https://github.com/SONWA560" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link 
                  href="https://www.linkedin.com/in/sonwabise-gcolotela-315b94296/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link 
                  href="https://www.sonwabisegcolotela.info/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Portfolio"
                >
                  <Globe className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} African Nations League. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Firebase & OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
