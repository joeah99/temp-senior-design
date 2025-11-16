# CI/CD Pipeline Setup

## Overview

This project includes comprehensive CI/CD pipelines using GitHub Actions that automatically run all test suites whenever code is pushed or pull requests are created.

## Workflows

### 1. Main CI/CD Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Pull requests to `main` or `develop` branches
- Direct pushes to `main` or `develop` branches

**Jobs:**

#### Frontend Tests
- Sets up Node.js 20
- Installs dependencies with `--legacy-peer-deps`
- Runs ESLint
- Executes Jest tests with coverage
- Uploads coverage reports to Codecov (optional)

#### Python Backend Tests
- Sets up Python 3.9
- Installs dependencies from `requirements.txt`
- Runs pytest with verbose output
- Generates coverage reports (XML and HTML)

#### .NET Backend Tests
- Sets up .NET SDK 8.0
- Restores NuGet packages
- Builds the solution
- Runs xUnit tests with code coverage
- Uploads test results as artifacts
- Generates coverage reports

#### Build Verification
- Runs after all test suites complete
- Verifies all tests passed successfully
- Provides summary of test execution

### 2. PR Checks Workflow (`.github/workflows/pr-checks.yml`)

**Triggers:**
- Pull requests (opened, synchronized, reopened)

**Jobs:**

#### Test All (Matrix Strategy)
- Runs all three test suites in parallel
- Uses matrix strategy for efficient execution
- Each test suite runs independently

#### Lint and Format
- Runs ESLint for code quality
- Checks TypeScript compilation
- Validates code style

#### Test Summary
- Generates summary of all test results
- Posts summary in PR comments
- Provides quick overview of test status

## Features

### ✅ Automatic Test Execution
- All tests run automatically on PR creation/updates
- No manual intervention required
- Fast feedback loop for developers

### ✅ Parallel Execution
- Test suites run in parallel for faster completion
- Matrix strategy for efficient resource usage

### ✅ Code Coverage
- Coverage reports generated for all test suites
- Optional integration with Codecov
- Coverage artifacts saved for analysis

### ✅ Test Artifacts
- Test results saved as artifacts
- Coverage reports available for download
- Build logs preserved for debugging

### ✅ Status Checks
- PRs require all tests to pass before merge
- Status badges show current build state
- Clear indication of test failures

## Setup Instructions

### 1. Push Workflows to Repository

The workflows are already created in `.github/workflows/`. Simply commit and push:

```bash
git add .github/
git commit -m "Add CI/CD workflows"
git push origin main
```

### 2. Enable GitHub Actions

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Actions** → **General**
3. Ensure "Allow all actions and reusable workflows" is enabled
4. Save changes

### 3. Verify Workflow Execution

1. Create a test pull request
2. Navigate to the **Actions** tab
3. You should see workflows running automatically
4. Check the status of each job

## Workflow Status Badges

Add these badges to your `README.md`:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
![PR Checks](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/PR%20Checks/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

## Branch Protection Rules

To ensure all tests pass before merging, set up branch protection:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select:
   - ✅ Frontend Tests (Jest)
   - ✅ Python Backend Tests (pytest)
   - ✅ .NET Backend Tests (xUnit)
   - ✅ Build Verification

## Test Execution Details

### Frontend Tests
```yaml
- Node.js 20
- npm install --legacy-peer-deps
- npm test -- --passWithNoTests --coverage --watchAll=false
```

### Python Backend Tests
```yaml
- Python 3.9
- pip install -r requirements.txt
- pytest tests/ -v --tb=short
```

### .NET Backend Tests
```yaml
- .NET SDK 8.0
- dotnet restore
- dotnet build
- dotnet test API.Tests/API.Tests.csproj
```

## Troubleshooting

### Tests Failing in CI but Passing Locally

1. **Check Node.js version**: Ensure local version matches CI (20.x)
2. **Check Python version**: Ensure local version matches CI (3.9)
3. **Check .NET version**: Ensure local version matches CI (8.0)
4. **Check dependencies**: Run `npm install --legacy-peer-deps` locally
5. **Check environment variables**: Some tests may need env vars set

### Coverage Reports Not Generating

- Coverage generation is set to `continue-on-error: true`
- Check logs for specific errors
- Coverage is optional and won't fail the build

### Workflow Not Triggering

1. Ensure workflows are in `.github/workflows/` directory
2. Check file names end with `.yml` or `.yaml`
3. Verify branch names match workflow triggers
4. Check GitHub Actions is enabled in repository settings

## Customization

### Adding New Test Suites

To add a new test suite, add a new job in `ci.yml`:

```yaml
new-test-suite:
  name: New Test Suite
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Setup environment
      # ... setup steps
    - name: Run tests
      run: # ... test command
```

### Modifying Test Commands

Update the `run:` steps in each job to modify test execution:

```yaml
- name: Run tests
  run: npm test -- --custom-flag
```

### Adding Notifications

Add notification steps to workflows:

```yaml
- name: Notify on failure
  if: failure()
  uses: actions/github-script@v7
  with:
    script: |
      // Send notification
```

## Best Practices

1. ✅ **Keep workflows fast**: Use caching and parallel execution
2. ✅ **Fail fast**: Stop on first test failure if needed
3. ✅ **Clear error messages**: Use descriptive step names
4. ✅ **Artifact important files**: Save test results and coverage
5. ✅ **Use matrix strategy**: For multiple versions/environments
6. ✅ **Cache dependencies**: Speed up workflow execution

## Monitoring

### View Workflow Runs
- Go to **Actions** tab in GitHub
- View all workflow runs and their status
- Click on a run to see detailed logs

### View Test Results
- Download artifacts from workflow runs
- View coverage reports in artifacts
- Check test summaries in PR comments

## Next Steps

1. ✅ Push workflows to repository
2. ✅ Enable GitHub Actions
3. ✅ Create test PR to verify execution
4. ✅ Set up branch protection rules
5. ✅ Add status badges to README
6. ⏳ Configure Codecov (optional)
7. ⏳ Set up deployment workflows (if needed)

## Support

For issues or questions:
1. Check workflow logs in GitHub Actions
2. Review test output for specific errors
3. Verify local tests pass before pushing
4. Check GitHub Actions documentation

