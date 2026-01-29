'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Project, InterviewInstance } from '@/api/contracts';
import { projectService } from '@/api/services/projectService';
import { instanceService } from '@/api/services/instanceService';
import { InstanceList } from '@/components/features/instances/InstanceList';
import { NewInstanceModal } from '@/components/features/instances/NewInstanceModal';

export default function ProjectInstancesPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [instances, setInstances] = useState<InterviewInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projectsData, instancesData] = await Promise.all([
        projectService.getProjects(),
        instanceService.getInstances(projectId),
      ]);
      const currentProject = projectsData.find((p) => p.id === projectId);
      setProject(currentProject || null);
      setInstances(instancesData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInstance = async (data: { name: string; description: string }) => {
    const newInstance = await instanceService.createInstance(projectId, data);
    setIsModalOpen(false);
    // Navigate directly to the builder for the new instance
    router.push(`/projects/${projectId}/instances/${newInstance.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center">
        <div>Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="rounded p-2 text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-dark">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-500">{project.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Instance
        </button>
      </div>

      <InstanceList projectId={projectId} instances={instances} />

      {isModalOpen && (
        <NewInstanceModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateInstance}
        />
      )}
    </div>
  );
}
