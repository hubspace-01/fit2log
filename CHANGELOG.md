# Changelog

## [1.7.1] - 2025-10-08

### Security
- Enabled RLS on all tables (programs, exercises, workout_sessions, logs)
- Added user_id filtering in frontend queries
- Implemented data isolation by telegram_id
- Added JWT token generation in Edge Function (foundation for v2.0)

### Fixed
- Fixed getPrograms() to require userId parameter
- Fixed deleteProgram() to verify ownership
- Fixed ProgramEditor to receive userId as prop
- Fixed TypeScript compilation errors

### Changed
- Refactored usePrograms hook to manage userId state
- Updated RLS policies with fallback for MVP compatibility

### Documentation
- Added docs/SECURITY.md with current implementation details

### Notes
- Current security level suitable for <100 users
- Strict RLS planned for v2.0
- Ready for production MVP deployment
