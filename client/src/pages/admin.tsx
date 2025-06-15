import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ResourceForm from "@/components/admin/resource-form";
import ResourceList from "@/components/admin/resource-list";
import { ArrowLeft, Plus, Users, MessageSquare, Folder } from "lucide-react";
import type { Category, Resource, Contact } from "@shared/schema";

export default function Admin() {
  const [showResourceForm, setShowResourceForm] = useState(false);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const { data: contacts = [] } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-800">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contact Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="resources" className="space-y-6">
          <TabsList>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Resource Management</h2>
              <Button onClick={() => setShowResourceForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </div>

            {showResourceForm ? (
              <ResourceForm
                onCancel={() => setShowResourceForm(false)}
                onSuccess={() => setShowResourceForm(false)}
              />
            ) : (
              <ResourceList />
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
            </div>
            <div className="grid gap-4">
              {categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <i className={`${category.icon} mr-2 text-primary`} />
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Contact Messages</h2>
            <div className="grid gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{contact.subject}</CardTitle>
                    <div className="text-sm text-slate-600">
                      From: {contact.name} ({contact.email})
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{contact.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
