import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Globe,
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  RefreshCw,
  Bell,
  BarChart3,
  Cpu,
  Memory,
  HardDrive,
  Network,
} from 'lucide-react';

// Real-time monitoring dashboard
export default function MonitoringDashboard() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [dashboardResponse, alertsResponse] = await Promise.all([
        fetch('/api/monitoring/dashboard'),
        fetch('/api/monitoring/alerts')
      ]);
      
      const dashboardData = await dashboardResponse.json();
      const alertsData = await alertsResponse.json();
      
      setDashboardData(dashboardData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to fetch monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading monitoring data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600 mt-1">
              Real-time monitoring and alerting for your application
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setRefreshInterval(prev => prev === 30000 ? 5000 : 30000)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {refreshInterval === 30000 ? 'Fast Refresh' : 'Normal Refresh'}
            </Button>
            <Button onClick={fetchDashboardData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatusCard
            title="System Health"
            value={dashboardData?.health?.status || 'Unknown'}
            icon={CheckCircle}
            color={dashboardData?.health?.status === 'healthy' ? 'green' : 'red'}
            description="Overall system status"
          />
          <StatusCard
            title="Active Alerts"
            value={alerts.length}
            icon={Bell}
            color={alerts.length > 0 ? 'yellow' : 'green'}
            description={alerts.length > 0 ? 'Requires attention' : 'All clear'}
          />
          <StatusCard
            title="Response Time"
            value={`${dashboardData?.stats?.avg_response_time || 0}ms`}
            icon={Clock}
            color={dashboardData?.stats?.avg_response_time < 500 ? 'green' : 'yellow'}
            description="Average API response time"
          />
          <StatusCard
            title="Error Rate"
            value={`${dashboardData?.stats?.error_rate || 0}%`}
            icon={AlertTriangle}
            color={dashboardData?.stats?.error_rate < 5 ? 'green' : 'red'}
            description="Percentage of failed requests"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="incidents">Incidents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewTab dashboardData={dashboardData} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceTab />
          </TabsContent>

          <TabsContent value="infrastructure" className="space-y-6">
            <InfrastructureTab />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AlertsTab alerts={alerts} onRefresh={fetchDashboardData} />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <LogsTab />
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <IncidentsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Status Card Component
function StatusCard({ title, value, icon: Icon, color, description }: any) {
  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <Card className={colorClasses[color]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Overview Tab
function OverviewTab({ dashboardData }: { dashboardData: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Request Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Requests</span>
              <span className="font-mono">{dashboardData?.stats?.total_requests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Success Rate</span>
              <span className="font-mono">{100 - (dashboardData?.stats?.error_rate || 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Average Response Time</span>
              <span className="font-mono">{dashboardData?.stats?.avg_response_time || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span>P95 Response Time</span>
              <span className="font-mono">{dashboardData?.stats?.p95_response_time || 0}ms</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.health?.components?.map((component: any) => (
              <div key={component.name} className="flex items-center justify-between">
                <span>{component.name}</span>
                <Badge variant={component.status === 'healthy' ? 'default' : 'destructive'}>
                  {component.status}
                </Badge>
              </div>
            )) || <div>No health data available</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Performance Tab
function PerformanceTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Web Vitals Performance</CardTitle>
          <CardDescription>Core web vitals metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PerformanceMetric
              name="Largest Contentful Paint"
              value="2.3s"
              target="<2.5s"
              status="good"
              icon={Clock}
            />
            <PerformanceMetric
              name="First Input Delay"
              value="45ms"
              target="<100ms"
              status="good"
              icon={Zap}
            />
            <PerformanceMetric
              name="Cumulative Layout Shift"
              value="0.08"
              target="<0.1"
              status="good"
              icon={Activity}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceMetric({ name, value, target, status, icon: Icon }: any) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4" />
        <Badge variant={status === 'good' ? 'default' : 'destructive'}>
          {status}
        </Badge>
      </div>
      <h4 className="font-medium">{name}</h4>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">Target: {target}</div>
    </div>
  );
}

// Infrastructure Tab
function InfrastructureTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfrastructureMetric
          name="CPU Usage"
          value="45%"
          icon={Cpu}
          status="good"
          trend="up"
        />
        <InfrastructureMetric
          name="Memory Usage"
          value="2.1GB"
          icon={Memory}
          status="good"
          trend="stable"
        />
        <InfrastructureMetric
          name="Disk Usage"
          value="67%"
          icon={HardDrive}
          status="warning"
          trend="up"
        />
        <InfrastructureMetric
          name="Network I/O"
          value="125 MB/s"
          icon={Network}
          status="good"
          trend="stable"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <InfrastructureService
              name="Database"
              status="healthy"
              responseTime="12ms"
              connections="45/100"
            />
            <InfrastructureService
              name="Redis Cache"
              status="healthy"
              responseTime="3ms"
              connections="12/50"
            />
            <InfrastructureService
              name="External APIs"
              status="degraded"
              responseTime="245ms"
              availability="98.5%"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfrastructureMetric({ name, value, icon: Icon, status, trend }: any) {
  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
  };

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Activity,
  };

  const TrendIcon = trendIcons[trend];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-5 w-5 ${statusColors[status]}`} />
          <TrendIcon className={`h-4 w-4 ${statusColors[status]}`} />
        </div>
        <h4 className="font-medium text-sm">{name}</h4>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function InfrastructureService({ name, status, responseTime, connections }: any) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Server className="h-5 w-5" />
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">
            {connections || responseTime}
          </p>
        </div>
      </div>
      <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
        {status}
      </Badge>
    </div>
  );
}

// Alerts Tab
function AlertsTab({ alerts, onRefresh }: { alerts: any[], onRefresh: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Active Alerts</h3>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No Active Alerts</h3>
            <p className="text-gray-600">Your system is running smoothly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <Alert key={index}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.level.toUpperCase()}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}

// Logs Tab
function LogsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Logs</CardTitle>
          <CardDescription>System logs and error tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="outline" size="sm">Errors</Button>
                <Button variant="outline" size="sm">Warnings</Button>
                <Button variant="outline" size="sm">Info</Button>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <div className="text-green-600">[2025-12-17 15:30:45] INFO: System health check passed</div>
                <div className="text-yellow-600">[2025-12-17 15:30:30] WARN: High memory usage detected: 85%</div>
                <div className="text-blue-600">[2025-12-17 15:30:15] INFO: Performance metrics updated</div>
                <div className="text-red-600">[2025-12-17 15:30:00] ERROR: Database connection timeout</div>
                <div className="text-green-600">[2025-12-17 15:29:45] INFO: User authentication successful</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Incidents Tab
function IncidentsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Incident Management</h3>
        <Button>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Create Incident
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold">No Recent Incidents</h3>
          <p className="text-gray-600">All systems are operating normally.</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Monitoring Configuration
          </CardTitle>
          <CardDescription>Configure monitoring thresholds and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-2">Alert Thresholds</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Error Rate (%)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue="5"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Response Time (ms)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue="500"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CPU Usage (%)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue="80"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Memory Usage (%)</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    defaultValue="85"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Notification Channels</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span>Email notifications</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>Slack integration</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span>SMS alerts</span>
                </label>
              </div>
            </div>

            <Button>Save Configuration</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}