import { Button } from "@/components/ui/button";
import { Rocket, Play } from "lucide-react";

export default function Hero() {
  const handleExploreResources = () => {
    document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetStarted = () => {
    document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-br from-primary to-blue-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Comprehensive DevOps Resources Platform
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Discover curated tools, tutorials, and best practices for modern DevOps workflows. 
              From CI/CD pipelines to infrastructure automation, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleExploreResources}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Explore Resources
              </Button>
              <Button 
                onClick={handleGetStarted}
                variant="outline"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-all duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="DevOps end-to-end lifecycle showing development, testing, deployment and monitoring phases" 
              className="rounded-xl shadow-2xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
