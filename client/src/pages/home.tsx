import Header from "@/components/header";
import Hero from "@/components/hero";
import Categories from "@/components/categories";
import FeaturedResources from "@/components/featured-resources";
import Contact from "@/components/contact";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <Hero />
      <Categories />
      <FeaturedResources />
      <div className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-slate-600">Total Resources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">6</div>
              <div className="text-slate-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">25+</div>
              <div className="text-slate-600">Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">5-10</div>
              <div className="text-slate-600">Weekly Updates</div>
            </div>
          </div>
        </div>
      </div>
      <Contact />
      <Footer />
    </div>
  );
}
