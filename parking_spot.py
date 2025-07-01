"""
ParkIn - Computer Vision Module for Parking Spot Detection
----------------------------------------------------------
This module uses computer vision techniques to detect empty parking spots
from camera feeds or images. Can be integrated with IoT cameras for real-time
parking availability updates.
"""

import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import matplotlib.pyplot as plt
import time
import os

class ParkingSpotDetector:
    def __init__(self, model_path=None):
        """Initialize the parking spot detector with a pre-trained model"""
        self.IMAGE_SIZE = (224, 224)
        self.CLASSES = ['occupied', 'empty']
        
        # Load model if provided and exists
        if model_path and os.path.exists(model_path):
            print(f"Loading parking detection model from {model_path}")
            self.model = load_model(model_path)
        else:
            print("Using default model architecture")
            self.model = self._build_default_model()
    
    def _build_default_model(self):
        """Build a default CNN model architecture for parking spot classification"""
        base_model = tf.keras.applications.MobileNetV2(
            input_shape=(224, 224, 3),
            include_top=False,
            weights='imagenet'
        )
        
        # Freeze the base model
        base_model.trainable = False
        
        model = tf.keras.Sequential([
            base_model,
            tf.keras.layers.GlobalAveragePooling2D(),
            tf.keras.layers.Dense(128, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(1, activation='sigmoid')
        ])
        
        model.compile(
            optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy']
        )
        
        return model
    
    def preprocess_image(self, image):
        """Preprocess an image for model prediction"""
        # Resize
        img = cv2.resize(image, self.IMAGE_SIZE)
        
        # Convert to RGB if grayscale
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4:  # RGBA
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
        
        # Normalize
        img = img / 255.0
        
        # Expand dimensions for batch prediction
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def detect_parking_spots(self, image, parking_coordinates):
        """
        Detect if parking spots are empty or occupied
        
        Args:
            image: Full image containing parking spots
            parking_coordinates: List of (x, y, width, height) tuples defining parking spots
            
        Returns:
            List of dictionaries with spot index, status, and confidence
        """
        results = []
        original_image = image.copy()
        
        for i, (x, y, w, h) in enumerate(parking_coordinates):
            # Extract parking spot ROI
            spot_img = image[y:y+h, x:x+w]
            
            # Skip if ROI is empty (out of bounds)
            if spot_img.size == 0:
                continue
                
            # Preprocess for prediction
            processed_img = self.preprocess_image(spot_img)
            
            # Make prediction
            pred = self.model.predict(processed_img, verbose=0)[0][0]
            
            # Determine status
            status = "empty" if pred < 0.5 else "occupied"
            confidence = 1 - pred if status == "empty" else pred
            
            # Draw bounding box on original image
            color = (0, 255, 0) if status == "empty" else (0, 0, 255)  # Green for empty, Red for occupied
            cv2.rectangle(original_image, (x, y), (x+w, y+h), color, 2)
            cv2.putText(original_image, f"{status} ({confidence:.2f})", 
                       (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            results.append({
                "spot_id": i,
                "status": status,
                "confidence": float(confidence),
                "coordinates": (x, y, w, h)
            })
        
        return results, original_image
    
    def train(self, train_data, validation_data, epochs=10):
        """
        Train the parking spot detector model
        
        Args:
            train_data: Training data generator
            validation_data: Validation data generator
            epochs: Number of training epochs
        """
        # Train the model
        history = self.model.fit(
            train_data,
            validation_data=validation_data,
            epochs=epochs,
            callbacks=[
                tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True),
                tf.keras.callbacks.ReduceLROnPlateau(factor=0.2, patience=2)
            ]
        )
        
        return history
    
    def save_model(self, path="models/parking_detector.h5"):
        """Save the trained model"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.model.save(path)
        print(f"Model saved to {path}")
    
    def process_video_feed(self, video_path, parking_coordinates, output_path=None, show_preview=True):
        """Process a video feed for parking spot detection"""
        cap = cv2.VideoCapture(video_path)
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Initialize video writer if output path is provided
        if output_path:
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        frame_count = 0
        results_history = []
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every 30 frames (adjust for performance)
            if frame_count % 30 == 0:
                results, annotated_frame = self.detect_parking_spots(frame, parking_coordinates)
                results_history.append(results)
                
                if show_preview:
                    cv2.imshow('Parking Detection', annotated_frame)
                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        break
                
                if output_path:
                    out.write(annotated_frame)
            
            frame_count += 1
        
        # Clean up
        cap.release()
        if output_path:
            out.release()
        cv2.destroyAllWindows()
        
        return results_history

# Example usage
if __name__ == "__main__":
    # Initialize detector
    detector = ParkingSpotDetector()
    
    # Example parking spot coordinates (x, y, width, height)
    # These would typically be defined based on camera calibration
    example_spots = [
        (100, 200, 80, 120),
        (190, 200, 80, 120),
        (280, 200, 80, 120),
        (370, 200, 80, 120),
        (100, 330, 80, 120),
        (190, 330, 80, 120),
        (280, 330, 80, 120),
        (370, 330, 80, 120)
    ]
    
    # Demo with a sample image
    sample_image_path = "data/sample_parking_lot.jpg"
    
    # Check if image exists, otherwise create a dummy image
    if not os.path.exists(sample_image_path):
        print(f"Creating dummy parking lot image for demo")
        # Create a black image
        img = np.zeros((600, 800, 3), dtype=np.uint8)
        
        # Draw parking lot markers
        for i, (x, y, w, h) in enumerate(example_spots):
            # Randomly decide if spot is empty or occupied
            if np.random.rand() > 0.5:
                # Occupied - draw a car-like shape
                cv2.rectangle(img, (x+10, y+10), (x+w-10, y+h-10), (0, 0, 150), -1)
            cv2.rectangle(img, (x, y), (x+w, y+h), (255, 255, 255), 2)
            cv2.putText(img, f"P{i+1}", (x+5, y+20), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Save the dummy image
        os.makedirs(os.path.dirname(sample_image_path), exist_ok=True)
        cv2.imwrite(sample_image_path, img)
    
    # Load and process image
    image = cv2.imread(sample_image_path)
    results, annotated_image = detector.detect_parking_spots(image, example_spots)
    
    # Display results
    print("\nParking Spot Detection Results:")
    for spot in results:
        print(f"Spot {spot['spot_id']}: {spot['status']} (confidence: {spot['confidence']:.2f})")
    
    # Save the annotated image
    cv2.imwrite("data/detected_parking_spots.jpg", annotated_image)
    print("\nAnnotated image saved to data/detected_parking_spots.jpg")
    
    # This would actually show the image, but commented out for demo
    # plt.figure(figsize=(10, 8))
    # plt.imshow(cv2.cvtColor(annotated_image, cv2.COLOR_BGR2RGB))
    # plt.title("Parking Spot Detection")
    #plt.axis('off')
    # plt.tight_layout()
    # plt.show()