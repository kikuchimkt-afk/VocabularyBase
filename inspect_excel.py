import pandas as pd
import sys

file_path = r"C:\Users\makoto\Documents\GitHub\VocabularyBase\単語リスト\出題頻度順リストのみ_英検英単語.xlsx"
try:
    xl = pd.ExcelFile(file_path)
    print(xl.sheet_names)
except Exception as e:
    print(e)
