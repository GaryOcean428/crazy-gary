import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Wrench, 
  Globe, 
  Database, 
  Code, 
  Play,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings,
  RefreshCw
} from 'lucide-react'

export function MCPTools() {
  const [tools, setTools] = useState([])
  const [clients, setClients] = useState({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTool, setSelectedTool] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const { toast } = useToast()

  useEffect(() => {
    fetchMCPData()
  }, [])

  const fetchMCPData = async () => {
    setLoading(true)
    try {
      // Fetch all tools
      const toolsResponse = await fetch('/api/mcp/tools')
      if (toolsResponse.ok) {
        const toolsData = await toolsResponse.json()
        setTools(toolsData.tools || [])
      }

      // Fetch client status
      const statusResponse = await fetch('/api/mcp/status')
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        setClients(statusData.clients || {})
      }
    } catch (error) {
      console.error('Failed to fetch MCP data:', error)
      toast({
        title: "Error",
        description: "Failed to load MCP tools",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMCPData()
      return
    }

    try {
      const response = await fetch(`/api/mcp/tools/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
      toast({
        title: "Search Error",
        description: "Failed to search tools",
        variant: "destructive"
      })
    }
  }

  const handleExecuteTool = async (tool) => {
    // This would open a dialog to configure and execute the tool
    setSelectedTool(tool)
    toast({
      title: "Tool Selected",
      description: `Selected ${tool.name} for execution`
    })
  }

  const getClientIcon = (clientName) => {
    switch (clientName) {
      case 'browserbase':
        return <Globe className="h-4 w-4" />
      case 'disco':
        return <Code className="h-4 w-4" />
      case 'supabase':
        return <Database className="h-4 w-4" />
      default:
        return <Wrench className="h-4 w-4" />
    }
  }

  const getClientColor = (clientName) => {
    switch (clientName) {
      case 'browserbase':
        return 'text-blue-500'
      case 'disco':
        return 'text-green-500'
      case 'supabase':
        return 'text-purple-500'
      default:
        return 'text-gray-500'
    }
  }

  const getToolsByClient = (clientName) => {
    return tools.filter(tool => tool.name.startsWith(clientName))
  }

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTabTools = (tab) => {
    switch (tab) {
      case 'browserbase':
        return getToolsByClient('browserbase')
      case 'disco':
        return getToolsByClient('disco')
      case 'supabase':
        return getToolsByClient('supabase')
      default:
        return filteredTools
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Tools</h1>
          <p className="text-muted-foreground">Loading available tools...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MCP Tools</h1>
          <p className="text-muted-foreground">
            Discover and use Model Context Protocol tools
          </p>
        </div>
        
        <Button onClick={fetchMCPData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Client Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>MCP Client Status</span>
          </CardTitle>
          <CardDescription>
            Connection status of Model Context Protocol clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(clients).map(([clientName, status]) => (
              <div key={clientName} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={getClientColor(clientName)}>
                    {getClientIcon(clientName)}
                  </div>
                  <div>
                    <div className="font-medium capitalize">{clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {status.tool_count || 0} tools
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {status.connected ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={status.connected ? 'default' : 'destructive'}>
                    {status.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Tools ({tools.length})</TabsTrigger>
          <TabsTrigger value="browserbase">
            Browser ({getToolsByClient('browserbase').length})
          </TabsTrigger>
          <TabsTrigger value="disco">
            Dev Env ({getToolsByClient('disco').length})
          </TabsTrigger>
          <TabsTrigger value="supabase">
            Database ({getToolsByClient('supabase').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getTabTools(activeTab).map((tool, index) => {
              const clientName = tool.name.split('_')[0]
              
              return (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={getClientColor(clientName)}>
                          {getClientIcon(clientName)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{tool.name}</CardTitle>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {clientName}
                          </Badge>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExecuteTool(tool)}
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm mb-3">
                      {tool.description}
                    </CardDescription>
                    
                    {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">
                          Parameters:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(tool.parameters).slice(0, 3).map((param) => (
                            <Badge key={param} variant="secondary" className="text-xs">
                              {param}
                            </Badge>
                          ))}
                          {Object.keys(tool.parameters).length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{Object.keys(tool.parameters).length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
          
          {getTabTools(activeTab).length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">No Tools Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No tools match your search criteria' : 'No tools available in this category'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('')
                        fetchMCPData()
                      }}
                    >
                      Clear Search
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tool Execution Dialog */}
      {selectedTool && (
        <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className={getClientColor(selectedTool.name.split('_')[0])}>
                  {getClientIcon(selectedTool.name.split('_')[0])}
                </div>
                <span>{selectedTool.name}</span>
              </DialogTitle>
              <DialogDescription>
                {selectedTool.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="text-sm">
                <strong>Parameters:</strong>
              </div>
              
              <ScrollArea className="h-48 w-full border rounded-md p-4">
                <pre className="text-xs">
                  {JSON.stringify(selectedTool.parameters, null, 2)}
                </pre>
              </ScrollArea>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedTool(null)}>
                  Close
                </Button>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Execute Tool
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

