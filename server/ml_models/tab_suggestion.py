import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load historical tab data
data = pd.read_csv('tab_usage_data.csv')

# Define features and target
X = data[['time_spent', 'cpu_usage', 'memory_usage', 'tab_type']]
y = data['close_tab']  # 1 for suggestion to close, 0 otherwise

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# RandomForest Classifier
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Save the trained model
with open('tab_suggestion_model.pkl', 'wb') as f:
    pickle.dump(model, f)