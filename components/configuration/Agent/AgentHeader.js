'use client';
import { 
  Sparkles, 
  Zap, 
} from 'lucide-react';
import React from 'react';

// Header Component
const Header = ({}) => {
  return (
    <header className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 shadow-sm border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-md">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GTWY AI
              </h1>
              <p className="text-primary/70 text-sm font-medium">
                Gateway to Intelligent Agents
              </p>
            </div>
          </div>

          {/* Welcome Message */}
          <div className="flex items-center gap-2 text-secondary font-medium">
            <Sparkles className="w-5 h-5 text-accent" />
            <span className="text-sm">
              {localStorage.getItem('publicAgentProxyToken') ? 'Welcome back!' : 'Discover AI Agents'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;