import urllib.request
import json
url = "https://raw.githubusercontent.com/nshntarora/Indian-Cities-JSON/master/cities.json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    cities = json.loads(response.read().decode('utf-8'))
    print("Type:", type(cities))
    if isinstance(cities, list) and len(cities) > 0:
        print(cities[0])
    elif isinstance(cities, dict):
        print(list(cities.keys())[:5])
        print(cities[list(cities.keys())[0]])
