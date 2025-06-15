import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Users, BookOpen, MessageSquare, Activity, TrendingUp } from "lucide-react";
import type { Category, Resource, Contact } from "@shared/schema";

interface DashboardStats {
  totalCategories: number;
  totalResources: number;
  totalContacts: number;
}

export default function Dashboard() {
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  const isLoading = categoriesLoading || resourcesLoading || contactsLoading;

  const stats: DashboardStats = {
    totalCategories: categories.length,
    totalResources: resources.length,
    totalContacts: contacts.length,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Database className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">3-Tier Application Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              DevOps Platform Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Real-time data from PostgreSQL database
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <Activity className="h-3 w-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Categories
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalCategories}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              DevOps learning categories
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Resources
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalResources}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Learning resources available
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Database
            </CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              PostgreSQL
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connected & Active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Contacts
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalContacts}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              User inquiries received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Categories Data
            </CardTitle>
            <CardDescription>
              Live data from categories table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No categories found
                </p>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {category.id}
                        </Badge>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resources Table */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Resources Data
            </CardTitle>
            <CardDescription>
              Live data from resources table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {resources.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No resources found
                </p>
              ) : (
                resources.map((resource) => (
                  <div key={resource.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          ID: {resource.id}
                        </Badge>
  
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {resource.description}
                      </p>
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 mt-1 inline-block"
                        >
                          View Resource →
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Table */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Contact Messages
          </CardTitle>
          <CardDescription>
            Live data from contacts table - User inquiries and feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {contacts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No contact messages yet
              </p>
            ) : (
              contacts.map((contact) => (
                <div key={contact.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        ID: {contact.id}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {contact.subject}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'No date'}
                      </span>
                    </div>
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {contact.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          ({contact.email})
                        </span>
                      </div>
                      {(contact.contact || contact.address) && (
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                          {contact.contact && <span>📞 {contact.contact}</span>}
                          {contact.address && <span>📍 {contact.address}</span>}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {contact.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Info */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            3-Tier Architecture Demo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold mb-2">Presentation Tier</h3>
              <p className="text-sm opacity-90">
                React frontend with modern UI components, responsive design, and real-time data display
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold mb-2">Application Tier</h3>
              <p className="text-sm opacity-90">
                Node.js/Express backend with RESTful APIs, business logic, and data validation
              </p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <h3 className="font-semibold mb-2">Data Tier</h3>
              <p className="text-sm opacity-90">
                PostgreSQL database with structured data, relationships, and persistent storage
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}