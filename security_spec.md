# Security Specification for Land Management System

## Data Invariants
1. A User must have a unique ID.
2. Mobile numbers must be valid strings.
3. Contract amounts and PWR balances must be numeric and non-negative (generally).
4. `expireDate` must be a valid date string.
5. `withdrawals` must be a list of objects containing date and amount.
6. Only verified users can perform CRUD operations.

## The "Dirty Dozen" Payloads (Red Team Audit)

1. **Identity Spoofing**: Attempt to create a user with a spoofed `id` in the data map.
2. **Privilege Escalation**: Attempt to update `amount` or `pwrBalance` without going through the designated withdrawal/collection actions (via a generic update that bypasses `hasOnly`).
3. **Data Poisoning (Huge String)**: Attempt to set `name` to a 1MB string.
4. **Invalid Type Injection**: Attempt to set `amount` to a boolean.
5. **Orphaned Writes**: Attempt to add a withdrawal without a valid parent user document (though it's a field, we consider the update integrity).
6. **Bypassing Verification**: Attempt to write as a signed-in user whose email is NOT verified.
7. **Shadow Field Injection**: Attempt to update a user with a field like `isAdmin: true`.
8. **Malicious ID Injection**: Attempt to create a user with a document ID containing special characters like `../../../etc/passwd`.
9. **Zero-Amount Withdrawal Bypass**: Attempt to withdraw -1000 to increase balance.
10. **State Skipping**: Attempt to reactivate a user via a field update that isn't allowed.
11. **PII Leak**: Attempt to read all users as an unverified user.
12. **Denial of Wallet**: Attempt to flood the `history` or `withdrawals` array with millions of empty objects.

## Conflict Report

| Path | Identity Spoofing | State Shortcutting | Resource Poisoning |
| :--- | :--- | :--- | :--- |
| `/users/{userId}` | Blocked by `isVerified()` | Blocked by `hasOnly()` checks | Blocked by `.size()` and type checks |
