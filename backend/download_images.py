import os
import urllib.request

os.makedirs('images', exist_ok=True)

images = {
    # Gallery
    'varanasi.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Ghats_of_Varanasi.jpg/800px-Ghats_of_Varanasi.jpg',
    'hawa_mahal.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Hawa_Mahal_2011.jpg/800px-Hawa_Mahal_2011.jpg',
    'gateway.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Gateway_of_India_in_Mumbai.jpg/800px-Gateway_of_India_in_Mumbai.jpg',
    'kerala.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Houseboats_in_Kerala_backwaters.jpg/800px-Houseboats_in_Kerala_backwaters.jpg',
    'mysore.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Mysore_Palace_Morning.jpg/800px-Mysore_Palace_Morning.jpg',
    'golden.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Golden_Temple_India.jpg/800px-Golden_Temple_India.jpg',
    'taj.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/800px-Taj_Mahal_in_March_2004.jpg',
    'red_fort.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Red_Fort_in_Delhi_03.jpg/800px-Red_Fort_in_Delhi_03.jpg',
    
    # Destinations
    'golden_triangle.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Taj_Mahal_in_Agra.jpg/800px-Taj_Mahal_in_Agra.jpg',
    'kerala_backwaters.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/House_boats_in_Kumarakom.jpg/800px-House_boats_in_Kumarakom.jpg',
    'himalayas.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Himalayas_from_Shimla.jpg/800px-Himalayas_from_Shimla.jpg',
    
    # Hero
    'hero.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Taj_Mahal_in_March_2004.jpg/1280px-Taj_Mahal_in_March_2004.jpg',
    
    # Avatars (using reliable placeholders instead of unsplash)
    'avatar1.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/200px-User_icon_2.svg.png',
    'avatar2.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/200px-User_icon_2.svg.png',
    'avatar3.jpg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/User_icon_2.svg/200px-User_icon_2.svg.png'
}

req_headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
for filename, url in images.items():
    try:
        req = urllib.request.Request(url, headers=req_headers)
        with urllib.request.urlopen(req, timeout=15) as response, open(os.path.join('images', filename), 'wb') as out_file:
            data = response.read()
            out_file.write(data)
            print(f"Downloaded {filename}")
    except Exception as e:
        print(f"Failed to download {filename}: {e}")
