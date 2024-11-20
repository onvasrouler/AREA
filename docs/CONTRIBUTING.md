
# Contributing to EpiTrello

Thank you for your interest in contributing to EpiTrello! Please follow the guidelines below to ensure smooth collaboration.

---

## How to Contribute

### 1. Reporting Bugs or Suggesting Features
- **Bug Reports**: Use the **Bug Report** issue template to provide detailed information about the issue, including steps to reproduce, expected behavior, and any relevant screenshots or logs.
- **Feature Requests**: Use the **New Feature** issue template to describe your suggestion in detail. Include examples, screenshots, or links to documentation if available.

### 2. Opening a Branch and Linking to an Issue
- Once your issue is created, open a new branch following this naming convention:
  ```
  [issue-number]-[short-description]
  ```
  Example:
  ```
  42-add-user-authentication
  ```
- Link your branch to the issue in your commit messages or directly in the pull request.

### 3. Submitting a Pull Request (PR)
- Follow the **Pull Request Template**:
  - Include a clear description of your changes.
  - Reference the related issue using `Fixes #[issue-number]`.
- Ensure your branch is up-to-date with `main` before submitting the PR.

---

## Commit Messages

We use **gitmojis** for our commit messages to easily identify the purpose of each commit. Please keep the following in mind:

- Use an appropriate gitmoji for each commit. For example:
  - ✨: Feature implementation
  - 🐛: Bug fix
  - 📝: Documentation changes
  - 🔧: Configuration changes
  - 🎨: Code structure improvements

- **Commit messages should not exceed 100 characters.**

- Follow the format:
  ```
  :gitmoji: Commit message (max 100 characters)
  ```

- Example:
  ```
  ✨ Add user authentication to the API
  ```

---

## Pull Request Checklist

Before requesting a review, ensure the following:
- [ ] You have performed a self-review of your code.
- [ ] If it is a core feature, you have added thorough tests.
- [ ] You have followed the style guidelines of the project.
- [ ] All existing and new tests pass locally.
- [ ] Your commit messages follow the gitmoji convention.
- [ ] If necessary, documentation has been updated.

---

We look forward to your contributions!
