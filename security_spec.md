# Security Specification - Classroom Sync

## Data Invariants
1. A session can only be created by a user with the 'teacher' role.
2. Only teachers can update session status to 'completed'.
3. Only the session's teacher can add or delete strokes.
4. Students can only read sessions and strokes.
5. User profiles are only writable by the user themselves.

## The "Dirty Dozen" Payloads
1. Student attempting to start a session.
2. Student attempting to add a stroke to a live session.
3. Teacher attempting to edit another teacher's session.
4. User attempting to change their own role to 'teacher' in their profile.
5. Unauthorized user attempting to read strokes of a private session (if implemented).
6. Student attempting to end a session (status = completed).
7. User attempting to delete a stroke they didn't create.
8. Injection of massive stroke data (size limits).
9. Spoofing `createdAt` timestamp (must use server time).
10. Anonymous user attempting any write.
11. User attempting to create a session for a non-existent teacher.
12. User attempting to read all users' private info.

## Red Team Conflict Report
- Identity Spoofing: Blocked by `request.auth.uid` checks.
- State Shortcutting: Blocked by strict `affectedKeys` and `status` transitions.
- Resource Poisoning: Blocked by `.size()` and validation helpers.
