import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Grid, Plus } from "lucide-react";
import type { ResourceWithCategory } from "@shared/schema";

export default function FeaturedResources() {
  const [filter, setFilter] = useState("all");

  const { data: resources = [], isLoading } = useQuery<ResourceWithCategory[]>({
    queryKey: ["/api/resources/featured"],
  });

  const handleLoadMore = () => {
    // Implement load more functionality
    console.log("Loading more resources...");
  };

  if (isLoading) {
    return (
      <section id="resources" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading resources...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="resources" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h3 className="text-3xl font-bold text-slate-800 mb-4">Featured Resources</h3>
            <p className="text-lg text-slate-600">Hand-picked tools and guides for DevOps excellence</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="cicd">CI/CD</SelectItem>
                <SelectItem value="iac">Infrastructure as Code</SelectItem>
                <SelectItem value="monitoring">Monitoring</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
          </div>
        </div>

        {resources.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-slate-600 mb-4">No resources available yet.</p>
            <p className="text-slate-500">Check back soon for curated DevOps resources!</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <Card key={resource.id} className="bg-white shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {resource.imageUrl ? (
                    <img 
                      src={resource.imageUrl} 
                      alt={resource.title}
                      className="w-full h-48 object-cover" 
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-slate-400 text-center">
                        <i className={`${resource.category.icon} text-4xl mb-2`} />
                        <p>{resource.category.name}</p>
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        <i className={`${resource.category.icon} mr-1`} />
                        {resource.category.name}
                      </Badge>
                      <span className="text-sm text-slate-500">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xl font-semibold text-slate-800 mb-3">{resource.title}</h4>
                    <p className="text-slate-600 mb-4 line-clamp-3">{resource.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {resource.tags && resource.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {resource.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                        {resource.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button onClick={handleLoadMore}>
                <Plus className="h-4 w-4 mr-2" />
                Load More Resources
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
