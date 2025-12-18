# Code Review Guidelines

## Overview

Code reviews are a cornerstone of our development process, ensuring code quality, knowledge sharing, and team collaboration. This document provides comprehensive guidelines for conducting effective code reviews.

## Code Review Philosophy

### Core Principles

1. **Quality Over Speed**: Take time to do thorough reviews
2. **Constructive Feedback**: Focus on helping, not criticizing
3. **Knowledge Sharing**: Use reviews as learning opportunities
4. **Consistency**: Apply standards uniformly
5. **Continuous Improvement**: Evolve practices based on experience

### Review Goals

- **Catch bugs** before they reach production
- **Ensure code quality** and maintainability
- **Share knowledge** across the team
- **Maintain consistency** with project standards
- **Improve security** and performance
- **Welcome new contributors** and help them learn

## Review Process

### Reviewer Selection

#### Automatic Assignment
```yaml
# .github/CODEOWNERS
# Frontend components
/apps/web/src/components/    @frontend-team @tech-lead

# Backend API
/apps/api/src/               @backend-team @tech-lead

# Database migrations
/apps/api/src/migrations/    @dba-team @tech-lead

# Documentation
/docs/                       @docs-team @tech-lead

# DevOps and deployment
/infra/                      @devops-team @tech-lead
```

#### Manual Assignment
- **Domain Experts**: For specialized areas (security, performance)
- **Architecture**: For design decisions and patterns
- **Accessibility**: For UI/UX changes
- **Performance**: For optimization changes

### Review Timeline

| Change Type | First Response | Full Review | Follow-up |
|-------------|----------------|-------------|-----------|
| Small Bug Fix | 2 hours | 4 hours | 1 hour |
| Documentation | 1 hour | 4 hours | 30 minutes |
| Feature | 8 hours | 24 hours | 4 hours |
| Major Refactor | 24 hours | 72 hours | 8 hours |
| Security Changes | 1 hour | 12 hours | 2 hours |

### Review Checklist

#### Initial Review (First Pass)
- [ ] **Scope**: Does the PR match its description?
- [ ] **Architecture**: Does the approach make sense?
- [ ] **Functionality**: Does the code do what it's supposed to?
- [ ] **Tests**: Are there adequate tests?
- [ ] **Documentation**: Is the code documented?

#### Deep Review (Second Pass)
- [ ] **Code Quality**: Style, naming, structure
- [ ] **Edge Cases**: Error handling, unusual inputs
- [ ] **Performance**: Computational complexity, memory usage
- [ ] **Security**: Input validation, authentication, authorization
- [ ] **Accessibility**: For UI changes (WCAG compliance)

## Review Categories

### Critical Issues (Must Fix)

#### Security Vulnerabilities
```javascript
// ❌ Bad: SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ Good: Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
```

#### Data Exposure
```javascript
// ❌ Bad: Exposing sensitive data
return {
  id: user.id,
  email: user.email,
  password: user.password, // Never expose passwords
  ssn: user.ssn // Never expose SSN
};

// ✅ Good: Only return safe data
return {
  id: user.id,
  email: user.email,
  profile: {
    name: user.name,
    avatar: user.avatar
  }
};
```

#### Memory Leaks
```javascript
// ❌ Bad: Potential memory leak
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  
  // Missing cleanup!
}, []);

// ✅ Good: Proper cleanup
useEffect(() => {
  const interval = setInterval(() => {
    fetchData();
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

### Important Issues (Should Fix)

#### Performance Problems
```javascript
// ❌ Bad: O(n²) complexity
const findDuplicates = (arr) => {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
};

// ✅ Good: O(n) complexity
const findDuplicates = (arr) => {
  const seen = new Set();
  const duplicates = new Set();
  
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  
  return Array.from(duplicates);
};
```

#### Code Duplication
```javascript
// ❌ Bad: Repeated validation logic
const validateEmail = (email) => {
  if (!email || !email.includes('@')) {
    throw new Error('Invalid email');
  }
};

const createUser = (userData) => {
  validateEmail(userData.email); // Duplicated
  // ... user creation logic
};

const updateUser = (userData) => {
  validateEmail(userData.email); // Duplicated again
  // ... user update logic
};

// ✅ Good: Shared validation utility
const validators = {
  email: (email) => {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }
  }
};

const createUser = (userData) => {
  validators.email(userData.email);
  // ... user creation logic
};

