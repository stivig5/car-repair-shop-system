# Car Repair Shop Management System 

A comprehensive web application designed to streamline operations in a car repair shop. This project was developed as my **Engineering Diploma Thesis** at Częstochowa University of Technology.

It features a 3-role system (Admin, Mechanic, Client) and integrates with **Telegram** for real-time notifications.

## 🛠 Tech Stack

- **Backend:** Java 21, Spring Boot (Security, Data JPA, Web)
- **Frontend:** React.js, Tailwind CSS, Axios
- **Database:** PostgreSQL
- **Integrations:** Telegram Bot API
- **Tools:** Docker, Maven, Git

## ✨ Key Features

- **Role-Based Access Control (RBAC):** Secure login for Admins, Mechanics, and Clients (JWT).
- **Telegram Integration:** Clients receive push notifications about repair status updates.
- **Appointment Booking:** Interactive calendar for scheduling repairs.
- **Repair History:** Full digital log of previous services and parts used.
- **Dashboard:** Visual statistics for shop management.

## 🚀 How to Run

1. Clone the repository.
2. Configure `application.properties` with your database credentials.
3. Run the backend: `mvn spring-boot:run`
4. Run the frontend: `npm install` then `npm start`
