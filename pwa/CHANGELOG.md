# Changelog

All notable changes to InoBill PWA will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-01-03

### Added
- **Firebase Firestore Integration** - Complete cloud-based sharing system
- **UUID-based Short URLs** - Generate short, clean sharing links
- **Automatic Data Expiration** - Data automatically expires after 7 days
- **Cloud Storage** - No more server dependencies or PHP requirements
- **Enhanced Sharing** - Seamless bill sharing across devices and browsers
- **Debug Tools** - Added Firebase debugging utilities for development

### Changed
- **Sharing System** - Completely redesigned from PHP-based to Firebase-based
- **URL Structure** - Changed from long base64 URLs to short UUID-based URLs
- **Data Storage** - Moved from local file storage to cloud Firestore
- **Dependencies** - Removed PHP and server-side requirements

### Removed
- **PHP Dependencies** - No longer requires PHP or server setup
- **File-based Storage** - Removed local file storage system
- **Complex Setup** - Eliminated need for server configuration

### Technical
- **Firebase SDK v12.3.0** - Integrated latest Firebase Firestore
- **Modern Architecture** - Client-side only with cloud backend
- **Improved Performance** - Faster loading and sharing
- **Better Error Handling** - Enhanced error messages and debugging
- **Cleaner Codebase** - Removed unnecessary PHP and server files

## [1.1.0] - 2024-12-25

### Added
- Custom logo integration with proper favicon support
- Card collapse functionality for better space management
- Enhanced header design with feature tags
- Improved mobile responsiveness and padding fixes
- Modern header color scheme with gradient design
- Feature tags showing app capabilities (Real-time, PWA, Fast)

### Changed
- Updated header colors from blue theme to modern slate gradient
- Improved card header padding consistency across all devices
- Enhanced logo styling with proper image handling
- Updated theme colors throughout the application
- Better mobile layout with proper spacing

### Fixed
- Fixed card height independence when collapsed
- Fixed mobile card padding issues
- Fixed container margin and padding consistency
- Improved responsive design for various screen sizes

### Technical
- Updated version to 1.1.0 in all relevant files
- Enhanced CSS with better responsive breakpoints
- Improved PWA manifest with updated theme colors
- Better structured data with version information

## [1.0.0] - 2024-01-01

### Added
- Initial release of InoBill PWA
- Split bill calculation functionality
- Participant management
- Menu item management
- Additional costs handling
- Discount system
- Order management with quantities
- Print functionality
- Share functionality with URL generation
- Download JSON functionality
- PWA installation support
- Offline functionality
- Dark/Light theme toggle
- Responsive design
- Toast notifications
- Local storage persistence
- Service worker for caching

### Features
- Real-time bill splitting calculations
- Fair distribution of costs among participants
- Support for multiple menu items per person
- Additional costs (parking, service charge, etc.)
- Percentage and fixed amount discounts
- Print-friendly bill format
- Shareable links for collaboration
- Progressive Web App capabilities
- Cross-platform compatibility
