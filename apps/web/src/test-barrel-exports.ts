/**
 * Test file to verify barrel exports work correctly
 * This file demonstrates the usage of the barrel exports
 */

// Test imports from different barrel exports
import { 
  Button, 
  Card, 
  Header, 
  cn, 
  useAuth, 
  useToast, 
  type User, 
  type Task,
  Dashboard 
} from '@/'

// Test that the imports work
console.log('Button:', Button)
console.log('Card:', Card)
console.log('Header:', Header)
console.log('cn function:', cn)
console.log('useAuth hook:', useAuth)
console.log('useToast hook:', useToast)
console.log('Dashboard component:', Dashboard)
console.log('User type:', User)
console.log('Task type:', Task)

// Test that type imports work
const user: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
}

const task: Task = {
  id: '1',
  title: 'Test Task',
  description: 'A test task',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
}

console.log('Test objects created successfully:', { user, task })