INSERT INTO questions (title, description, dataset, difficulty, points, testcases) VALUES 
(
    'Titanic Survival Rate Analysis',
    'Calculate the survival rate from the Titanic dataset.\n\nRequirements:\n1. Load titanic.csv from the datasets folder\n2. Calculate the percentage of passengers who survived\n3. Return the result as a string: "Survival rate: <value>" (rounded to 2 decimals)\n\nDataset Schema:\n- Survived: 0 (died) or 1 (survived)\n- Pclass: Ticket class (1, 2, 3)\n- Sex: male or female\n- Age: Age in years\n- Fare: Passenger fare',
    'titanic.csv',
    'medium',
    10,
    JSON_ARRAY(
        JSON_OBJECT(
            'name', 'Data Loading',
            'type', 'assertion',
            'test_code', 'assert isinstance(df, pd.DataFrame), "Data not loaded as DataFrame"'
        ),
        JSON_OBJECT(
            'name', 'Column Check',
            'type', 'assertion',
            'test_code', 'assert "Survived" in df.columns, "Required column Survived not found"'
        ),
        JSON_OBJECT(
            'name', 'Output Format',
            'type', 'regex',
            'pattern', '^Survival rate: 0\.\\d{2}$'
        )
    )
),
(
    'Iris Species Classification',
    'Build a classifier to predict Iris flower species.\n\nRequirements:\n1. Load iris.csv from the datasets folder\n2. Split data into training (80%) and test (20%) sets\n3. Train a model (any classifier)\n4. Return the accuracy score as: "Accuracy: <value>" (rounded to 2 decimals)\n\nDataset Schema:\n- sepal_length: Sepal length in cm\n- sepal_width: Sepal width in cm\n- petal_length: Petal length in cm\n- petal_width: Petal width in cm\n- species: Target class',
    'iris.csv',
    'hard',
    20,
    JSON_ARRAY(
        JSON_OBJECT(
            'name', 'Data Loading',
            'type', 'assertion',
            'test_code', 'assert isinstance(df, pd.DataFrame), "Data not loaded as DataFrame"'
        ),
        JSON_OBJECT(
            'name', 'Train-Test Split',
            'type', 'assertion',
            'test_code', 'assert len(X_train) > len(X_test), "Data not properly split"'
        ),
        JSON_OBJECT(
            'name', 'Output Format',
            'type', 'regex',
            'pattern', '^Accuracy: 0\.\\d{2}$'
        )
    )
);
