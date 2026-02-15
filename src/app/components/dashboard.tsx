import React from 'react';
import { StatsGrid } from './dashboard/StatsGrid';
import { RecentActivity } from './dashboard/RecentActivity';
import { UpcomingInterviews } from './dashboard/UpcomingInterviews';
import { SubmissionTrendChart } from './dashboard/SubmissionTrendChart';
import { DepartmentDistributionChart } from './dashboard/DepartmentDistributionChart';

export function Dashboard() {
  return (
    <div className="space-y-4 md:space-y-6 pb-10 md:pb-12">
      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <SubmissionTrendChart />
        <DepartmentDistributionChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentActivity />
        <UpcomingInterviews />
      </div>
    </div>
  );
}
