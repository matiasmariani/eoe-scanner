# Code Validation Skill

This skill automates the process of ensuring the codebase meets the project's quality standards for types and linting.

## Workflow

When the user asks to "validate", "check code", or "run tests", follow these steps:

1. **Initial Validation**:
   - Run `npm run validate`. This command combines `tsc --noEmit` (type checking) and `eslint .` (linting).

2. **Handling Failures**:
   - If `npm run validate` fails:
     - If the failure is linting-related, run `npm run lint:fix` followed by `npm run format`.
     - If the failure is type-related, investigate the errors in the logs and attempt to fix them manually using the `Edit` tool.

3. **Final Verification**:
   - Run `npm run validate` one last time to ensure all issues are resolved.

4. **Reporting**:
   - Inform the user of the final outcome. If errors persist, list them clearly.

## Commands Reference

- Validation: `npm run validate`
- Lint Fix: `npm run lint:fix`
- Formatting: `npm run format`
