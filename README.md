# Sports Prediction System

Multi-sport prediction platform powered by machine learning.

## Overview

Sports Prediction System is a modular platform designed to collect, organize, analyze, and predict sporting events using statistical analysis and machine learning.

The initial supported sports are:

- Football
- Basketball
- Tennis

The architecture is designed to support additional sports as the project evolves.

## Architecture

The project uses a monorepo structure:

```text
sports-prediction-system/
├── apps/
│   └── web/                 # Next.js frontend
├── services/
│   └── api/                 # FastAPI backend
│       ├── alembic/         # Database migrations
│       └── app/
│           ├── api/         # REST API endpoints
│           ├── core/        # Application configuration
│           ├── db/          # Database connection
│           ├── ingestion/   # Sports data ingestion
│           └── models/      # SQLAlchemy models
├── data/                    # Data storage
├── docs/                    # Project documentation
├── infrastructure/          # Infrastructure configuration
├── notebooks/               # Data science notebooks
├── packages/                # Shared packages
├── docker-compose.yml
├── alembic.ini
└── README.md
```

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic

### Database
- PostgreSQL 16

### Data Science and Machine Learning
- NumPy
- Pandas
- Scikit-learn
- XGBoost
- MLflow

## Requirements

Install the following tools before starting:

- Python 3.9+
- Node.js and npm
- Docker Desktop
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd sports-prediction-system
```

### 2. Configure environment variables

Create your local environment file:

```bash
cp .env.example .env
```

Update `.env` with your local database credentials:

```env
POSTGRES_PASSWORD=your_local_password
DATABASE_URL=postgresql+psycopg://sps_user:your_local_password@localhost:5432/sports_prediction
```

Use the same password in both variables.

### 3. Start PostgreSQL

```bash
docker compose up -d postgres
```

Check the container:

```bash
docker compose ps
```

### 4. Configure the backend

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r services/api/requirements.txt
```

Apply database migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
python -m uvicorn app.main:app --reload --app-dir services/api
```

The API will be available at:

http://127.0.0.1:8000

Interactive API documentation:

http://127.0.0.1:8000/docs

### 5. Start the frontend

Open another terminal:

```bash
cd apps/web
npm install
npm run dev
```

The frontend will be available at:

http://localhost:3000

## Current Features

- Multi-sport database architecture.
- Sports, competitions, and seasons management endpoints.
- Participants and matches management endpoints.
- Match statistics management endpoints.
- External data source identification.
- Sports data ingestion architecture.
- Mock sports data provider.
- Initial Next.js frontend.

## Project Status

The project is under active development.

The current focus is building a reliable multi-sport data foundation before implementing prediction models, model evaluation, and advanced analytics.

## License

To be defined.
