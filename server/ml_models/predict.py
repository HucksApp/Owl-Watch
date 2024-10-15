import pickle
import numpy as np

# Load the model
with open('tab_suggestion_model.pkl', 'rb') as f:
    model = pickle.load(f)

def predict(tab_data):
    features = np.array([tab_data['time_spent'], tab_data['cpu_usage'], tab_data['memory_usage'], tab_data['tab_type']])
    prediction = model.predict([features])
    return prediction[0]