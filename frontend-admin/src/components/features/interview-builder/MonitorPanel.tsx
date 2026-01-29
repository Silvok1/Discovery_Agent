'use client';

import { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  User,
  Clock,
  CheckCircle2,
  PlayCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Eye,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { instanceService, Participant } from '@/api/services/instanceService';

interface MonitorPanelProps {
  instanceId: string;
  instanceStatus: string;
}

interface SessionSummary {
  participantId: string;
  participantName: string;
  participantEmail: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  startedAt?: string;
  completedAt?: string;
  turnCount: number;
  durationMinutes?: number;
}

export function MonitorPanel({ instanceId, instanceStatus }: MonitorPanelProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [instanceId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const participantData = await instanceService.getParticipants(instanceId);
      setParticipants(participantData);

      // TODO: Load actual session data from API
      // For now, generate mock session summaries from participants
      const mockSessions: SessionSummary[] = participantData.map(p => ({
        participantId: p.id,
        participantName: p.name || 'Unknown',
        participantEmail: p.email,
        status: p.status === 'completed' ? 'completed' :
                p.status === 'started' ? 'in_progress' :
                p.status === 'abandoned' ? 'abandoned' : 'not_started',
        startedAt: p.status !== 'invited' ? new Date(Date.now() - Math.random() * 86400000).toISOString() : undefined,
        completedAt: p.status === 'completed' ? new Date().toISOString() : undefined,
        turnCount: p.status === 'completed' ? Math.floor(Math.random() * 15) + 5 :
                   p.status === 'started' ? Math.floor(Math.random() * 8) : 0,
        durationMinutes: p.status === 'completed' ? Math.floor(Math.random() * 20) + 5 : undefined,
      }));
      setSessions(mockSessions);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Status', 'Started At', 'Completed At', 'Duration (min)', 'Turns'];
    const rows = sessions.map(s => [
      s.participantName,
      s.participantEmail,
      s.status,
      s.startedAt || '',
      s.completedAt || '',
      s.durationMinutes?.toString() || '',
      s.turnCount.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview_responses_${instanceId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToXLSX = () => {
    // For actual XLSX export, you'd use a library like xlsx
    // For now, we'll just export as CSV with .xlsx extension as a placeholder
    exportToCSV();
    alert('Note: Full XLSX support requires the xlsx library. Downloaded as CSV format.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'abandoned':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      abandoned: 'bg-red-100 text-red-700',
      not_started: 'bg-gray-100 text-gray-600',
    };
    return styles[status as keyof typeof styles] || styles.not_started;
  };

  // Stats
  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    inProgress: sessions.filter(s => s.status === 'in_progress').length,
    notStarted: sessions.filter(s => s.status === 'not_started').length,
    abandoned: sessions.filter(s => s.status === 'abandoned').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (instanceStatus === 'Draft') {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
        <Eye className="mx-auto h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-sm font-medium text-gray-900">Instance Not Live</h3>
        <p className="mt-2 text-sm text-gray-500">
          Set the instance to Live to start monitoring responses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">Monitor Responses</h2>
          <p className="text-sm text-gray-500">
            Track participant progress and export interview data.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-brand-dark">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Participants</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-2xl font-bold text-gray-400">{stats.notStarted}</div>
          <div className="text-sm text-gray-500">Not Started</div>
        </div>
      </div>

      {/* Export Options */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Export Data</h3>
            <p className="text-sm text-gray-500">Download response data in your preferred format</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={exportToXLSX}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b px-4 py-3">
          <h3 className="font-medium text-gray-900">Participant Sessions</h3>
        </div>
        {sessions.length === 0 ? (
          <div className="p-8 text-center">
            <User className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No participants yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {sessions.map((session) => (
              <div key={session.participantId}>
                <button
                  type="button"
                  onClick={() => setExpandedSession(
                    expandedSession === session.participantId ? null : session.participantId
                  )}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(session.status)}
                    <div>
                      <div className="font-medium text-gray-900">{session.participantName}</div>
                      <div className="text-sm text-gray-500">{session.participantEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      getStatusBadge(session.status)
                    )}>
                      {session.status.replace('_', ' ')}
                    </span>
                    {expandedSession === session.participantId ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedSession === session.participantId && (
                  <div className="border-t bg-gray-50 px-4 py-3">
                    <dl className="grid gap-3 sm:grid-cols-3 text-sm">
                      <div>
                        <dt className="text-gray-500">Started</dt>
                        <dd className="font-medium text-gray-900">
                          {session.startedAt
                            ? new Date(session.startedAt).toLocaleString()
                            : 'Not started'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Completed</dt>
                        <dd className="font-medium text-gray-900">
                          {session.completedAt
                            ? new Date(session.completedAt).toLocaleString()
                            : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Duration</dt>
                        <dd className="font-medium text-gray-900">
                          {session.durationMinutes
                            ? `${session.durationMinutes} min`
                            : '-'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Turns</dt>
                        <dd className="font-medium text-gray-900">{session.turnCount}</dd>
                      </div>
                    </dl>
                    {session.status === 'completed' && (
                      <div className="mt-3 pt-3 border-t">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm text-brand-teal hover:underline"
                        >
                          <FileText className="h-4 w-4" />
                          View Transcript
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
