"""
ParkIn - Dynamic Price Prediction Module
----------------------------------------
This module uses machine learning to predict optimal parking pricing
based on location, demand, time of day, and other factors.
It helps parking space owners set competitive prices.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import os

class PricePredictionModel:
    def __init__(self, model_path=None):
        """Initialize price prediction model with option to load pre-trained model"""
        self.numerical_features = ['distance_from_center', 'parking_capacity', 
                                  'historical_occupancy_rate', 'nearby_attractions_count']
        self.categorical_features = ['area_type', 'day_of_week', 'special_event']
        
        # Define preprocessing pipeline
        numerical_transformer = StandardScaler()
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('num', numerical_transformer, self.numerical_features),
                ('cat', categorical_transformer, self.categorical_features)
            ])
        
        # Create model pipeline
        if model_path and os.path.exists(model_path):
            print(f"Loading pre-trained price prediction model from {model_path}")
            self.model = joblib.load(model_path)
        else:
            print("Initializing new price prediction model")
            self.model = Pipeline(steps=[
                ('preprocessor', self.preprocessor),
                ('regressor', GradientBoostingRegressor(
                    n_estimators=200, 
                    learning_rate=0.1,
                    max_depth=5, 
                    random_state=42))
            ])
    
    def train(self, X, y):
        """Train the price prediction model with provided data"""
        print(f"Training price prediction model on {len(X)} samples")
        self.model.fit(X, y)
        
        # If model is pipeline, get feature importances from final estimator
        if isinstance(self.model, Pipeline):
            print("Feature importances:")
            feature_names = (self.numerical_features + 
                            list(self.model.named_steps['preprocessor']
                                 .transformers_[1][1]
                                 .get_feature_names_out(self.categorical_features)))
            importances = self.model.named_steps['regressor'].feature_importances_
            
            for name, importance in zip(feature_names, importances):
                print(f"  {name}: {importance:.4f}")
    
    def predict_price(self, features):
        """Predict optimal pricing based on provided features"""
        predictions = self.model.predict(features)
        return predictions
    
    def save_model(self, path="models/price_predictor.pkl"):
        """Save the trained model"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        print(f"Price prediction model saved to {path}")
    
    def evaluate(self, X_test, y_test):
        """Evaluate model performance"""
        from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
        
        y_pred = self.model.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)
        
        print(f"Model Evaluation Metrics:")
        print(f"  Mean Absolute Error: ₹{mae:.2f}")
        print(f"  Root Mean Squared Error: ₹{rmse:.2f}")
        print(f"  R² Score: {r2:.4f}")
        
        # Create visualization
        plt.figure(figsize=(10, 6))
        plt.scatter(y_test, y_pred, alpha=0.5)
        plt.plot([min(y_test), max(y_test)], [min(y_test), max(y_test)], 'r--')
        plt.xlabel('Actual Price')
        plt.ylabel('Predicted Price')
        plt.title('Price Prediction Model: Actual vs Predicted')
        plt.tight_layout()
        
        # Save the evaluation plot
        os.makedirs("reports", exist_ok=True)
        plt.savefig("reports/price_prediction_evaluation.png")
        print("Evaluation plot saved to reports/price_prediction_evaluation.png")
        
        return {'mae': mae, 'rmse': rmse, 'r2': r2}
    
    def generate_price_heatmap(self, location_id, base_features):
        """Generate a heatmap of predicted prices by time and day"""
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        hours = list(range(24))
        
        price_matrix = np.zeros((len(days), len(hours)))
        
        for d, day in enumerate(days):
            for h, hour in enumerate(hours):
                # Copy base features and update time-based features
                features = base_features.copy()
                features.loc[0, 'day_of_week'] = day
                features.loc[0, 'hour_of_day'] = hour
                
                # Add temporal factors
                features.loc[0, 'is_weekend'] = 1 if day in ['Saturday', 'Sunday'] else 0
                features.loc[0, 'is_business_hours'] = 1 if 8 <= hour <= 18 else 0
                
                # Predict price for this time slot
                price = self.predict_price(features)[0]
                price_matrix[d, h] = price
        
        # Create heatmap
        plt.figure(figsize=(15, 8))
        sns.heatmap(price_matrix, cmap="YlGnBu", 
                   xticklabels=hours, 
                   yticklabels=days,
                   cbar_kws={'label': 'Price (₹)'})
        plt.xlabel('Hour of Day')
        plt.ylabel('Day of Week')
        plt.title(f'Dynamic Pricing Heatmap for Location #{location_id}')
        
        # Save the heatmap
        os.makedirs("reports", exist_ok=True)
        plt.savefig(f"reports/price_heatmap_location_{location_id}.png")
        print(f"Price heatmap saved to reports/price_heatmap_location_{location_id}.png")
        
        return price_matrix
    
    def generate_dynamic_pricing_suggestions(self, location_data, forecast_days=7):
        """Generate dynamic pricing suggestions for upcoming days"""
        today = datetime.now()
        suggestions = []
        
        for i in range(forecast_days):
            forecast_date = today + timedelta(days=i)
            day_name = forecast_date.strftime("%A")
            
            # Create feature set for this forecast day
            features = location_data.copy()
            features.loc[0, 'day_of_week'] = day_name
            
            # Check for special events (in a real system, this would query an events API)
            is_special_event = np.random.choice([True, False], p=[0.2, 0.8])
            features.loc[0, 'special_event'] = 'Yes' if is_special_event else 'No'
            
            # Generate predictions for different times of day
            time_slots = ['Morning (6-10)', 'Day (10-16)', 'Evening (16-20)', 'Night (20-6)']
            hourly_predictions = {}
            
            for slot in time_slots:
                if 'Morning' in slot:
                    features.loc[0, 'time_of_day'] = 'Morning'
                    features.loc[0, 'is_business_hours'] = 1
                elif 'Day' in slot:
                    features.loc[0, 'time_of_day'] = 'Day'
                    features.loc[0, 'is_business_hours'] = 1
                elif 'Evening' in slot:
                    features.loc[0, 'time_of_day'] = 'Evening'
                    features.loc[0, 'is_business_hours'] = 0
                else:
                    features.loc[0, 'time_of_day'] = 'Night'
                    features.loc[0, 'is_business_hours'] = 0
                
                # Add expected occupancy based on historical data and day/time
                if day_name in ['Saturday', 'Sunday']:
                    if slot in ['Morning (6-10)', 'Day (10-16)']:
                        features.loc[0, 'expected_occupancy'] = np.random.uniform(0.4, 0.7)
                    else:
                        features.loc[0, 'expected_occupancy'] = np.random.uniform(0.6, 0.9)
                else:  # Weekday
                    if slot in ['Morning (6-10)', 'Evening (16-20)']:
                        features.loc[0, 'expected_occupancy'] = np.random.uniform(0.7, 0.9)
                    elif slot == 'Day (10-16)':
                        features.loc[0, 'expected_occupancy'] = np.random.uniform(0.5, 0.8)
                    else:
                        features.loc[0, 'expected_occupancy'] = np.random.uniform(0.2, 0.5)
                
                # Apply special event boost if applicable
                if is_special_event:
                    features.loc[0, 'expected_occupancy'] += 0.15
                    features.loc[0, 'expected_occupancy'] = min(features.loc[0, 'expected_occupancy'], 0.95)
                
                # Predict price
                price = self.predict_price(features)[0]
                hourly_predictions[slot] = round(price, 2)
            
            # Add to suggestions
            suggestions.append({
                'date': forecast_date.strftime("%Y-%m-%d"),
                'day': day_name,
                'special_event': is_special_event,
                'price_suggestions': hourly_predictions
            })
        
        return suggestions

