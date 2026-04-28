import pandas as pd

def solve():
    df = pd.read_csv('/datasets/titanic.csv')
    survival_rate = round(df['Survived'].mean(), 2)
    return f"Survival rate: {survival_rate}"
