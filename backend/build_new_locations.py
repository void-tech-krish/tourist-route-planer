import urllib.request
import urllib.parse
import json
import time

user_data = """
Andhra Pradesh: Visakhapatnam, Vijayawada, Guntur, Nellore, Kurnool, Tirupati, Rajahmundry, Kakinada, Anantapur, Eluru.

Arunachal Pradesh: Itanagar, Tawang, Pasighat, Roing, Ziro, Tezu, Bomdila.

Assam: Guwahati, Silchar, Dibrugarh, Jorhat, Nagaon, Tinsukia, Tezpur, Bongaigaon.

Bihar: Patna, Gaya, Bhagalpur, Muzaffarpur, Purnia, Darbhanga, Arrah, Begusarai, Katihar.

Chhattisgarh: Raipur, Bhilai, Bilaspur, Korba, Durg, Rajnandgaon, Jagdalpur, Raigarh.

Goa: Panaji, Vasco da Gama, Margao, Mapusa, Ponda.

Gujarat: Ahmedabad, Surat, Vadodara, Rajkot, Bhavnagar, Jamnagar, Gandhinagar, Junagadh, Anand, Bharuch.

Haryana: Gurugram, Faridabad, Panipat, Ambala, Rohtak, Hisar, Karnal, Panchkula, Sonipat.

Himachal Pradesh: Shimla, Manali, Dharamshala, Mandi, Solan, Kullu, Dalhousie, Chamba.

Jharkhand: Ranchi, Jamshedpur, Dhanbad, Bokaro, Deoghar, Hazaribagh, Giridih.

Karnataka: Bengaluru, Mysuru, Mangaluru, Hubballi-Dharwad, Belagavi, Kalaburagi, Ballari, Udupi, Shivamogga, Tumakuru.

Kerala: Thiruvananthapuram, Kochi, Kozhikode, Thrissur, Kollam, Kannur, Alappuzha, Palakkad, Kottayam.

Madhya Pradesh: Indore, Bhopal, Jabalpur, Gwalior, Ujjain, Sagar, Rewa, Satna, Ratlam, Khandwa.

Maharashtra: Mumbai, Pune, Nagpur, Nashik, Chhatrapati Sambhajinagar, Solapur, Amravati, Kolhapur, Navi Mumbai, Thane, Jalgaon.

Manipur: Imphal, Churachandpur, Thoubal, Kakching, Ukhrul.

Meghalaya: Shillong, Tura, Nongstoin, Jowai, Cherrapunji.

Mizoram: Aizawl, Lunglei, Champhai, Serchhip, Kolasib.

Nagaland: Kohima, Dimapur, Mokokchung, Tuensang, Wokha.

Odisha: Bhubaneswar, Cuttack, Rourkela, Berhampur, Sambalpur, Puri, Balasore, Bhadrak.

Punjab: Ludhiana, Amritsar, Jalandhar, Patiala, Bathinda, Mohali, Pathankot, Hoshiarpur, Moga.

Rajasthan: Jaipur, Jodhpur, Kota, Bikaner, Ajmer, Udaipur, Bhilwara, Alwar, Sikar, Pali.

Sikkim: Gangtok, Namchi, Pelling, Mangan, Gyalshing.

Tamil Nadu: Chennai, Coimbatore, Madurai, Tiruchirappalli, Salem, Tirunelveli, Erode, Vellore, Thoothukudi, Tiruppur.

Telangana: Hyderabad, Warangal, Nizamabad, Karimnagar, Ramagundam, Khammam, Mahbubnagar.

Tripura: Agartala, Udaipur, Dharmanagar, Kailashahar, Belonia.

Uttar Pradesh: Lucknow, Kanpur, Ghaziabad, Agra, Varanasi, Meerut, Prayagraj, Bareilly, Aligarh, Noida, Gorakhpur, Jhansi, Mathura, Ayodhya.

Uttarakhand: Dehradun, Haridwar, Roorkee, Haldwani, Rudrapur, Rishikesh, Nainital, Mussoorie, Kashipur.

West Bengal: Kolkata, Asansol, Siliguri, Durgapur, Bardhaman, Malda, Kharagpur, Darjeeling, Howrah, Haldia.

Andaman and Nicobar Islands: Port Blair.

Chandigarh: Chandigarh.

Dadra and Nagar Haveli and Daman and Diu: Daman, Diu, Silvassa.

Delhi: New Delhi, Dwarka, Rohini, Karol Bagh, Vasant Kunj.

Jammu and Kashmir: Srinagar, Jammu, Anantnag, Baramulla, Udhampur, Kathua, Sopore.

Ladakh: Leh, Kargil.

Lakshadweep: Kavaratti, Agatti, Minicoy, Amini.

Puducherry: Puducherry, Oulgaret, Karaikal, Mahe, Yanam.
"""

# Import current real_locations
from generate_real_cities import real_locations

def get_lat_lon(city, state):
    query = f"{city}, {state}, India"
    url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (CFAI Tourist App)'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data:
                return float(data[0]['lat']), float(data[0]['lon'])
    except Exception as e:
        print(f"Error fetching {city}, {state}: {e}")
    return None, None

new_locations = {}

for line in user_data.split('\n'):
    line = line.strip()
    if not line or ':' not in line:
        continue
    state, cities_str = line.split(':', 1)
    state = state.strip()
    # Remove emojis and extras
    state = state.replace('🇮🇳 8 Union Territories (UTs) & Major Cities', '').strip()
    if 'National Capital Territory' in state:
        state = 'Delhi'
    
    cities = [c.strip().strip('.') for c in cities_str.split(',')]
    
    if state not in new_locations:
        new_locations[state] = []
        
    for city in cities:
        # Check if already in real_locations
        exists = False
        if state in real_locations:
            for loc in real_locations[state]:
                if loc[0].lower() == city.lower():
                    exists = True
                    # add it back
                    new_locations[state].append(loc)
                    break
        if not exists:
            # fetch
            print(f"Fetching {city}, {state}...")
            lat, lon = get_lat_lon(city, state)
            if lat and lon:
                new_locations[state].append((city, "City", lat, lon))
            else:
                print(f"Could not find coordinates for {city}, {state}")
            time.sleep(1.1)  # Rate limiting

# Now merge with existing locations that were not cities (temples, hills, etc)
for state, locs in real_locations.items():
    if state not in new_locations:
        new_locations[state] = locs
    else:
        # Add non-city items from existing that weren't caught
        existing_names = [l[0].lower() for l in new_locations[state]]
        for loc in locs:
            if loc[0].lower() not in existing_names:
                new_locations[state].append(loc)

# Output as python file
with open('updated_real_locations.py', 'w', encoding='utf-8') as f:
    f.write("real_locations = {\n")
    for state, locs in new_locations.items():
        f.write(f'    "{state}": [\n')
        for loc in locs:
            # name, type, lat, lon
            f.write(f'        ("{loc[0]}", "{loc[1]}", {round(loc[2], 4)}, {round(loc[3], 4)}),\n')
        f.write("    ],\n")
    f.write("}\n")

print("Done. Saved to updated_real_locations.py")
