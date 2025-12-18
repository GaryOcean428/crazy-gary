'use client'

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useZodForm } from '@/hooks/use-zod-form'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { Loader2, Bot, Eye, EyeOff, Sparkles, ArrowRight, Zap } from 'lucide-react'

export function Login() {
  const form = useZodForm(loginSchema)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    setError('')
    setLoading(true)

    try {
      const result = await login(data.email, data.password)
      
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You have been successfully logged in.",
          duration: 3000,
        })
        navigate('/')
      } else {
        setError(result.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // Set demo values and trigger validation
    form.setValue('email', 'demo@crazy-gary.ai')
    form.setValue('password', 'demo123')
    setLoading(true)
    
    // Simulate demo login
    setTimeout(async () => {
      try {
        const result = await login('demo@crazy-gary.ai', 'demo123')
        if (result.success) {
          toast({
            title: "Demo mode activated!",
            description: "Exploring Crazy-Gary with demo account.",
            duration: 3000,
          })
          navigate('/')
        }
      } catch {
        setError('Demo login failed')
      } finally {
        setLoading(false)
      }
    }, 1500)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-muted h-12 w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-chart-1/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-up">
          {/* Enhanced Logo and Title */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-primary rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative p-4 bg-card rounded-full border shadow-soft group-hover:shadow-lg transition-all duration-300">
                  <Bot className="h-10 w-10 text-primary" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-chart-1 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Crazy-Gary
              </h1>
              <p className="text-muted-foreground text-lg">
                Enterprise Agentic AI Platform
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-primary">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Powered by AI • Secured • Scalable</span>
              </div>
            </div>
          </div>

          {/* Enhanced Login Form */}
          <Card className="glass-effect shadow-strong border-border/50 hover:shadow-xl transition-all duration-500">
            <CardHeader className="space-y-3 pb-6">
              <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
              <CardDescription className="text-center text-base">
                Enter your credentials to access your AI workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in slide-up">
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                    <span className="sr-only"> (required)</span>
                  </Label>
                  <Input
                    {...form.register('email')}
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    disabled={loading}
                    aria-required="true"
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={form.formState.errors.email ? "email-error" : undefined}
                    className={`h-12 text-base transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                      form.formState.errors.email ? 'border-red-500 focus:ring-red-500/20' : ''
                    }`}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500 mt-1" id="email-error" role="alert">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                    <span className="sr-only"> (required)</span>
                  </Label>
                  <div className="relative">
                    <Input
                      {...form.register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      disabled={loading}
                      aria-required="true"
                      aria-invalid={!!form.formState.errors.password}
                      aria-describedby={form.formState.errors.password ? "password-error" : "password-help"}
                      className={`h-12 text-base pr-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                        form.formState.errors.password ? 'border-red-500 focus:ring-red-500/20' : ''
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-4 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-describedby="password-help"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                  <p id="password-help" className="text-sm text-muted-foreground">
                    Use at least 8 characters with a mix of letters and numbers
                  </p>
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-gradient-primary hover:shadow-lg transition-all duration-200 group" 
                  disabled={loading || !form.formState.isValid}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Enhanced Demo Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">Or</span>
                </div>
              </div>

              <Button 
                onClick={handleDemoLogin}
                variant="outline" 
                className="w-full h-12 text-base font-medium group hover:bg-accent/50 transition-all duration-200"
                disabled={loading}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Try Demo Account
              </Button>

              <div className="space-y-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
                  >
                    Create account
                  </Link>
                </p>
                
                <div className="text-xs text-muted-foreground">
                  <Link 
                    to="/forgot-password" 
                    className="hover:text-foreground hover:underline transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Demo Info */}
          <Card className="border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 hover:shadow-soft transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Enterprise Demo</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Experience the full power of our AI platform with sample data, 
                  real-time analytics, and advanced features
                </p>
                <div className="flex justify-center space-x-4 text-xs text-primary/80">
                  <span>• Live Dashboard</span>
                  <span>• AI Models</span>
                  <span>• Real-time Data</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

