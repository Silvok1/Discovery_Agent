'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Project } from '@/api/contracts';
import { projectService } from '@/api/services/projectService';
import { ProjectList } from '@/components/features/projects/ProjectList';
import { NewProjectModal } from '@/components/features/projects/NewProjectModal';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    await projectService.createProject(data);
    setIsModalOpen(false);
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Projects</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center rounded-md bg-brand-teal px-4 py-2 text-white hover:bg-teal-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <ProjectList projects={projects} />
      )}

      {isModalOpen && (
        <NewProjectModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
