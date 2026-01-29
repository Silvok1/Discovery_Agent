import { Project } from '@/api/contracts';
import { BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-brand-dark">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Owner</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Modified</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white">Created</th>
            <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap px-6 py-4">
                <Link href={`/projects/${project.id}`} className="hover:underline">
                  <div className="text-sm font-medium text-brand-dark">{project.name}</div>
                  {project.description && <div className="text-xs text-gray-500">{project.description}</div>}
                </Link>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={cn(
                  "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                  project.status === 'Live' ? "bg-green-100 text-green-800" :
                  project.status === 'Draft' ? "bg-gray-100 text-gray-800" :
                  project.status === 'Ready' ? "bg-blue-100 text-blue-800" :
                  "bg-red-100 text-red-800"
                )}>
                  {project.status}
                </span>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{project.owner}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(project.updatedAt).toLocaleDateString()}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(project.createdAt).toLocaleDateString()}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button className="text-gray-400 hover:text-brand-teal">
                  <BarChart2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