# Generate synthetic training data for demonstration
def generate_sample_pricing_data(n_samples=1000):
    """Generate synthetic parking pricing data for demonstration"""
    np.random.seed(42)
    
    # Create dataframe
    data = pd.DataFrame({
        'location_id': np.random.randint(1, 50, n_samples),
        'distance_from_center': np.random.uniform(0.1, 10.0, n_samples),
        'parking_capacity': np.random.randint(10, 500, n_samples),
        'historical_occupancy_rate': np.random.uniform(0.3, 0.9, n_samples),
        'nearby_attractions_count': np.random.randint(0, 10, n_samples),
        'area_type': np.random.choice(['Commercial', 'Residential', 'Mixed', 'Industrial'], n_samples),
        'day_of_week': np.random.choice(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], n_samples),
        'special_event': np.random.choice(['Yes', 'No'], n_samples, p=[0.2, 0.8]),
        'hour_of_day': np.random.randint(0, 24, n_samples),
        'is_weekend': np.zeros(n_samples),
        'is_business_hours': np.zeros(n_samples),
        'time_of_day': np.random.choice(['Morning', 'Day', 'Evening', 'Night'], n_samples),
        'expected_occupancy': np.random.uniform(0.3, 0.9, n_samples)
    })
    
    # Derive features
    data['is_weekend'] = data