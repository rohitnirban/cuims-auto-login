# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-02-05

### Added
- Initial release of Cuims Auto Login.
- Automatically logs in to CUIMS and LMS.
- Saves credentials locally.
- Provides direct login buttons.
- Handles CAPTCHA automatically.
- Secure storage of credentials.
- Added GitHub button linking to the repository.
- Added feedback button linking to the feedback form.
- Added Firebase integration for saving feedback.
- Added GitHub issue templates for bug reports and feature requests.
- Added LICENSE file.
- Added README file.
- Added .gitignore file.
- Add message prompting users to reopen the extension for direct login buttons
- Optimize wait times in element detection and captcha recognition

### Changes
- Update UI styles for better layout


## [1.0.1] - 2025-02-09

### Changed
- Auto login scripts updated
- Update permissions in `manifest.json`.
- Enhance user guidance for first-time use
- Remove web_accessible_resources entry for wait.html from manifest.json

## [1.1.0] - 2025-02-21

### Changed
- Improved CAPTCHA handling algorithm.
- Updated UI for better user experience.
- Refactored code for better maintainability.
- Updated documentation with new features and changes.
- Removed waiting for scripts to load

### Fixed
- Fixed issue with CAPTCHA recognition on slow networks.
- Fixed bug causing occasional login failures.