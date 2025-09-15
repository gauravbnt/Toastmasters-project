# Toastmasters Management System - Frontend

A modern React + Vite frontend application for managing Toastmasters club operations, including members, meetings, agenda items, and member availability tracking.

## Features

### 🏠 Dashboard
- Quick stats overview (total members, active members, upcoming meetings)
- Today's meetings highlight
- Quick action buttons for common tasks

### 👥 Members Management
- Add, edit, and soft delete members
- Active/inactive member filtering
- Search functionality
- Pagination support
- Member roles management

### 📅 Meetings Management
- Schedule, edit, and delete meetings
- Upcoming/past meetings filtering
- Today's meetings highlighting
- Meeting types support

### 📋 Agenda Management
- Create agenda items linked to meetings
- Assign speakers and durations
- Grouped by meeting display
- Edit and delete agenda items

### ⏰ Member Availability
- Track member availability for meetings
- Visual availability statistics
- Real-time availability updates
- Response rate tracking

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   ├── SearchFilter.jsx
│   │   ├── Pagination.jsx
│   │   ├── FormField.jsx
│   │   └── ConfirmDialog.jsx
│   └── layout/          # Layout components
│       └── Navbar.jsx
├── pages/               # Main page components
│   ├── Dashboard.jsx
│   ├── Members.jsx
│   ├── Meetings.jsx
│   ├── Agenda.jsx
│   └── Availability.jsx
├── services/            # API service layer
│   ├── api.js
│   ├── memberService.js
│   ├── meetingService.js
│   ├── agendaService.js
│   └── availabilityService.js
├── hooks/               # Custom React hooks
│   ├── useApi.js
│   └── useFormValidation.js
├── utils/               # Utility functions
│   ├── constants.js
│   └── helpers.js
├── App.jsx
├── main.jsx
└── index.css
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Running Spring Boot backend on `http://localhost:8080`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## API Integration

The application connects to a Spring Boot backend via REST APIs. Update the `API_BASE_URL` in `src/services/api.js` if your backend runs on a different port.

### Expected Backend Endpoints

#### Members
- `GET /api/members` - Get all members
- `POST /api/members` - Create member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members?active=true` - Get active members

#### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/{id}` - Update meeting
- `DELETE /api/meetings/{id}` - Delete meeting
- `GET /api/meetings/upcoming` - Get upcoming meetings
- `GET /api/meetings/past` - Get past meetings

#### Agenda
- `GET /api/agenda` - Get all agenda items
- `POST /api/agenda` - Create agenda item
- `PUT /api/agenda/{id}` - Update agenda item
- `DELETE /api/agenda/{id}` - Delete agenda item
- `GET /api/agenda/meeting/{meetingId}` - Get agenda by meeting

#### Availability
- `GET /api/availability` - Get all availability records
- `POST /api/availability` - Set availability
- `PUT /api/availability/{id}` - Update availability
- `GET /api/availability/meeting/{meetingId}` - Get availability by meeting

## Features Implemented

### ✅ Core Features
- [x] Complete CRUD operations for all entities
- [x] Modern, responsive UI with TailwindCSS
- [x] Client-side form validations
- [x] Loading spinners and error handling
- [x] Toast notifications
- [x] Search and filtering
- [x] Pagination
- [x] Modal dialogs for forms

### ✅ Bonus Features
- [x] Today's meetings highlighting
- [x] Framer Motion animations
- [x] Custom hooks for API calls and form validation
- [x] Reusable components
- [x] TypeScript-ready structure

## Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Update `src/index.css` for global styles
- Component-specific styles use Tailwind utility classes

### API Configuration
- Update `src/services/api.js` for different backend URLs
- Modify service files for different API endpoints

### Adding New Features
1. Create new service in `src/services/`
2. Add new page component in `src/pages/`
3. Update routing in `src/App.jsx`
4. Add navigation link in `src/components/layout/Navbar.jsx`

## Contributing

1. Follow the existing code structure
2. Use TypeScript-style prop validation
3. Implement proper error handling
4. Add loading states for async operations
5. Follow responsive design principles

## License

This project is licensed under the MIT License.
