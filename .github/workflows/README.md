# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for continuous integration and deployment.

## Workflows

### 1. `ci.yml` - Main CI/CD Pipeline

**Triggers:**
- Pull requests to `main` or `develop` branches
- Pushes to `main` or `develop` branches

**Jobs:**
1. **frontend-tests** - Runs Jest tests for Next.js/React frontend
2. **python-backend-tests** - Runs pytest tests for FastAPI backend
3. **dotnet-backend-tests** - Runs xUnit tests for .NET backend API
4. **build-check** - Verifies all test suites completed successfully

**Features:**
- Code coverage reporting
- Test result artifacts
- Parallel execution for faster feedback

### 2. `pr-checks.yml` - Pull Request Checks

**Triggers:**
- Pull requests (opened, synchronized, reopened)

**Jobs:**
1. **test-all** - Runs all test suites in parallel using matrix strategy
2. **lint-and-format** - Code quality checks (ESLint, TypeScript)
3. **test-summary** - Generates summary of test results

**Features:**
- Matrix strategy for parallel test execution
- Code quality validation
- Test summary in PR comments

## Requirements

### Frontend Tests
- Node.js 20+
- npm dependencies installed

### Python Backend Tests
- Python 3.9+
- Dependencies from `requirements.txt`

### .NET Backend Tests
- .NET SDK 8.0
- NuGet packages restored

## Running Tests Locally

### Frontend
```bash
npm install --legacy-peer-deps
npm test
```

### Python Backend
```bash
cd Backend/python-backend
pip install -r requirements.txt
pytest tests/ -v
```

### .NET Backend
```bash
cd Backend/API.Tests
dotnet restore
dotnet test
```

## Status Badges

Add these badges to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/PR%20Checks/badge.svg)
```

## Workflow Status

- ✅ All workflows are configured and ready
- ✅ Tests run automatically on PR creation/updates
- ✅ Test results are reported in PR comments
- ✅ Coverage reports are generated (where applicable)

