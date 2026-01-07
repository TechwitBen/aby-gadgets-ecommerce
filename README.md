# E-commerce Project

A full-stack e-commerce application built with modern web technologies.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Guidelines](#guidelines)
- [Code Standards](#code-standards)
- [Deployment](#deployment)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL/MongoDB (depending on your database choice)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/ecommerce-project.git
cd ecommerce-project
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
# Copy example env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files with your credentials
```

4. Set up the database:

```bash
pnpm --filter backend db:migrate
pnpm --filter backend db:seed
```

5. Start development servers:

```bash
pnpm dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Project Structure

```
ecommerce-project/
├── frontend/          # React/Next.js frontend application
├── backend/           # Node.js/Express backend API
├── admin/             # Admin dashboard (optional)
├── shared/            # Shared types and utilities
├── docs/              # Additional documentation
└── scripts/           # Utility scripts
```

## Development Workflow

### Branch Naming Convention

Follow this pattern for branch names:

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Urgent production fixes
- `refactor/what-is-refactored` - Code refactoring
- `docs/what-is-documented` - Documentation updates
- `test/what-is-tested` - Test additions or updates

**Examples:**

- `feature/add-payment-integration`
- `bugfix/fix-cart-total-calculation`
- `refactor/optimize-product-query`

### Commit Message Convention

We will be following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**

```bash
feat(auth): add JWT token refresh mechanism

fix(cart): resolve item quantity update bug

docs(readme): update installation instructions

refactor(product): simplify product filtering logic
```

### Pull Request Process

1. **Create a feature branch** from `develop`:

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **Make your changes** and commit regularly:

```bash
git add .
git commit -m "feat(scope): description"
```

3. **Keep your branch updated** with develop:

```bash
git fetch origin
git rebase origin/develop
```

4. **Push your branch**:

```bash
git push origin feature/your-feature-name
```

5. **Create a Pull Request** on GitHub/GitLab:

   - Use the PR template
   - Fill in all required sections
   - Link related issues
   - Request reviews from at least 2 team members
   - Ensure CI/CD checks pass

6. **Address review feedback**:

   - Make requested changes
   - Push additional commits
   - Re-request review

7. **Merge**:
   - Use "Squash and merge" for feature branches
   - Delete the branch after merging

## Guidelines

### Before You Start

1. Check existing issues and PRs to avoid duplicates
2. For major changes, open an issue first to discuss
3. Ensure you have the latest code from `develop`
4. Read through relevant documentation

### Code Review Process

**We will review eachother's code:**

- Review within 24-48 hours
- Be constructive and respectful
- Ask questions for clarification
- Approve only when confident in the changes
- Check for:
  - Code quality and readability
  - Test coverage
  - Security vulnerabilities
  - Performance implications
  - Breaking changes

### Issue Reporting

When creating an issue, include:

**For Bugs:**

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/error messages
- Environment details (browser, OS, Node version)

**For Features:**

- Clear description of the feature
- Use cases and benefits
- Proposed implementation approach
- Any design mockups or wireframes

## Code Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow the DRY (Don't Repeat Yourself) principle
- Keep functions small and focused (single responsibility)
- Use meaningful variable and function names
- Comment complex logic, not obvious code
- Avoid premature optimization

### JavaScript/TypeScript

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use async/await over promises
- Prefer const over let, never use var
- Use template literals for string concatenation
- Destructure objects and arrays when appropriate

### React Components

- Use functional components with hooks
- Keep components small and reusable
- Use TypeScript interfaces for props
- Extract business logic to custom hooks
- Use meaningful component and prop names

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and sizing
- Use CSS variables for theme values
- Keep specificity low

### API Design

- Use RESTful conventions
- Use proper HTTP methods and status codes
- Version your API (`/api/v1/`)
- Validate all inputs
- Return consistent error responses
- Document endpoints

**Endpoint Structure:**

```
GET    /api/v1/products          # List all products
GET    /api/v1/products/:id      # Get single product
POST   /api/v1/products          # Create product
PUT    /api/v1/products/:id      # Update product
DELETE /api/v1/products/:id      # Delete product
```

### Security Best Practices

- Never commit secrets or API keys
- Validate and sanitize all user inputs
- Use parameterized queries to prevent SQL injection
- Implement rate limiting
- Use HTTPS in production
- Keep dependencies updated
- Implement proper authentication and authorization
- Use CORS appropriately

### Staging

Automatically deployed when merging to `develop` branch.

```bash
# Manual staging deployment
pnpm deploy:staging
```

### Production

Deployed when merging to `main` branch after approval.

```bash
# Manual production deployment
pnpm deploy:production
```

### Environment Variables

Required environment variables for each environment:
can still be edited

**Backend:**

- `DATABASE_URL`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `REDIS_URL`
- `EMAIL_SERVICE_API_KEY`

**Frontend:**

- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_ANALYTICS_ID`

## Git Workflow

We use **Git Flow** workflow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature branches
- `release/*` - Release preparation
- `hotfix/*` - Emergency production fixes

### Daily Workflow

1. Start your day by updating develop:

```bash
git checkout develop
git pull origin develop
```

2. Create your feature branch:

```bash
git checkout -b feature/your-feature
```

3. Work and commit regularly:

```bash
git add .
git commit -m "feat: description"
```

4. Before pushing, rebase with develop:

```bash
git fetch origin
git rebase origin/develop
```

5. Push and create PR:

```bash
git push origin feature/your-feature
```
