import os
import csv
import json
import re

base_dir = "leetcode-company-wise-problems"
output_file = "data.json"

data = {}

# Iterate over all company directories
for company in os.listdir(base_dir):
    company_dir = os.path.join(base_dir, company)
    if not os.path.isdir(company_dir) or company.startswith('.'):
        continue
    
    csv_file = os.path.join(company_dir, "5. All.csv")
    if not os.path.exists(csv_file):
        continue
        
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                link = row.get("Link", "")
                freq_str = row.get("Frequency", "0")
                try:
                    freq = float(freq_str)
                    freq_int = int(freq)
                except ValueError:
                    freq_int = 0
                
                # Extract slug
                match = re.search(r'/problems/([^/?#]+)', link)
                if match:
                    slug = match.group(1)
                    if slug not in data:
                        data[slug] = []
                    data[slug].append({
                        "company": company,
                        "freq": freq_int
                    })
    except Exception as e:
        print(f"Error processing {company}: {e}")

# sort the array inside the dict by frequency
for slug in data:
    data[slug].sort(key=lambda x: x["freq"], reverse=True)

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f)

print(f"Generated data.json with {len(data)} problems.")
