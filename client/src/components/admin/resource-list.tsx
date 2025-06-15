import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, ExternalLink, Search } from "lucide-react";
import type { ResourceWithCategory } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function ResourceList() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resources = [], isLoading } = useQuery<ResourceWithCategory[]>({
    queryKey: ["/api/resources", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/resources?search=${encodeURIComponent(searchQuery)}`
        : "/api/resources";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch resources");
      return response.json();
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/resources/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resource deleted successfully!",
        description: "The resource has been removed from the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources/featured"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteResource = (id: number) => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
      </div>

      {resources.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600 mb-4">
            {searchQuery ? "No resources found matching your search." : "No resources available yet."}
          </p>
          <p className="text-slate-500">
            {searchQuery ? "Try adjusting your search terms." : "Add your first resource to get started!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        <i className={`${resource.category.icon} mr-1`} />
                        {resource.category.name}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-500">
                      Created: {new Date(resource.createdAt).toLocaleDateString()}
                      {resource.updatedAt !== resource.createdAt && (
                        <span className="ml-2">
                          • Updated: {new Date(resource.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteResource(resource.id)}
                      disabled={deleteResourceMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">{resource.description}</p>
                
                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {resource.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {resource.url && (
                  <div className="flex items-center justify-between">
                    <a 
                      href={resource.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:text-blue-700 font-medium"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Resource
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
