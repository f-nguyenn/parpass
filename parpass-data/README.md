# ParPass Data

Python-based ML models and analytics for the ParPass golf membership platform.

## Tech Stack

- **Language**: Python 3.9+
- **ML Framework**: scikit-learn
- **Data Processing**: pandas, numpy
- **Visualization**: matplotlib, seaborn
- **Notebooks**: Jupyter

## Quick Start

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Jupyter notebook
jupyter notebook
```

## Project Structure

```
parpass-data/
├── venv/                           # Python virtual environment
├── api.py                          # FastAPI recommendation service
├── recommendation_model.ipynb      # ML model development
├── recommendation_model.pkl        # Trained model
├── parpass_analysis.ipynb          # Data analysis notebook
└── member_similarity_heatmap.png   # Visualization output
```

## Features

### Course Recommendation Engine

The recommendation model suggests courses to members based on:

- Member's play history
- Skill level and preferences
- Course characteristics
- Similar member behavior (collaborative filtering)

### Analytics

- Member engagement analysis
- Course popularity metrics
- Usage pattern identification
- Churn prediction indicators

## Recommendation API

The `api.py` file provides a FastAPI service for real-time recommendations:

```bash
# Start the API
uvicorn api:app --reload --port 8000
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/recommendations/{member_id}` | Get course recommendations |
| GET | `/similar-members/{member_id}` | Find similar members |
| GET | `/health` | Health check |

## Notebooks

### recommendation_model.ipynb

Develops the course recommendation model:
1. Data extraction from PostgreSQL
2. Feature engineering
3. Model training (collaborative filtering)
4. Evaluation and tuning
5. Model export

### parpass_analysis.ipynb

Exploratory data analysis:
- Member demographics
- Course utilization patterns
- Seasonal trends
- Tier comparison

## Model Training

```python
# Load and prepare data
import pandas as pd
from sklearn.neighbors import NearestNeighbors

# Train model
model = NearestNeighbors(n_neighbors=5, metric='cosine')
model.fit(member_course_matrix)

# Save model
import pickle
with open('recommendation_model.pkl', 'wb') as f:
    pickle.dump(model, f)
```

## Database Connection

Connect to the ParPass PostgreSQL database:

```python
import psycopg2
import pandas as pd

conn = psycopg2.connect(
    dbname='parpass',
    host='localhost',
    port=5432
)

df = pd.read_sql('SELECT * FROM golf_utilization', conn)
```

## Dependencies

Create a `requirements.txt`:

```
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
psycopg2-binary>=2.9.0
matplotlib>=3.7.0
seaborn>=0.12.0
jupyter>=1.0.0
fastapi>=0.100.0
uvicorn>=0.23.0
```

## Development

### Adding New Models

1. Create notebook in `parpass-data/`
2. Develop and validate model
3. Export trained model as `.pkl`
4. Add endpoint to `api.py`

### Running Analysis

```bash
# Activate environment
source venv/bin/activate

# Start Jupyter
jupyter notebook

# Open desired notebook
```
