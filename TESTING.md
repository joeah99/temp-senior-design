# Testing Guide

This document provides instructions for running tests across all parts of the codebase.

## Overview

The codebase includes comprehensive test suites for:
- **Backend API** (.NET/C#) - xUnit tests
- **Frontend** (Next.js/React/TypeScript) - Jest + React Testing Library
- **Python Backend** (FastAPI) - pytest

## Backend API Tests (.NET)

### Prerequisites
- .NET SDK 8.0 or later

### Running Tests

```bash
cd Backend/API.Tests
dotnet restore
dotnet test
```

### Test Coverage

The backend tests cover:
- **Controllers**: AccountController, AssetController, ValuationController, LoanInformationController
- **Managers**: AccountManager, AssetManager, LoanManager, ValuationManager, AssetDepreciationManager
- **Services**: AssetDepreciationService, LoanInformationService, AssetValuationService

### Test Structure

```
Backend/API.Tests/
├── Controllers/
│   ├── AccountControllerTests.cs
│   ├── AssetControllerTests.cs
│   ├── ValuationControllerTests.cs
│   └── LoanInformationControllerTests.cs
├── Managers/
│   ├── AccountManagerTests.cs
│   ├── AssetManagerTests.cs
│   ├── LoanManagerTests.cs
│   └── ValuationManagerTests.cs
└── Services/
    ├── AssetDepreciationServiceTests.cs
    ├── LoanInformationServiceTests.cs
    └── AssetValuationServiceTests.cs
```

## Frontend Tests (Next.js/React)

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The frontend tests cover:
- **Components**: NavBar, AssetsCard, SelectAssets
- **Pages**: Home page
- **Utils**: Steps utility

### Test Structure

```
src/
├── components/
│   └── __tests__/
│       ├── nav-bar.test.tsx
│       ├── assets-card.test.tsx
│       └── select-assets.test.tsx
├── app/
│   └── __tests__/
│       └── page.test.tsx
└── utils/
    └── __tests__/
        └── steps.test.ts
```

## Python Backend Tests (FastAPI)

### Prerequisites
- Python 3.9+
- pip

### Installation

```bash
cd Backend/python-backend
pip install -r requirements.txt
```

### Running Tests

```bash
cd Backend/python-backend
pytest
```

Or with verbose output:

```bash
pytest -v
```

### Test Coverage

The Python tests cover:
- **Routes**: Commodities, Tax
- **Services**: DotNet client integration

### Test Structure

```
Backend/python-backend/
└── tests/
    ├── __init__.py
    ├── test_commodities.py
    └── test_tax.py
```

## Running All Tests

To run all tests across the entire codebase:

### Backend API
```bash
cd Backend/API.Tests && dotnet test
```

### Frontend
```bash
npm test
```

### Python Backend
```bash
cd Backend/python-backend && pytest
```

## Continuous Integration

Tests are configured to run in CI/CD pipelines. The Azure Pipeline configuration includes test execution steps.

## Writing New Tests

### Backend API (.NET)
- Use xUnit for test framework
- Use Moq for mocking dependencies
- Use FluentAssertions for readable assertions
- Follow the existing test structure

### Frontend (React)
- Use Jest as the test runner
- Use React Testing Library for component testing
- Mock Next.js specific modules (Image, Link) as needed
- Place tests in `__tests__` directories

### Python Backend
- Use pytest for test framework
- Use AsyncMock for async function testing
- Mock external dependencies (like dotnet_api)
- Follow pytest naming conventions

## Test Best Practices

1. **Isolation**: Each test should be independent
2. **Naming**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mocking**: Mock external dependencies and services
5. **Coverage**: Aim for high test coverage of business logic
6. **Maintainability**: Keep tests simple and readable

## Troubleshooting

### Backend API Tests
- Ensure .NET SDK is installed: `dotnet --version`
- Restore packages: `dotnet restore`
- Check for missing dependencies in API.Tests.csproj

### Frontend Tests
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Jest configuration in `jest.config.js`
- Ensure Next.js is properly configured

### Python Tests
- Ensure pytest is installed: `pip install pytest`
- Check Python version: `python --version` (should be 3.9+)
- Verify all dependencies are installed: `pip install -r requirements.txt`

