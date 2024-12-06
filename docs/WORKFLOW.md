
# WORKFLOW.md - CI/CD Workflow for AREA Project

## Overview
This document details the Continuous Integration and Deployment (CI/CD) workflow for the **AREA** project. It uses **GitHub Actions** to automate building, testing, deploying documentation, mirroring repositories, and more.

### Workflow Triggers
The workflow is triggered by:
- **pull_request** on the `main` branch.
- **push** on the `main` branch after a pull request is merged.

### Workflow Structure
The workflow consists of multiple jobs that handle distinct responsibilities, including frontend, backend, documentation deployment, repository mirroring, and more.

## ASCII Diagram of Workflow:

```
                              +--------------------------+
                              |    pull_request (main)   |
                              +--------------------------+
                                            |
                                            v
    +-------------------------+---------------------------+-------------------------+
    |         Frontend        |          Mobile           |         Backend         |
    |      (Lint, Build)      |         (Build)           |  (Lint, Build, Tests)   |
    +-------------------------+---------------------------+-------------------------+
                |                           |                           |
                +---------------------------+---------------------------+
                                            |
                                            v
                              +---------------------------+
                              |    Deploy Documentation   |
                              |    (Update GitHub Wiki)   |
                              +---------------------------+
                                            |
                                            v
                              +---------------------------+
                              |        Mirroring          |
                              |   (Sync repository with   |
                              |   external target repo)   |
                              +---------------------------+
                                            |
                                            v
                              +---------------------------+
                              |        Future Jobs        |
                              |  (e.g., Mobile, Ansible)  |
                              +---------------------------+
```

### Jobs and Steps

#### 1. **Frontend**
- **Triggered by**: `pull_request` or `push` on `main`
- **Runs on**: `ubuntu-latest`
- **Purpose**: Build and lint the frontend code.
- **Steps**:
  1. **Setup Node.js**: Installs Node.js version 21.x.
  2. **Install Dependencies**: Installs all required npm packages.
  3. **Run Lint**: Ensures code follows linting standards.
  4. **Run Build**: Builds the frontend application.

#### 2. **Backend**
- **Triggered by**: `pull_request` or `push` on `main`
- **Runs on**: `ubuntu-latest`
- **Purpose**: Build, lint, and test the backend code.
- **Steps**:
  1. **Setup Node.js**: Installs Node.js version 21.x.
  2. **Install Dependencies**: Installs all required npm packages for the backend.
  3. **Run Lint**: Ensures code follows linting standards.
  4. **Run Tests**: Execute backend tests to ensure reliability.
  5. **Run Build**: Builds the backend application.

#### 3. **Mobile**
- **Triggered by**: `pull_request` or `push` on `main`
- **Runs on**: `ubuntu-latest`
- **Purpose**: Build, check the dependencies.
- **Steps**:
  1. **Setup Java 17**: Install Java temurin.
  2. **Check flutter version**: Check the installed flutter version.
  3. **Install the dependencies**: Installs all required packages for the mobile versiob.
  4. **Run Build**: Builds the mobile application.

#### 4. **Deploy Documentation**
- **Triggered by**: Completion of `frontend` and `backend` jobs
- **Runs on**: `ubuntu-latest`
- **Purpose**: Update project documentation on the GitHub Wiki.
- **Steps**:
  1. **Clone the Wiki**: Access the GitHub Wiki repository.
  2. **Deploy Documentation**: Copy documentation files to the Wiki directory.
  3. **Commit and Push Changes**: If changes are detected, they are committed and pushed to the Wiki.

#### 5. **Mirroring**
- **Triggered by**: Completion of all previous jobs (Frontend, Backend, and Deploy Documentation)
- **Runs on**: `ubuntu-latest`
- **Purpose**: Mirror the repository to an external location.
- **Steps**:
  1. **Clone Repository**: Clone the current repository with full commit history.
  2. **Mirror to Target**: Push all changes to the external target repository using `pixta-dev/repository-mirroring-action`.

### Future Jobs
1. **Ansible**
   - **Purpose**: Automate deployment or server configuration using Ansible.
   - **Status**: To be added.

## Key Features
- **Linting and Building**:
  - Ensures both frontend and backend meet coding standards and build successfully.
- **Automated Documentation Deployment**:
  - Updates GitHub Wiki with the latest project documentation.
- **Repository Mirroring**:
  - Keeps a backup repository in sync for redundancy or external access.

## Example Workflow Output
When a pull request is opened or merged on the `main` branch:
1. The frontend and backend jobs run simultaneously to lint, build, and test the code.
2. Once these jobs are completed successfully:
   - Documentation is updated on the GitHub Wiki.
   - The repository is mirrored to the external target.
3. Future mobile and Ansible jobs can be executed as needed.

### Notes
- Make sure the `secrets.GH_TOKEN` and `secrets.SSH_PRIVATE_KEY` are correctly configured for accessing private repositories and Wiki updates.
- Ensure backend tests are added in the `backend` job for robust validation.

This workflow provides a modular, scalable CI/CD setup for the AREA project, ensuring code quality and seamless documentation and repository management.
