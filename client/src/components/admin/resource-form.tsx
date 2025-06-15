import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";
import { insertResourceSchema, type InsertResource, type Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

interface ResourceFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ResourceForm({ onCancel, onSuccess }: ResourceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<InsertResource>({
    resolver: zodResolver(insertResourceSchema),
    defaultValues: {
      title: "",
      description: "",
      url: "",
      categoryId: 0,
      tags: [],
      imageUrl: "",
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: async (data: InsertResource) => {
      const response = await apiRequest("POST", "/api/resources", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Resource created successfully!",
        description: "The new resource has been added to the platform.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resources/featured"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create resource",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertResource) => {
    // Convert tags string to array
    const formData = {
      ...data,
      tags: typeof data.tags === 'string' 
        ? (data.tags as string).split(',').map(tag => tag.trim()).filter(Boolean)
        : data.tags || [],
    };
    createResourceMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Add New Resource</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter resource title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={3} 
                      placeholder="Enter resource description..." 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="docker, kubernetes, automation..." 
                      value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={createResourceMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {createResourceMutation.isPending ? "Saving..." : "Save Resource"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
