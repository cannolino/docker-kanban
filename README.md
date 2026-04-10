# Docker Kanban

A clean Vue 3 Kanban board with drag-and-drop support, local storage persistence, and static deployment using nginx.

## Features

- Minimal, responsive Kanban UI
- Drag and drop cards between columns
- Add and delete cards from any column
- Board state persists in browser local storage
- Production-ready Docker image with `nginx:alpine`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Build the project for production:

```bash
npm run build
```

## Docker

Build the Docker image:

```bash
docker build -t docker-kanban .
```

Run the container:

```bash
docker run -p 8080:80 docker-kanban
```

Open `http://localhost:8080` in your browser.

## Notes

- The board state is saved automatically in local storage.
- Use the reset button to restore the default board content.
