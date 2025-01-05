# Project Management Platform

## Overview
This project is a platform designed for managing projects and tasks, similar to Trello, developed as part of the *Service-Oriented Architectures and NoSQL Databases* course for the 2024/2025 academic year. The platform supports various roles, including Project Manager and Project Member, and utilizes microservices architecture for different system functionalities.

## System Components
1. **Client Application**: A graphical interface for user interactions.
2. **Server Application**: A microservices architecture consisting of the following services:
   - **Users**: Manages user credentials and roles.
   - **Projects**: Manages project data.
   - **Tasks**: Handles task statuses and dependencies.
   - **Notifications**: Sends and manages user notifications.
   - **Workflow**: Manages task dependencies.

## Functional Requirements
- User Registration, Login, and Account Deletion.
- Project Creation and Member Management.
- Task Management (Create, Assign, Update Status).
- Workflow Management and Display.
- Notifications for Task and Project Updates.
- Data Analytics for Project Tasks.

## Non-functional Requirements
- Microservice-based design with API Gateway.
- Containerization with Docker.
- Fault Tolerance and Resilience using various mechanisms.

## Technologies Used
- **Backend**: Go
- **Database**: MongoDB (Document-based), Cassandra (Wide-column)
- **Infrastructure**: Docker
