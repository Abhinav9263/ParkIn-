"""
ParkIn - Parking Demand Forecasting Module
------------------------------------------
This module predicts future parking demand patterns using time series analysis
and machine learning techniques. It helps optimize resource allocation
and improves the recommendation system.
"""

import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import os

class ParkingDemandForecaster:
    def __init__(self, model_type='prophet'):
        """
        Initialize the demand forecasting model
        
        Args:
            model_type: Type of forecasting model to use
                'prophet' - Facebook Prophet forecasting model
                'arima' - ARIMA time series model
                'rf' - Random Forest machine learning model
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        
        print(f"Initializing {model_type} demand forecasting model")
    
    def preprocess_data(self, data):
        """Preprocess time series data for forecasting"""
        # Create copy to avoid modifying original
        processed = data.copy()
        
        if self.model_type == 'prophet':
            # Prophet requires 'ds' (date) and 'y' (target) columns
            if 'date' in processed.columns and 'ds' not in processed.columns:
                processed.rename(columns={'date': 'ds'}, inplace=True)
            if 'demand' in processed.columns and 'y' not in processed.columns:
                processed.rename(columns={'demand': 'y'}, inplace=True)
                
        elif self.model_type == 'rf':
            # For Random Forest, extract time features
            if 'date' in processed.columns:
                processed['hour'] = processed['date'].dt.hour
                processed['day'] = processed['date'].dt.day
                processed['month'] = processed['date'].dt.month
                processed['day_of_week'] = processed['date'].dt.dayofweek
                processed['is_weekend'] = processed['date'].dt.dayofweek >= 5
            
            # Scale numerical features if needed
            numerical_cols = ['hour', 'day', 'month', 'day_of_week']
            processed[numerical_cols] = self.scaler.fit_transform(processed[numerical_cols])
        
        return processed
    
    def train(self, data):
        """
        Train the demand forecasting model
        
        Args:
            data: DataFrame with at least 'date' and 'demand' columns
                 (or 'ds' and 'y' for Prophet)
        """
        processed_data = self.preprocess_data(data)
        
        if self.model_type == 'prophet':
            # Train Facebook Prophet model
            self.model = Prophet(
                changepoint_prior_scale=0.05,
                seasonality_prior_scale=10.0,
                yearly_seasonality=True,
                weekly_seasonality=True,
                daily_seasonality=True
            )
            
            # Add special event effects if available
            if 'special_event' in processed_data.columns:
                self.model.add_regressor('special_event')
            
            # Add weather effects if available
            if 'temperature' in processed_data.columns:
                self.model.add_regressor('temperature')
            if 'is_rainy' in processed_data.columns:
                self.model.add_regressor('is_rainy')
                
            self.model.fit(processed_data)
            print("Prophet model trained successfully")
            
        elif self.model_type == 'arima':
            # Train ARIMA model
            # Assuming data is sorted by date and has regular intervals
            self.model = ARIMA(
                processed_data['demand'].values, 
                order=(5, 1, 0)  # (p, d, q) order, can be optimized
            )
            self.model = self.model.fit()
            print("ARIMA model trained successfully")
            
        elif self.model_type == 'rf':
            # Train Random Forest model
            features = processed_data.drop(['date', 'demand'], axis=1)
            target = processed_data['demand']
            
            self.model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            self.model.fit(features, target)
            print("Random Forest model trained successfully")
        
        else:
            raise ValueError(f"Unsupported model type: {self.model_type}")
    
    def forecast(self, periods=24, future_df=None):
        """
        Generate demand forecast
        
        Args:
            periods: Number of future periods to forecast
            future_df: DataFrame with future dates and features (required for some models)
            
        Returns:
            DataFrame with forecasted demand
        """
        if self.model is None:
            raise ValueError("Model not trained. Call train() first.")
        
        if self.model_type == 'prophet':
            if future_df is not None:
                future = future_df
            else:
                future = self.model.make_future_dataframe(periods=periods, freq='H')
            forecast = self.model.predict(future)
            return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']]
        
        elif self.model_type == 'arima':
            forecast = self.model.forecast(steps=periods)
            # Convert to DataFrame with dates
            start_date = datetime.now()
            date_range = pd.date_range(start=start_date, periods=periods, freq='H')
            forecast_df = pd.DataFrame({
                'date': date_range,
                'forecast': forecast
            })
            return forecast_df
        
        elif self.model_type == 'rf':
            if future_df is None:
                raise ValueError("future_df must be provided for Random Forest forecasting")
            
            processed_future = self.preprocess_data(future_df)
            features = processed_future.drop(['date'], axis=1, errors='ignore')
            
            forecast = self.model.predict(features)
            future_df['forecast'] = forecast
            return future_df
    
    def plot_forecast(self, forecast_df, historical_data=None, save_path=None):
        """
        Plot the forecasted demand
        
        Args:
            forecast_df: DataFrame with forecasted values
            historical_data: Optional DataFrame with historical data to include in plot
            save_path: Path to save the plot image
        """
        plt.figure(figsize=(12, 6))
        
        # Plot formatting
        plt.title('Parking Demand Forecast', fontsize=16)
        plt.xlabel('Date', fontsize=12)
        plt.ylabel('Parking Demand (Occupancy Rate)', fontsize=12)
        plt.grid(True, alpha=0.3)
        
        # Plot historical data if provided
        if historical_data is not None:
            if self.model_type == 'prophet':
                plt.plot(historical_data['ds'], historical_data['y'], 
                         color='navy', label='Historical Demand')
            else:
                plt.plot(historical_data['date'], historical_data['demand'], 
                         color='navy', label='Historical Demand')
        
        # Plot forecast
        if self.model_type == 'prophet':
            plt.plot(forecast_df['ds'], forecast_df['yhat'], 
                     color='red', label='Forecast')
            plt.fill_between(forecast_df['ds'], 
                            forecast_df['yhat_lower'], 
                            forecast_df['yhat_upper'],
                            color='red', alpha=0.2, label='95% Confidence Interval')
        else:
            date_col = 'date' if 'date' in forecast_df.columns else 'ds'
            forecast_col = 'forecast' if 'forecast' in forecast_df.columns else 'yhat'
            plt.plot(forecast_df[date_col], forecast_df[forecast_col], 
                     color='red', label='Forecast')
        
        plt.legend()
        plt.tight_layout()
        
        # Save if path provided
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path)
            print(f"Forecast plot saved to {save_path}")
        
        # Return the figure
        return plt.gcf()
    
    def generate_hourly_forecast(self, location_id, days=7):
        """Generate hourly parking demand forecast for a specific location"""
        # In a real implementation, this would load historical data for the location
        # Here we simulate data for demonstration
        
        # Generate hourly timestamps for the forecast period
        start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        periods = 24 * days
        date_range = pd.date_range(start=start_date, periods=periods, freq='H')
        
        # Create forecast DataFrame
        forecast_df = pd.DataFrame({
            'date': date_range,
            'location_id': location_id
        })
        
        # Extract time features
        forecast_df['hour'] = forecast_df['date'].dt.hour
        forecast_df['day'] = forecast_df['date'].dt.day
        forecast_df['month'] = forecast_df['date'].dt.month
        forecast_df['day_of_week'] = forecast_df['date'].dt.dayofweek
        forecast_df['is_weekend'] = forecast_df['day_of_week'] >= 5
        
        # Simulate demand patterns based on time features
        # Base demand with daily and weekly patterns
        forecast_df['base_demand'] = (
            # Daily pattern (higher during day, lower at night)
            0.3 + 0.4 * np.sin((forecast_df['hour'] - 4) * np.pi / 12) +
            # Weekly pattern (higher on weekends)
            0.2 * forecast_df['is_weekend'].astype(int)
        )
        
        # Add some randomness and special event effects
        np.random.seed(42)
        forecast_df['demand'] = (
            forecast_df['base_demand'] + 
            np.random.normal(0, 0.05, len(forecast_df))
        ).clip(0.1, 0.95)  # Limit to realistic range
        
        # Add special events (e.g., concerts, sports games)
        # In reality, this would come from an events database
        special_events = []
        for i in range(days):
            # 20% chance of special event each day
            if np.random.random() < 0.2:
                event_date = start_date + timedelta(days=i)
                event_start = np.random.randint(16, 20)  # Event starts between 4pm-8pm
                event_duration = np.random.randint(3, 6)  # 3-5 hours
                
                for hour in range(event_duration):
                    event_time = event_date + timedelta(hours=event_start + hour)
                    special_events.append(event_time)
        
        # Boost demand during special events
        forecast_df['special_event'] = forecast_df['date'].isin(special_events).astype(int)
        forecast_df.loc[forecast_df['special_event'] == 1, 'demand'] += 0.2
        forecast_df['demand'] = forecast_df['demand'].clip(0.1, 0.95)
        
        return forecast_df
    
    def create_demand_heatmap(self, forecast_df, save_path=None):
        """
        Create a heatmap of forecasted demand by hour and day
        
        Args:
            forecast_df: DataFrame with forecasted demand
            save_path: Path to save the heatmap image
        """
        # Extract day and hour from date for heatmap
        demand_matrix = forecast_df.copy()
        demand_matrix['day_name'] = demand_matrix['date'].dt.day_name()
        demand_matrix['hour_of_day'] = demand_matrix['date'].dt.hour
        
        # Create pivot table for heatmap
        pivot_data = demand_matrix.pivot_table(
            index='day_name', 
            columns='hour_of_day', 
            values='demand',
            aggfunc='mean'
        )
        
        # Reorder days
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        pivot_data = pivot_data.reindex(day_order)
        
        # Create heatmap
        plt.figure(figsize=(15, 7))
        sns.heatmap(
            pivot_data, 
            cmap='YlOrRd', 
            annot=True, 
            fmt='.2f',
            cbar_kws={'label': 'Expected Occupancy Rate'}
        )
        
        plt.title('Forecasted Parking Demand by Day and Hour', fontsize=16)
        plt.xlabel('Hour of Day', fontsize=12)
        plt.ylabel('Day of Week', fontsize=12)
        plt.tight_layout()
        
        # Save if path provided
        if save_path:
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            plt.savefig(save_path)
            print(f"Demand heatmap saved to {save_path}")
        
        return plt.gcf()
    
    def generate_parking_analytics(self, location_id, forecast_df=None):
        """Generate analytics insights from the forecast"""
        if forecast_df is None:
            forecast_df = self.generate_hourly_forecast(location_id)
        
        analytics = {
            'location_id': location_id,
            'forecast_period': {
                'start_date': forecast_df['date'].min().strftime('%Y-%m-%d'),
                'end_date': forecast_df['date'].max().strftime('%Y-%m-%d'),
            },
            'peak_times': {
                'highest_demand_hour': int(forecast_df.loc[forecast_df['demand'].idxmax()]['hour']),
                'highest_demand_day': forecast_df.loc[forecast_df['demand'].idxmax()]['date'].strftime('%Y-%m-%d'),
                'peak_demand': float(forecast_df['demand'].max()),
            },
            'low_times': {
                'lowest_demand_hour': int(forecast_df.loc[forecast_df['demand'].idxmin()]['hour']),
                'lowest_demand_day': forecast_df.loc[forecast_df['demand'].idxmin()]['date'].strftime('%Y-%m-%d'),
                'low_demand': float(forecast_df['demand'].min()),
            },
            'average_demand': {
                'weekday': float(forecast_df[~forecast_df['is_weekend']]['demand'].mean()),
                'weekend': float(forecast_df[forecast_df['is_weekend']]['demand'].mean()),
                'overall': float(forecast_df['demand'].mean()),
            },
            'special_events': {
                'count': int(forecast_df['special_event'].sum()),
                'average_demand': float(forecast_df[forecast_df['special_event'] == 1]['demand'].mean()) if 'special_event' in forecast_df.columns else None,
            }
        }
        
        # Add daily averages
        daily_avg = forecast_df.groupby(forecast_df['date'].dt.day_name())['demand'].mean()
        analytics['daily_average'] = {day: float(val) for day, val in daily_avg.items()}
        
        # Add hourly averages
        hourly_avg = forecast_df.groupby('hour')['demand'].mean()
        analytics['hourly_average'] = {int(hour): float(val) for hour, val in hourly_avg.items()}
        
        return analytics

# Example usage
if __name__ == "__main__":
    # Initialize forecaster
    forecaster = ParkingDemandForecaster(model_type='prophet')
    
    # Generate sample forecast data for a location
    location_id = 42
    forecast_data = forecaster.generate_hourly_forecast(location_id, days=7)
    
    # Create a demand heatmap
    forecaster.create_demand_heatmap(
        forecast_data, 
        save_path=f"reports/demand_heatmap_location_{location_id}.png"
    )
    
    # Generate analytics
    analytics = forecaster.generate_parking_analytics(location_id, forecast_data)
    
    # Print some insights
    print("\nParking Demand Analytics:")
    print(f"Location ID: {analytics['location_id']}")
    print(f"Forecast Period: {analytics['forecast_period']['start_date']} to {analytics['forecast_period']['end_date']}")
    
    print("\nPeak Demand:")
    print(f"Highest demand at {analytics['peak_times']['highest_demand_hour']}:00 on {analytics['peak_times']['highest_demand_day']}")
    print(f"Peak occupancy rate: {analytics['peak_times']['peak_demand']:.2f}")
    
    print("\nAverage Demand:")
    print(f"Weekday average: {analytics['average_demand']['weekday']:.2f}")
    print(f"Weekend average: {analytics['average_demand']['weekend']:.2f}")
    
    print("\nSpecial Events:")
    print(f"Number of special events: {analytics['special_events']['count']}")
    if analytics['special_events']['average_demand']:
        print(f"Average demand during events: {analytics['special_events']['average_demand']:.2f}")
    
    # Save analytics to JSON file
    import json
    with open(f"reports/demand_analytics_location_{location_id}.json", "w") as f:
        json.dump(analytics, f, indent=4)
    print(f"\nAnalytics saved to reports/demand_analytics_location_{location_id}.json")