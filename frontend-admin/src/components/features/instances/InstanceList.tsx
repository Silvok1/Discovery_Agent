import { InterviewInstance } from '@/api/contracts';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Calendar, Users, MessageSquare, Bot } from 'lucide-react';
import { AGENT_TYPES } from '@/api/contracts';

interface InstanceListProps {
  projectId: string;
  instances: InterviewInstance[];
}

export function InstanceList({ projectId, instances }: InstanceListProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Instance Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Agent Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Participants
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Created
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {instances.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                No interview instances yet. Create one to get started.
              </td>
            </tr>
          ) : (
            instances.map((instance) => (
              <tr key={instance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link
                    href={`/projects/${projectId}/instances/${instance.id}`}
                    className="hover:underline"
                  >
                    <div className="text-sm font-medium text-brand-dark">{instance.name}</div>
                    {instance.objective && (
                      <div className="text-xs text-gray-500 line-clamp-1">{instance.objective}</div>
                    )}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-brand-teal" />
                    <span className="text-sm text-gray-700">
                      {AGENT_TYPES[instance.agentType]?.name || instance.agentType}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 text-xs font-semibold leading-5',
                      instance.status === 'Live'
                        ? 'bg-green-100 text-green-800'
                        : instance.status === 'Draft'
                        ? 'bg-gray-100 text-gray-800'
                        : instance.status === 'Closed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    )}
                  >
                    {instance.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-gray-400" />
                    {instance.participantCount || 0}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {instance.createdAt
                      ? new Date(instance.createdAt).toLocaleDateString()
                      : '--'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/projects/${projectId}/instances/${instance.id}`}
                    className="text-brand-teal hover:text-teal-700"
                  >
                    Configure
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
