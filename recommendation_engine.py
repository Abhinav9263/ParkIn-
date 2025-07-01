"""
ParkIn - AI Recommendation Engine
--------------------------------
This module implements the machine learning algorithms for recommending 
optimal parking spots based on user history, location data, and current availability.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

class ParkingRecommender:
    def __init__(self, model_path=None):
        """Initialize the recommendation engine with pretrained model if available"""
        self.features = ['distance', 'price', 'security_rating', 'covered', 'time_of_day', 
                         'day_of_week', 'historical_occupancy', 'user_rating']
        self.scaler = StandardScaler()
        
        if model_path and os.path.exists(model_path):
            print(f"Loading pre-trained model from {model_path}")
            self.model = joblib.load(model_path)
        else:
            print("Initializing new model")
            self.model = RandomForestRegressor(
                n_estimators=100, 
                max_depth=10,
                random_state=42
            )
    
    def preprocess_data(self, data):
        """Preprocess the input data for prediction"""
        # Extract features
        X = pd.DataFrame(data)[self.features]
        
        # Handle categorical features
        X['covered'] = X['covered'].astype(int)
        X['day_of_week'] = pd.Categorical(X['day_of_week'], 
                                          categories=['Monday', 'Tuesday', 'Wednesday', 
                                                      'Thursday', 'Friday', 'Saturday', 'Sunday'])
        X = pd.get_dummies(X, columns=['day_of_week'], drop_first=True)
        
        # Scale numerical features
        num_features = ['distance', 'price', 'security_rating', 'historical_occupancy', 'user_rating']
        X[num_features] = self.scaler.fit_transform(X[num_features])
        
        return X
    
    def train(self, X_data, y_data):
        """Train the recommendation model"""
        X = self.preprocess_data(X_data)
        print(f"Training model on {len(X)} samples")
        self.model.fit(X, y_data)
        
    def save_model(self, path="models/parking_recommender.pkl"):
        """Save the trained model"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        print(f"Model saved to {path}")
    
    def predict_parking_score(self, parking_spots, user_preferences):
        """
        Predict the suitability score for each parking spot based on 
        user preferences and current context
        """
        # Prepare data for prediction
        prediction_data = []
        
        for spot in parking_spots:
            # Combine spot data with context and user preferences
            spot_features = {
                'distance': spot['distance_from_destination'],
                'price': spot['hourly_rate'],
                'security_rating': spot['security_rating'],
                'covered': 1 if spot['is_covered'] else 0,
                'time_of_day': user_preferences['time_of_day'],
                'day_of_week': user_preferences['day_of_week'],
                'historical_occupancy': spot['avg_occupancy'],
                'user_rating': spot['avg_rating']
            }
            prediction_data.append(spot_features)
        
        # Preprocess data
        X_pred = self.preprocess_data(prediction_data)
        
        # Get predictions
        scores = self.model.predict(X_pred)
        
        # Combine with parking spot IDs
        results = []
        for i, score in enumerate(scores):
            results.append({
                'spot_id': parking_spots[i]['id'],
                'score': float(score),
                'spot_data': parking_spots[i]
            })
        
        # Sort by score (descending)
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return results

# Demo function to generate sample training data
def generate_sample_data(n_samples=1000):
    """Generate synthetic data for demonstration"""
    np.random.seed(42)
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    times = ['morning', 'afternoon', 'evening', 'night']
    
    data = {
        'distance': np.random.uniform(0.1, 5.0, n_samples),
        'price': np.random.uniform(1.0, 15.0, n_samples),
        'security_rating': np.random.uniform(1.0, 5.0, n_samples),
        'covered': np.random.choice([0, 1], n_samples),
        'time_of_day': np.random.choice(times, n_samples),
        'day_of_week': np.random.choice(days, n_samples),
        'historical_occupancy': np.random.uniform(0.1, 1.0, n_samples),
        'user_rating': np.random.uniform(1.0, 5.0, n_samples)
    }
    
    # Generate target - user satisfaction score (complex function of features)
    y = (
        5.0 - 0.5 * data['distance'] +  # Closer is better
        -0.2 * data['price'] +          # Cheaper is better
        0.3 * data['security_rating'] + # More secure is better
        0.1 * data['covered'] +         # Covered is slightly preferred
        0.2 * data['user_rating'] +     # Higher rated is better
        np.random.normal(0, 0.5, n_samples)  # Add some noise
    )
    
    # Normalize y to range 0-1
    y = (y - y.min()) / (y.max() - y.min())
    
    return data, y

# Example usage
if __name__ == "__main__":
    # Generate sample data
    print("Generating sample training data...")
    X_data, y_data = generate_sample_data(1000)
    
    # Initialize and train model
    recommender = ParkingRecommender()
    recommender.train(X_data, y_data)
    
    # Save the model
    recommender.save_model()
    
    # Example prediction
    sample_spots = [
        {
            'id': 'spot_001',
            'distance_from_destination': 0.3,
            'hourly_rate': 5.0,
            'security_rating': 4.2,
            'is_covered': True,
            'avg_occupancy': 0.75,
            'avg_rating': 4.5
        },
        {
            'id': 'spot_002',
            'distance_from_destination': 0.1,
            'hourly_rate': 8.0,
            'security_rating': 3.8,
            'is_covered': False,
            'avg_occupancy': 0.90,
            'avg_rating': 4.0
        }
    ]
    
    user_prefs = {
        'time_of_day': 'morning',
        'day_of_week': 'Monday'
    }
    
    recommendations = recommender.predict_parking_score(sample_spots, user_prefs)
    print("\nRecommended Parking Spots:")
    for rec in recommendations:
        print(f"Spot {rec['spot_id']}: Score {rec['score']:.4f}")