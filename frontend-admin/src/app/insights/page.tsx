'use client';

import { BarChart3, TrendingUp, Users, MessageSquare, Lightbulb } from 'lucide-react';

export default function InsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Insights</h1>
        <p className="text-gray-500">Analytics and insights from your discovery interviews.</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="rounded-lg border-2 border-dashed border-brand-teal/30 bg-brand-light/20 p-8 text-center">
        <Lightbulb className="mx-auto h-12 w-12 text-brand-teal" />
        <h2 className="mt-4 text-lg font-semibold text-brand-dark">Insights Dashboard Coming Soon</h2>
        <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
          We're building powerful analytics to help you discover patterns across interviews,
          identify automation opportunities, and track discovery progress.
        </p>
      </div>

      {/* Preview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">Total Interviews</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">Participants</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">Insights Extracted</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">--</p>
              <p className="text-sm text-gray-500">Automation Opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Planned Features */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Planned Features</h3>
        <ul className="space-y-3 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-teal flex-shrink-0" />
            <span><strong>Theme Detection:</strong> Automatically identify common pain points and themes across interviews</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-teal flex-shrink-0" />
            <span><strong>Sentiment Analysis:</strong> Track emotional responses to identify areas of frustration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-teal flex-shrink-0" />
            <span><strong>Time Analysis:</strong> Understand how much time is spent on manual tasks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-teal flex-shrink-0" />
            <span><strong>ROI Calculator:</strong> Estimate potential savings from automation opportunities</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
