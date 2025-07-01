# IA.TEX - Sistema de Gestão para Confecção

## Overview

IA.TEX is a comprehensive management system for textile/clothing manufacturing businesses. It's a full-stack web application designed to handle all aspects of a garment manufacturing operation, from fabric management and pricing calculations to production tracking and order management.

The system provides an integrated solution for small to medium-sized clothing manufacturers, offering modules for fabric inventory, cost calculation, model management, order processing, production tracking, and financial management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS for styling with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Component Architecture**: Modular component design with reusable UI components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript throughout the entire application
- **API Design**: RESTful API architecture with structured route handlers
- **Authentication**: Replit Auth integration with OAuth2 and JWT tokens
- **Session Management**: Express sessions with PostgreSQL storage

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon serverless connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth with OAuth2 flow
- **Session Storage**: PostgreSQL-backed session store
- **User Management**: Complete user profile management with roles
- **Security**: JWT tokens with secure cookie handling

### Fabric Management Module
- **Features**: Complete CRUD operations for fabric inventory
- **Data Structure**: Fabric properties including type, color, composition, weight, dimensions
- **Supplier Integration**: Fabric-supplier relationship management
- **Stock Tracking**: Current stock levels and yield percentage calculations

### Pricing Calculator Module
- **Multi-step Wizard**: Step-by-step pricing calculation interface
- **Garment Types**: Support for different clothing categories
- **Cost Breakdown**: Detailed cost analysis including materials, labor, and overhead
- **Model Integration**: Direct integration with model management system

### Dashboard & Analytics
- **KPI Tracking**: Key performance indicators for business metrics
- **Real-time Data**: Live updates using React Query
- **Visual Components**: Card-based interface for quick insights
- **Navigation Hub**: Central access point to all system modules

### UI Component System
- **Design System**: Consistent design language using shadcn/ui
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Responsive Design**: Mobile-first approach with breakpoint optimization
- **Theme Support**: Light/dark mode with CSS custom properties

## Data Flow

### Client-Server Communication
1. **Frontend**: React components make API calls using TanStack Query
2. **API Layer**: Express.js routes handle requests with authentication middleware
3. **Business Logic**: Service layer processes data and applies business rules
4. **Database**: Drizzle ORM executes type-safe queries against PostgreSQL
5. **Response**: JSON responses with proper error handling and status codes

### Authentication Flow
1. **Login**: User redirects to Replit Auth OAuth2 endpoint
2. **Callback**: Replit Auth returns user data and tokens
3. **Session**: Server creates session stored in PostgreSQL
4. **Authorization**: Protected routes verify session and user permissions
5. **Logout**: Session cleanup and token invalidation

### Data Synchronization
- **Real-time Updates**: React Query handles cache invalidation and background refetching
- **Optimistic Updates**: Immediate UI updates with server reconciliation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Progressive loading indicators throughout the application

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for state management
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Development server and build tool with plugin ecosystem
- **Express.js**: Backend framework with middleware support

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with JIT compilation
- **Radix UI**: Unstyled, accessible component primitives
- **shadcn/ui**: Pre-built component library with customizable themes
- **Lucide React**: Consistent icon library with tree-shaking support

### Database and ORM
- **Drizzle ORM**: Type-safe ORM with excellent TypeScript integration
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle Kit**: Schema management and migration tools

### Authentication and Security
- **Replit Auth**: OAuth2 authentication provider
- **Passport.js**: Authentication middleware with strategy support
- **Express Session**: Session management with PostgreSQL storage
- **Connect PG Simple**: PostgreSQL session store adapter

## Deployment Strategy

### Development Environment
- **Replit Integration**: Optimized for Replit development environment
- **Hot Module Replacement**: Instant development feedback with Vite HMR
- **Development Tools**: Replit-specific plugins and error overlays
- **Environment Variables**: Secure configuration management

### Production Build
- **Frontend Build**: Vite production build with code splitting and optimization
- **Backend Build**: ESBuild for Node.js production bundle
- **Static Asset Serving**: Express static file serving for production
- **Database Migrations**: Automated schema deployment with Drizzle Kit

### Scaling Considerations
- **Database**: Neon's serverless architecture provides automatic scaling
- **Frontend**: Static asset optimization and code splitting for performance
- **Backend**: Stateless design enables horizontal scaling
- **Session Storage**: PostgreSQL-backed sessions support multiple server instances

## Changelog

Changelog:
- July 01, 2025. Initial setup
- July 01, 2025. Fixed fabric image upload system - removed 500 character limit from code and database, images now display correctly in fabric cards

## User Preferences

Preferred communication style: Simple, everyday language.