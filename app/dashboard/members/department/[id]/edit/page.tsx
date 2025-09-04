"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Department } from "@/lib/types";
import { DepartmentForm } from "@/components/forms/department-form";
import { getDepartmentById, updateDepartment } from "@/services/members-service";

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

export default function DepartmentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartmentById(id).then((data) => {
      if (!data) {
        setDepartment(MOCK_DEPARTMENTS.find((d) => d.id === id) || null);
      } else {
        setDepartment(data);
      }
    });
  }, [id]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    // Update mock data in localStorage for demo
    let departments = JSON.parse(localStorage.getItem('departments') || 'null') || MOCK_DEPARTMENTS;
    departments = departments.map((d: Department) => d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d);
    localStorage.setItem('departments', JSON.stringify(departments));
    setLoading(false);
    router.push(`/dashboard/members/department/${id}`);
  };

  if (!department) return <div className="p-6">Department not found.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <DepartmentForm
        department={department}
        onSubmit={handleSubmit}
        loading={loading}
        onCancel={() => router.push(`/dashboard/members/department/${id}`)}
      />
    </div>
  );
} 