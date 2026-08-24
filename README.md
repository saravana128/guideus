# 📋 Guide Us

**A modern, feature-rich Todo List application built with React and Appwrite**

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Appwrite Setup](#-appwrite-setup)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**Guide Us** is a task management application that helps users stay organized and productive. It allows users to create, manage, and track their tasks with a clean and intuitive user interface. Each task includes a title, description, due date, status tracking, and the ability to attach reference images.

---

## ✨ Features

| Feature                    | Description                                                   |
| -------------------------- | ------------------------------------------------------------- |
| ✅ **Create Tasks**        | Add new tasks with title, description, and due date           |
| 📝 **Edit Tasks**          | Update task details at any time                               |
| 🗑️ **Delete Tasks**        | Remove tasks that are no longer needed                        |
| ✔️ **Mark as Completed**   | Quickly toggle task completion status                         |
| 📅 **Due Dates**           | Set and track due dates for each task                         |
| 🏷️ **Task Status**         | Manage task status (Pending, In Progress, Completed, Overdue) |
| 🖼️ **Reference Images**    | Attach reference images to tasks for visual context           |
| 🔐 **User Authentication** | Secure login and registration via Appwrite                    |
| 📱 **Responsive Design**   | Works seamlessly on desktop, tablet, and mobile               |
| 🔍 **Search & Filter**     | Find tasks quickly with search and status filters             |

---

## 🛠️ Tech Stack

### Frontend

| Technology                                    | Purpose                 |
| --------------------------------------------- | ----------------------- |
| [React](https://react.dev/)                   | UI Library              |
| [React Router](https://reactrouter.com/)      | Client-side Routing     |
| [Tailwind CSS](https://tailwindcss.com/)      | Styling & UI Framework  |
| [Vite](https://vitejs.dev/)                   | Build Tool & Dev Server |
| [Appwrite SDK](https://appwrite.io/docs/sdks) | Backend Communication   |

### Backend

| Technology                       | Purpose                          |
| -------------------------------- | -------------------------------- |
| [Appwrite](https://appwrite.io/) | Backend-as-a-Service (BaaS)      |
| Appwrite Auth                    | User Authentication & Management |
| Appwrite Database                | Data Storage & Retrieval         |
| Appwrite Storage                 | File & Image Storage             |

---

## 📁 Project Structure

```
GuideUs/
├── scripts/
│   └── setup-appwrite.js        # Appwrite resource setup script
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Loader.jsx
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Footer.jsx
│   │   └── tasks/
│   │       ├── TaskCard.jsx
│   │       ├── TaskForm.jsx
│   │       ├── TaskList.jsx
│   │       └── TaskFilter.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTasks.js
│   ├── lib/
│   │   └── appwrite.js
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   └── TaskPage.jsx
│   ├── services/
│   │   ├── authService.js
│   │   ├── taskService.js
│   │   └── storageService.js
│   ├── utils/
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Appwrite](https://appwrite.io/) (Cloud or Self-hosted)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/guideus.git
   cd GuideUs
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and fill in your Appwrite details:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=guideus_db
   VITE_APPWRITE_TASKS_COLLECTION_ID=tasks
   VITE_APPWRITE_STORAGE_ID=task_attachments
   ```

4. **Run the Appwrite setup script** (optional — creates database, collection, indexes, and storage bucket)

   Create an API key in your Appwrite project with permissions for **Databases** and **Storage**, then run:

   ```bash
   npm run setup:appwrite
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Appwrite Setup

You can set up Appwrite resources automatically using the included setup script, or manually through the Appwrite Console.

### Automatic Setup (Recommended)

1. Create an API key in your Appwrite project with permissions for **Databases** and **Storage**.
2. Add the API key to your `.env` file as `APPWRITE_API_KEY`.
3. Run the setup script:
   ```bash
   npm run setup:appwrite
   ```

### Manual Setup

#### 1. Create a Project

1. Go to [Appwrite Console](https://cloud.appwrite.io/console)
2. Click **"Create Project"**
3. Name it **GuideUs**

#### 2. Enable Authentication

1. Navigate to **Authentication** → **Settings**
2. Enable **Email/Password** authentication
3. Optionally enable OAuth providers (Google, GitHub, etc.)

#### 3. Create Database

1. Navigate to **Databases** → **Create Database**
2. Name it `guideus_db`

#### 4. Create Tasks Collection

1. Inside the database, create a collection named `tasks`
2. Add the following attributes (see schema below)
3. Enable **Document Security** and set appropriate permissions for authenticated users

#### 5. Create Storage Bucket

1. Navigate to **Storage** → **Create Bucket**
2. Name it `task_attachments`
3. Set permissions to allow authenticated users to upload and read files
4. Allowed file extensions: `jpg`, `jpeg`, `png`, `gif`, `webp`, `svg`
5. Max file size: `10MB`

---

## 🗃️ Database Schema

### Collection: `tasks`

| Attribute     | Type              | Required | Description                                      |
| ------------- | ----------------- | -------- | ------------------------------------------------ |
| `title`       | String (max 255)  | ✅ Yes   | Task title                                       |
| `description` | String (max 5000) | ❌ No    | Detailed task description                        |
| `status`      | Enum              | ✅ Yes   | `pending`, `in_progress`, `completed`, `overdue` |
| `dueDate`     | Datetime          | ✅ Yes   | Task due date and time                           |
| `completed`   | Boolean           | ✅ Yes   | Whether the task is completed                    |
| `userId`      | String            | ✅ Yes   | Owner user ID (relationship)                     |
| `imageUrl`    | String            | ❌ No    | Reference image file ID from storage             |
| `createdAt`   | Datetime          | ✅ Yes   | Auto-generated creation timestamp                |
| `updatedAt`   | Datetime          | ✅ Yes   | Auto-generated update timestamp                  |

### Indexes

| Index Name       | Attributes            | Type | Purpose                        |
| ---------------- | --------------------- | ---- | ------------------------------ |
| `idx_user_tasks` | `userId`, `createdAt` | Key  | Fetch user's tasks efficiently |
| `idx_status`     | `status`, `userId`    | Key  | Filter tasks by status         |
| `idx_due_date`   | `dueDate`, `userId`   | Key  | Sort/filter by due date        |

---

## 📡 API Reference

### Authentication

| Method   | Service                        | Description                 |
| -------- | ------------------------------ | --------------------------- |
| `POST`   | `authService.register()`       | Register a new user         |
| `POST`   | `authService.login()`          | Login with email & password |
| `DELETE` | `authService.logout()`         | Logout current session      |
| `GET`    | `authService.getCurrentUser()` | Get logged-in user info     |

### Tasks

| Method   | Service                                | Description                |
| -------- | -------------------------------------- | -------------------------- |
| `GET`    | `taskService.listTasks(userId)`        | Fetch all tasks for a user |
| `GET`    | `taskService.getTask(taskId)`          | Fetch a single task        |
| `POST`   | `taskService.createTask(data)`         | Create a new task          |
| `PATCH`  | `taskService.updateTask(taskId, data)` | Update an existing task    |
| `DELETE` | `taskService.deleteTask(taskId)`       | Delete a task              |
| `PATCH`  | `taskService.toggleComplete(taskId)`   | Toggle task completion     |

### Storage

| Method   | Service                              | Description              |
| -------- | ------------------------------------ | ------------------------ |
| `POST`   | `storageService.uploadImage(file)`   | Upload a reference image |
| `GET`    | `storageService.getImageUrl(fileId)` | Get image preview URL    |
| `DELETE` | `storageService.deleteImage(fileId)` | Delete an uploaded image |

---

## 📜 Available Scripts

| Command                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| `npm run dev`            | Runs the app in development mode                                   |
| `npm start`              | Alias for `npm run dev`                                            |
| `npm run build`          | Builds the app for production                                      |
| `npm run lint`           | Lints the codebase                                                 |
| `npm run format`         | Formats code with Prettier                                         |
| `npm run setup:appwrite` | Creates Appwrite database, collection, indexes, and storage bucket |

---

## 🔒 Environment Variables

### Frontend (`.env`)

```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id

# Database Configuration
VITE_APPWRITE_DATABASE_ID=guideus_db
VITE_APPWRITE_TASKS_COLLECTION_ID=tasks

# Storage Configuration
VITE_APPWRITE_STORAGE_ID=task_attachments
```

### Setup Script (`.env` or environment)

```env
APPWRITE_API_KEY=your_api_key_with_database_and_storage_permissions
```

---

## 🎨 UI Components

### Task Card

Displays individual task information including:

- Title & truncated description
- Status badge (color-coded)
- Due date with overdue indicator
- Reference image thumbnail (if attached)
- Quick action buttons (edit, delete, mark complete)

### Task Form

Modal-based form for creating/editing tasks:

- Title input (required)
- Rich description textarea
- Date & time picker for due date
- Status dropdown
- Image upload with preview

### Task Filter

Filter and sort tasks by:

- Status (All, Pending, In Progress, Completed, Overdue)
- Due date range
- Search by title/description

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For questions or issues, please open an issue on the [GitHub repository](https://github.com/yourusername/guideus/issues).

---

<p align="center">Made with ❤️ using React & Appwrite</p>
