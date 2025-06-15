import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Search, Settings } from "lucide-react";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <div className="flex items-center cursor-pointer">
                <div className="relative">
                  <Zap className="text-primary text-2xl mr-3" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-xl font-bold text-slate-800">
                  <span className="text-primary">DevOps</span>
                  <span className="text-accent"> with </span>
                  <span className="text-slate-800">Hilltop</span>
                </h1>
              </div>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-slate-600 hover:text-primary transition-colors duration-200">
                Home
              </Link>
              <Link href="/dashboard" className="text-slate-600 hover:text-primary transition-colors duration-200">
                Dashboard
              </Link>
              <a 
                href="#resources" 
                className="text-slate-600 hover:text-primary transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Resources
              </a>
              <a 
                href="#contact" 
                className="text-slate-600 hover:text-primary transition-colors duration-200 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Contact
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative hidden sm:block">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </form>
            <Link href="/admin">
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
