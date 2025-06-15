import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="relative">
                <Zap className="text-primary text-2xl mr-3" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              </div>
              <h4 className="text-xl font-bold">DevOps with Hilltop</h4>
            </div>
            <p className="text-slate-300 mb-4">
              Comprehensive DevOps resources platform for modern development teams.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <i className="fab fa-github text-xl" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <i className="fab fa-twitter text-xl" />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                <i className="fab fa-linkedin text-xl" />
              </a>
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Resources</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors duration-200">CI/CD Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Infrastructure Tools</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Monitoring Solutions</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Security Best Practices</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Platform</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors duration-200">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Admin Portal</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Integration Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Support</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Company</h5>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 DevOps with Hilltop. All rights reserved. Built with modern web technologies and best practices.</p>
        </div>
      </div>
    </footer>
  );
}
