# 3D Driving Game

A 3D driving game built with Three.js and Vite.

## Features

- 3D car model with customizable colors
- Realistic driving physics
- Collision detection with environment objects
- Health system with 5 hearts
- Game over screen when all hearts are lost
- Sound effects
- Mobile support with joystick controls
- Customizable joystick position (bottom-right, bottom-left, or bottom-center)

## Development

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/driving-game.git
cd driving-game
```

2. Install dependencies

```bash
npm install
# or
yarn
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Controls

### Desktop
- **W / ↑** - Accelerate
- **S / ↓** - Brake/Reverse
- **A / ←** - Turn Left
- **D / →** - Turn Right
- **Space** - Handbrake

### Mobile
- **Joystick Up** - Accelerate
- **Joystick Down** - Brake/Reverse
- **Joystick Left/Right** - Steer

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Docker Deployment

### Using Docker Compose (Recommended)

1. Make sure you have Docker and Docker Compose installed on your system.

2. Build and start the container:

```bash
docker-compose up -d
```

3. Access the game at `http://localhost:3000`

4. To stop the container:

```bash
docker-compose down
```

### Using Docker Directly

1. Build the Docker image:

```bash
docker build -t driving-game .
```

2. Run the container:

```bash
docker run -d -p 3000:3000 --name driving-game driving-game
```

3. Access the game at `http://localhost:3000`

4. To stop the container:

```bash
docker stop driving-game
docker rm driving-game
```

### Environment Variables

You can customize the port by setting the `PORT` environment variable in the `.env` file or when running the container:

```bash
# Using docker-compose
PORT=8080 docker-compose up -d

# Using docker directly
docker run -d -p 8080:3000 -e PORT=8080 --name driving-game driving-game
```

Note: When using Docker directly, you need to map the host port to the container port (3000).

## License

MIT