const updateUser = (userData) => {
  validators.email(userData.email);
  // ... user update logic
};
```

#### Poor Error Handling
```javascript
// ❌ Bad: Silent failures
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  } catch (error) {
    console.error(error);
    return null; // Silent failure
  }
};

// ✅ Good: Proper error handling
const fetchUserData = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('Network error: Please check your connection');
    }
    
    throw new Error(`Failed to fetch user data: ${error.message}`);
  }
};
```

### Style Issues (Nice to Fix)

#### Naming Conventions
```javascript
// ❌ Bad: Poor naming
const d = new Date();
const u = users.find(x => x.id === userId);
const temp = u?.profile?.bio;

// ✅ Good: Clear naming
const currentDate = new Date();
const targetUser = users.find(user => user.id === userId);
const userBio = targetUser?.profile?.bio;
```

#### Function Length
```javascript
// ❌ Bad: Too long
const processUserRegistration = async (userData) => {
  // 50+ lines of validation, creation, notification, logging...
};

// ✅ Good: Modular approach
const processUserRegistration = async (userData) => {
  const validatedData = validateUserData(userData);
  const user = await createUser(validatedData);
  await sendWelcomeEmail(user);
  await logRegistration(user);
  return user;
};
```

## Feedback Styles

### Constructive Feedback Examples

#### For Bugs
```
🐛 Potential Issue:
The authentication check here might not catch all cases where
a user should be redirected. Consider adding a more comprehensive
validation for the session token.

💡 Suggestion:
What if we use the existing auth middleware instead of duplicating
the validation logic here?
```

#### For Design Decisions
```
🏗️ Architecture:
This approach works, but I'm wondering if we should consider
using a state management library for this complex state logic.

🤔 Discussion:
Have you considered the trade-offs between keeping this local
state vs. moving it to a global store? I'd be happy to discuss
the pros and cons.
```

#### For Performance
```
⚡ Performance:
This loop could become slow with large datasets. Consider using
a Map for O(1) lookups instead of the current O(n) approach.

📊 Impact:
With 10k items, this could take ~500ms. A Map would reduce it
to ~1ms.
```

#### For Testing
```
🧪 Testing:
Great test coverage! One suggestion: we should also test the
error case where the API returns a 500 error.

🔧 Example:
it('should handle server errors gracefully', async () => {
  mockApiServerError();
  const result = await fetchUserData();
  expect(result).toEqual({ error: 'Server error' });
});
```

### Positive Reinforcement

```
✨ Excellent work on the error handling! The try/catch blocks
make the code very robust.

🎯 Great use of TypeScript here - the type safety will prevent
many potential bugs.

🚀 Nice performance optimization! The caching implementation
will really help with repeated requests.

📝 Excellent documentation! The JSDoc comments make this
function very easy to understand and use.
```

### Questions and Suggestions

#### Asking Questions
```
❓ Question:
I'm not familiar with this algorithm. Could you explain how
the complexity works in this edge case?

🤔 Unclear:
I'm not sure I understand the logic here. Could you add a
comment explaining the reasoning behind this approach?
```

#### Offering Alternatives
```
💡 Alternative:
What if we refactored this to use a more functional approach?

Example:
const processData = pipe(
  validateInput,
  transformData,
  saveToDatabase
);

This would make the flow clearer and easier to test.
```

## Review Response Guidelines

### For Contributors

#### Responding to Feedback

```
✅ Implemented:
- Added input validation as suggested
- Extracted reusable function
- Improved error messages

❓ Question:
I'm not sure about the performance impact of your suggestion.
Could you help me understand the trade-offs better?

🙏 Thanks:
Great suggestion! I hadn't considered that edge case.
The refactored version is much cleaner.
```

#### When You Disagree
```
🤝 Alternative View:
I understand your concern, but I think the current approach
has some advantages:

1. It's more explicit about what's happening
2. It easier to debug if something goes wrong
3. The performance difference is negligible for our use case

What do you think about keeping it as is, but adding better
documentation to explain the choice?
```

#### Asking for Help
```
🆘 Need Help:
I'm not sure how to implement this suggestion. Could you
provide a code example or point me to similar code in the
project?

🔍 Clarification:
Could you elaborate on what you mean by "extract this logic"?
I'm not sure which specific part should be moved.
```

### For Reviewers

#### Following Up
```
✅ Great! That implementation is much cleaner.

🎉 Perfect! All my concerns have been addressed.

