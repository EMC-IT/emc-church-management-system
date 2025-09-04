"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Department } from "@/lib/types";
import { DepartmentForm } from "@/components/forms/department-form";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "@/services/members-service";
import { Plus, Edit, Eye, Trash } from "lucide-react";
import { useRouter } from "next/navigation";

const MOCK_DEPARTMENTS: Department[] = [
  {
    id: '1',
    name: 'Media Department',
    description: 'Handles all media, sound, and technical needs during services and events.',
    leader: 'Samuel Owusu',
    members: ['m1', 'm2', 'm3'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-01-10T09:00:00Z',
    updatedAt: '2023-06-15T12:00:00Z',
  },
  {
    id: '2',
    name: 'Music Department',
    description: 'Coordinates worship, choir, and music ministry activities.',
    leader: 'Abena Mensah',
    members: ['m4', 'm5', 'm6', 'm7'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-02-05T10:00:00Z',
    updatedAt: '2023-06-20T14:00:00Z',
  },
  {
    id: '3',
    name: 'Protocol Department',
    description: 'Ensures order, hospitality, and smooth flow of church services.',
    leader: 'Kwame Boateng',
    members: ['m8', 'm9'],
    departmentType: 'Administrative',
    status: 'Active',
    createdAt: '2023-03-12T11:00:00Z',
    updatedAt: '2023-06-25T16:00:00Z',
  },
  {
    id: '4',
    name: 'Children’s Ministry',
    description: 'Ministers to children and coordinates Sunday School activities.',
    leader: 'Esi Asare',
    members: ['m10', 'm11', 'm12', 'm13', 'm14'],
    departmentType: 'Functional',
    status: 'Active',
    createdAt: '2023-04-01T12:00:00Z',
    updatedAt: '2023-06-30T18:00:00Z',
  },
  {
    id: '5',
    name: 'Finance Department',
    description: 'Manages church finances, budgets, and financial reporting.',
    leader: 'Kojo Appiah',
    members: ['m15', 'm16'],
    departmentType: 'Administrative',
    status: 'Inactive',
    createdAt: '2023-05-10T13:00:00Z',
    updatedAt: '2023-07-05T20:00:00Z',
  },
];

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // TODO: Replace with real API call
    getDepartments().then((data) => {
      if (!data || data.length === 0) {
        setDepartments(MOCK_DEPARTMENTS);
      } else {
        setDepartments(data);
      }
    });
  }, []);

  const filteredDepartments = departments.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (dept: Department) => {
    setEditing(dept);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this department?")) {
      setLoading(true);
      await deleteDepartment(id);
      setDepartments(departments.filter((d) => d.id !== id));
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    if (editing) {
      const updated = await updateDepartment(editing.id, data);
      setDepartments(departments.map((d) => (d.id === editing.id ? updated : d)));
    } else {
      const created = await createDepartment(data);
      setDepartments([created, ...departments]);
    }
    setShowForm(false);
    setEditing(null);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Departments</h1>
          <p className="text-muted-foreground">Manage church departments and their members</p>
        </div>
        <Button onClick={handleAdd} className="bg-brand-primary hover:bg-brand-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>
      <div className="flex items-center mb-4">
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      {showForm && (
        <DepartmentForm
          department={editing || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditing(null); }}
          loading={loading}
        />
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <span className="text-xs text-muted-foreground">{dept.departmentType || "Department"}</span>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/members/department/${dept.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)} disabled={loading}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{dept.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span>Leader</span>
                <span className="font-medium">{dept.leader}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Status</span>
                <span className="font-medium">{dept.status || "Active"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Members</span>
                <span className="font-medium">{dept.members.length}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 