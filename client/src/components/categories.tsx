import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import type { Category } from "@shared/schema";

const defaultCategories = [
  {
    id: 1,
    name: "CI/CD",
    description: "Continuous Integration and Deployment pipelines, automation tools, and best practices",
    icon: "fas fa-infinity",
    resourceCount: 24
  },
  {
    id: 2,
    name: "Infrastructure as Code",
    description: "Terraform, Ansible, CloudFormation templates and infrastructure automation",
    icon: "fas fa-server",
    resourceCount: 18
  },
  {
    id: 3,
    name: "Monitoring",
    description: "Application monitoring, logging, alerting systems and observability tools",
    icon: "fas fa-chart-line",
    resourceCount: 15
  },
  {
    id: 4,
    name: "Security",
    description: "DevSecOps practices, vulnerability scanning, security automation tools",
    icon: "fas fa-shield-alt",
    resourceCount: 21
  },
  {
    id: 5,
    name: "Cloud Platforms",
    description: "AWS, Azure, GCP services, cloud-native architectures and migrations",
    icon: "fas fa-cloud",
    resourceCount: 32
  },
  {
    id: 6,
    name: "Containerization",
    description: "Docker, Kubernetes, container orchestration and microservices patterns",
    icon: "fab fa-docker",
    resourceCount: 28
  }
];

export default function Categories() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Use default categories if none exist in database
  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  if (isLoading) {
    return (
      <section id="categories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading categories...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-slate-800 mb-4">Resource Categories</h3>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore our comprehensive collection of DevOps resources organized by key practice areas
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayCategories.map((category, index) => {
            const colors = [
              { bg: "bg-primary/10", hover: "group-hover:bg-primary/20", text: "text-primary" },
              { bg: "bg-emerald-500/10", hover: "group-hover:bg-emerald-500/20", text: "text-emerald-500" },
              { bg: "bg-yellow-500/10", hover: "group-hover:bg-yellow-500/20", text: "text-yellow-600" },
              { bg: "bg-red-500/10", hover: "group-hover:bg-red-500/20", text: "text-red-500" },
              { bg: "bg-purple-500/10", hover: "group-hover:bg-purple-500/20", text: "text-purple-500" },
              { bg: "bg-blue-500/10", hover: "group-hover:bg-blue-500/20", text: "text-blue-500" }
            ];
            const color = colors[index % colors.length];
            
            return (
              <Card 
                key={category.id}
                className="border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 ${color.bg} ${color.hover} rounded-lg flex items-center justify-center transition-colors duration-300`}>
                      <i className={`${category.icon} ${color.text} text-xl`} />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-800 ml-4">{category.name}</h4>
                  </div>
                  <p className="text-slate-600 mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {(category as any).resourceCount || "0"} Resources
                    </span>
                    <ArrowRight className={`h-4 w-4 ${color.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