👍 Looks good to me. Ready to merge.
```

#### Escalating Issues
```
🚨 Blocked:
This approach has security implications that need to be
discussed with the security team. Let's schedule a meeting.

📋 Follow-up:
This is a good solution for now, but let's create a follow-up
issue to refactor this when we have more time.
```

## Review Tools and Techniques

### GitHub Review Features

#### Inline Comments
```javascript
// Add specific feedback on lines
const user = await User.findById(userId);
// Consider adding error handling here
```

#### Suggestion Mode
```javascript
// You can suggest specific code changes
// ```suggestion
// const user = await User.findById(userId);
// if (!user) throw new Error('User not found');
// return user;
// ```
```

#### File-level Comments
```
Overall approach looks good! A few suggestions:

1. Consider adding unit tests for the edge cases
2. The error messages could be more user-friendly
3. We should add rate limiting for this endpoint
```

### Review Categories

#### Security Review
- Input validation and sanitization
- Authentication and authorization
- Data encryption and protection
- SQL injection prevention
- XSS protection

#### Performance Review
- Algorithm complexity
- Database query optimization
- Memory usage patterns
- Network request efficiency
- Caching strategies

#### Accessibility Review
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management

#### Maintainability Review
- Code organization and structure
- Naming conventions
- Documentation quality
- Test coverage
- Dependency management

## Special Review Scenarios

### Large PRs (500+ lines)

#### Strategy
1. **High-level Review**: Focus on architecture and approach
2. **Chunk Review**: Break into logical sections
3. **Follow-up Reviews**: Schedule multiple review sessions
4. **Pair Review**: Two reviewers collaborate

#### Communication
```
This is a substantial change that will need multiple review
sessions. Let's schedule a call to discuss the overall
architecture first, then dive into the details.
```

### Legacy Code Changes

#### Approach
1. **Understand Context**: Learn why code was written that way
2. **Incremental Improvements**: Make small, safe changes
3. **Test Thoroughly**: Ensure changes don't break existing functionality
4. **Document Decisions**: Record why changes were made

### Experimental Features

#### Guidelines
1. **Focus on Safety**: Ensure changes can't break production
2. **Encourage Experimentation**: Allow some flexibility
3. **Document Assumptions**: Record what needs validation
4. **Plan for Removal**: Consider how to undo if needed

## Review Metrics and Improvement

### Quality Metrics
- **Time to First Response**: < 24 hours
- **Review Completion**: < 72 hours
- **Rereview Rate**: < 20% of changes
- **Bug Detection**: Bugs caught in review vs. production

### Team Improvement
- **Review Training**: Regular sessions on effective reviewing
- **Pattern Sharing**: Discuss common issues and solutions
- **Tool Evolution**: Improve review tools and processes
- **Mentorship**: Pair experienced reviewers with newcomers

### Review Effectiveness

#### Signs of Good Reviews
- Bugs caught before production
- Knowledge shared across team
- Code quality consistently improving
- New contributors welcomed and guided

#### Areas for Improvement
- Reviews taking too long
- Same issues repeatedly appearing
- Contributors feeling discouraged
- Knowledge silos developing

## Best Practices Summary

### For Reviewers
1. **Be Thorough**: Take time to understand the changes
2. **Be Constructive**: Focus on helping, not criticizing
3. **Be Timely**: Respond promptly to review requests
4. **Be Consistent**: Apply standards fairly across all PRs
5. **Be Educational**: Share knowledge and explain decisions

### For Contributors
1. **Write Clear PRs**: Make it easy to understand your changes
2. **Self-Review**: Catch obvious issues before requesting review
3. **Be Responsive**: Address feedback promptly
4. **Ask Questions**: Seek clarification when needed
5. **Stay Positive**: View reviews as opportunities to learn

### For Teams
1. **Set Expectations**: Define review timelines and standards
2. **Provide Tools**: Use good review tools and processes
3. **Share Knowledge**: Use reviews as learning opportunities
4. **Improve Continuously**: Evolve practices based on experience
5. **Celebrate Success**: Acknowledge good reviews and contributions

---

## Summary

Effective code reviews are essential for:

- **Code Quality**: Ensuring high standards
- **Knowledge Sharing**: Distributing expertise across the team
- **Bug Prevention**: Catching issues before production
- **Team Collaboration**: Building a strong development culture
- **Continuous Learning**: Improving skills and practices

Remember: **The goal of code review is not to find fault, but to build better software together.**