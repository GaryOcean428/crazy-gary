import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  DashboardCompound,
  DashboardCard,
  PolymorphicComponents,
  RenderPropPatterns,
  HeadlessComponents,
  SlotPatterns,
  HOCPatterns,
  CompositionUtils
} from '../patterns'

// Enhanced Dashboard using all composition patterns
const EnhancedDashboard = HOCPatterns.withLoading(
  HOCPatterns.withTheme(
    function Dashboard() {
      const [dashboardData, setDashboardData] = useState({
        totalUsers: 1234,
        activeUsers: 892,
        revenue: 45600,
        growth: 12.5,
        recentActivity: [
          { id: 1, user: 'John Doe', action: 'Created a new project', time: '2 hours ago' },
          { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '4 hours ago' },
          { id: 3, user: 'Bob Wilson', action: 'Completed task', time: '6 hours ago' }
        ]
      })

      const { theme } = HOCPatterns.withTheme({} as any) // Get theme from context
      
      return (
        <DashboardCompound layout="grid" columns={3} className="p-6">
          {/* Header with Slots Pattern */}
          <SlotPatterns.Named name="dashboard-header">
            <div className="col-span-full">
              <PolymorphicComponents.Heading level={1} color={theme === 'dark' ? 'primary' : 'primary'}>
                Dashboard Overview
              </PolymorphicComponents.Heading>
              <PolymorphicComponents.Text color="muted" className="mt-2">
                Welcome back! Here's what's happening with your application.
              </PolymorphicComponents.Text>
            </div>
          </SlotPatterns.Named>

          {/* Stats Cards using Compound Components */}
          <DashboardCard
            title="Total Users"
            description="Registered users this month"
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
            actions={
              <Badge variant="secondary" className="bg-white/20 text-white">
                +12%
              </Badge>
            }
          >
            <RenderPropPatterns.RenderProps
              data={dashboardData.totalUsers}
              loading={false}
              error={null}
            >
              {({ data }) => (
                <div className="space-y-2">
                  <PolymorphicComponents.Text size="3xl" weight="bold" className="text-white">
                    {data.toLocaleString()}
                  </PolymorphicComponents.Text>
                  <Progress value={75} className="bg-white/20" />
                </div>
              )}
            </RenderPropPatterns.RenderProps>
          </DashboardCard>

          <DashboardCard
            title="Active Users"
            description="Users active in last 24h"
            className="bg-gradient-to-r from-green-500 to-green-600 text-white"
            actions={
              <Badge variant="secondary" className="bg-white/20 text-white">
                +8%
              </Badge>
            }
          >
            <RenderPropPatterns.RenderProps
              data={dashboardData.activeUsers}
              loading={false}
              error={null}
            >
              {({ data }) => (
                <div className="space-y-2">
                  <PolymorphicComponents.Text size="3xl" weight="bold" className="text-white">
                    {data.toLocaleString()}
                  </PolymorphicComponents.Text>
                  <Progress value={85} className="bg-white/20" />
                </div>
              )}
            </RenderPropPatterns.RenderProps>
          </DashboardCard>

          <DashboardCard
            title="Revenue"
            description="This month's revenue"
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            actions={
              <Badge variant="secondary" className="bg-white/20 text-white">
                +18%
              </Badge>
            }
          >
            <RenderPropPatterns.RenderProps
              data={dashboardData.revenue}
              loading={false}
              error={null}
            >
              {({ data }) => (
                <div className="space-y-2">
                  <PolymorphicComponents.Text size="3xl" weight="bold" className="text-white">
                    ${data.toLocaleString()}
                  </PolymorphicComponents.Text>
                  <Progress value={92} className="bg-white/20" />
                </div>
              )}
            </RenderPropPatterns.RenderProps>
          </DashboardCard>

          {/* Recent Activity using Headless Components */}
          <DashboardCard 
            title="Recent Activity" 
            description="Latest user actions"
            className="col-span-full lg:col-span-2"
          >
            <HeadlessComponents.ListRenderer
              items={dashboardData.recentActivity}
              renderItem={(activity) => (
                <div className="flex items-center space-x-4 py-3 border-b border-gray-200 last:border-b-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {activity.user.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.action}</p>
                  </div>
                  <Badge variant="outline">{activity.time}</Badge>
                </div>
              )}
              keyExtractor={(activity) => activity.id}
            >
              {({ items, count }) => (
                <div className="space-y-1">
                  {items}
                  <div className="pt-3 text-center">
                    <Button variant="outline" size="sm">
                      View All Activity ({count})
                    </Button>
                  </div>
                </div>
              )}
            </HeadlessComponents.ListRenderer>
          </DashboardCard>

          {/* Quick Actions using Render Props */}
          <DashboardCard title="Quick Actions" className="lg:col-span-1">
            <RenderPropPatterns.Toggle initial={false}>
              {({ on, toggle }) => (
                <div className="space-y-3">
                  <Button className="w-full justify-start" onClick={toggle}>
                    {on ? 'Hide' : 'Show'} Settings
                  </Button>
                  {on && (
                    <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        User Management
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        System Config
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Analytics
                      </Button>
                    </div>
                  )}
                  <Button variant="secondary" className="w-full">
                    Create Report
                  </Button>
                  <Button variant="secondary" className="w-full">
                    Export Data
                  </Button>
                </div>
              )}
            </RenderPropPatterns.Toggle>
          </DashboardCard>

          {/* Footer using Slots */}
          <SlotPatterns.Named name="dashboard-footer">
            <div className="col-span-full mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <PolymorphicComponents.Text color="muted" size="sm">
                  Last updated: {new Date().toLocaleString()}
                </PolymorphicComponents.Text>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </SlotPatterns.Named>
        </DashboardCompound>
      )
    }
  )
)

export default EnhancedDashboard