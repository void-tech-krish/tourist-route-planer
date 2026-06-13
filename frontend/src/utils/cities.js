import { extraNodes } from './extra_cities';

const baseNodes = {
    // Delhi & NCR
    'DEL': { id: 'DEL', name: 'New Delhi (Delhi)', lat: 28.6139, lng: 77.2090 },
    'GUR': { id: 'GUR', name: 'Gurugram (Haryana)', lat: 28.4595, lng: 77.0266 },
    'NOI': { id: 'NOI', name: 'Noida (Uttar Pradesh)', lat: 28.5355, lng: 77.3910 },
    'AGR': { id: 'AGR', name: 'Agra (Uttar Pradesh)', lat: 27.1767, lng: 78.0081 },

    // Rajasthan
    'JAI': { id: 'JAI', name: 'Jaipur (Rajasthan)', lat: 26.9124, lng: 75.7873 },
    'UDA': { id: 'UDA', name: 'Udaipur (Rajasthan)', lat: 24.5854, lng: 73.7125 },
    'JOD': { id: 'JOD', name: 'Jodhpur (Rajasthan)', lat: 26.2389, lng: 73.0243 },
    'JAI_S': { id: 'JAI_S', name: 'Jaisalmer (Rajasthan)', lat: 26.9157, lng: 70.9083 },
    'PUS': { id: 'PUS', name: 'Pushkar (Rajasthan)', lat: 26.4883, lng: 74.5513 },

    // Punjab & Chandigarh
    'ASR': { id: 'ASR', name: 'Amritsar (Punjab)', lat: 31.6340, lng: 74.8723 },
    'IXC': { id: 'IXC', name: 'Chandigarh (Chandigarh)', lat: 30.7333, lng: 76.7794 },

    // Uttarakhand & HP (Himalayas)
    'DDN': { id: 'DDN', name: 'Dehradun (Uttarakhand)', lat: 30.3165, lng: 78.0322 },
    'HAR': { id: 'HAR', name: 'Haridwar (Uttarakhand)', lat: 29.9457, lng: 78.1642 },
    'SML': { id: 'SML', name: 'Shimla (Himachal Pradesh)', lat: 31.1048, lng: 77.1734 },
    'MAN': { id: 'MAN', name: 'Manali (Himachal Pradesh)', lat: 32.2396, lng: 77.1887 },
    'DHA': { id: 'DHA', name: 'Dharamshala (Himachal Pradesh)', lat: 32.2190, lng: 76.3234 },

    // Uttar Pradesh & Bihar
    'VNS': { id: 'VNS', name: 'Varanasi (Uttar Pradesh)', lat: 25.3176, lng: 82.9739 },
    'LKO': { id: 'LKO', name: 'Lucknow (Uttar Pradesh)', lat: 26.8467, lng: 80.9462 },
    'PAT': { id: 'PAT', name: 'Patna (Bihar)', lat: 25.5941, lng: 85.1376 },
    'BGY': { id: 'BGY', name: 'Bodh Gaya (Bihar)', lat: 24.6961, lng: 84.9869 },

    // West Bengal & North East
    'CCU': { id: 'CCU', name: 'Kolkata (West Bengal)', lat: 22.5726, lng: 88.3639 },
    'DJK': { id: 'DJK', name: 'Darjeeling (West Bengal)', lat: 27.0360, lng: 88.2627 },
    'GAU': { id: 'GAU', name: 'Guwahati (Assam)', lat: 26.1445, lng: 91.7362 },
    'SHL': { id: 'SHL', name: 'Shillong (Meghalaya)', lat: 25.5788, lng: 91.8933 },

    // Maharashtra
    'BOM': { id: 'BOM', name: 'Mumbai (Maharashtra)', lat: 19.0760, lng: 72.8777 },
    'PNQ': { id: 'PNQ', name: 'Pune (Maharashtra)', lat: 18.5204, lng: 73.8567 },
    'NAG': { id: 'NAG', name: 'Nagpur (Maharashtra)', lat: 21.1458, lng: 79.0882 },
    'AUR': { id: 'AUR', name: 'Aurangabad (Maharashtra)', lat: 19.8762, lng: 75.3433 },
    'MAH': { id: 'MAH', name: 'Mahabaleshwar (Maharashtra)', lat: 17.9307, lng: 73.6477 },

    // Gujarat
    'AMD': { id: 'AMD', name: 'Ahmedabad (Gujarat)', lat: 23.0225, lng: 72.5714 },
    'STV': { id: 'STV', name: 'Surat (Gujarat)', lat: 21.1702, lng: 72.8311 },
    'RAJ': { id: 'RAJ', name: 'Rajkot (Gujarat)', lat: 22.3039, lng: 70.8022 },

    // Goa
    'GOI': { id: 'GOI', name: 'Panaji (Goa)', lat: 15.4909, lng: 73.8278 },
    'GOA_S': { id: 'GOA_S', name: 'South Goa (Goa)', lat: 15.2993, lng: 74.1240 },

    // Karnataka
    'BLR': { id: 'BLR', name: 'Bengaluru (Karnataka)', lat: 12.9716, lng: 77.5946 },
    'MYQ': { id: 'MYQ', name: 'Mysuru (Karnataka)', lat: 12.2958, lng: 76.6394 },
    'IXE': { id: 'IXE', name: 'Mangaluru (Karnataka)', lat: 12.9141, lng: 74.8560 },
    'HMP': { id: 'HMP', name: 'Hampi (Karnataka)', lat: 15.3350, lng: 76.4600 },

    // Kerala
    'COK': { id: 'COK', name: 'Kochi (Kerala)', lat: 9.9312, lng: 76.2673 },
    'TRV': { id: 'TRV', name: 'Thiruvananthapuram (Kerala)', lat: 8.5241, lng: 76.9366 },
    'ALR': { id: 'ALR', name: 'Alappuzha (Kerala)', lat: 9.4981, lng: 76.3388 },
    'MUN': { id: 'MUN', name: 'Munnar (Kerala)', lat: 10.0889, lng: 77.0595 },
    'CCJ': { id: 'CCJ', name: 'Kozhikode (Kerala)', lat: 11.2588, lng: 75.7804 },

    // Tamil Nadu
    'MAA': { id: 'MAA', name: 'Chennai (Tamil Nadu)', lat: 13.0827, lng: 80.2707 },
    'CJB': { id: 'CJB', name: 'Coimbatore (Tamil Nadu)', lat: 11.0168, lng: 76.9558 },
    'IXM': { id: 'IXM', name: 'Madurai (Tamil Nadu)', lat: 9.9252, lng: 78.1198 },
    'OOT': { id: 'OOT', name: 'Ooty (Tamil Nadu)', lat: 11.4102, lng: 76.6950 },
    'PDY': { id: 'PDY', name: 'Pondicherry (Puducherry)', lat: 11.9416, lng: 79.8083 },
    'TRZ': { id: 'TRZ', name: 'Tiruchirappalli (Tamil Nadu)', lat: 10.7905, lng: 78.7047 },

    // Andhra & Telangana
    'HYD': { id: 'HYD', name: 'Hyderabad (Telangana)', lat: 17.3850, lng: 78.4867 },
    'VTZ': { id: 'VTZ', name: 'Visakhapatnam (Andhra Pradesh)', lat: 17.6868, lng: 83.2185 },
    'VGA': { id: 'VGA', name: 'Vijayawada (Andhra Pradesh)', lat: 16.5062, lng: 80.6480 },
    'TIR': { id: 'TIR', name: 'Tirupati (Andhra Pradesh)', lat: 13.6288, lng: 79.4192 },

    // Madhya Pradesh & Chhattisgarh
    'BHO': { id: 'BHO', name: 'Bhopal (Madhya Pradesh)', lat: 23.2599, lng: 77.4126 },
    'IDR': { id: 'IDR', name: 'Indore (Madhya Pradesh)', lat: 22.7196, lng: 75.8577 },
    'GWL': { id: 'GWL', name: 'Gwalior (Madhya Pradesh)', lat: 26.2183, lng: 78.1828 },
    'JLR': { id: 'JLR', name: 'Jabalpur (Madhya Pradesh)', lat: 23.1815, lng: 79.9864 },
    'RPR': { id: 'RPR', name: 'Raipur (Chhattisgarh)', lat: 21.2514, lng: 81.6296 },

    // Odisha
    'BBI': { id: 'BBI', name: 'Bhubaneswar (Odisha)', lat: 20.2961, lng: 85.8245 },
    'PUI': { id: 'PUI', name: 'Puri (Odisha)', lat: 19.8135, lng: 85.8312 },

    // Jammu & Kashmir and Ladakh
    'SXR': { id: 'SXR', name: 'Srinagar (Jammu & Kashmir)', lat: 34.0837, lng: 74.7973 },
    'IXJ': { id: 'IXJ', name: 'Jammu (Jammu & Kashmir)', lat: 32.7266, lng: 74.8570 },
    'IXL': { id: 'IXL', name: 'Leh (Ladakh)', lat: 34.1526, lng: 77.5771 },

    // Jharkhand
    'IXR': { id: 'IXR', name: 'Ranchi (Jharkhand)', lat: 23.3441, lng: 85.3096 },
    'IXW': { id: 'IXW', name: 'Jamshedpur (Jharkhand)', lat: 22.8046, lng: 86.2029 },

    // North East (Seven Sisters + Sikkim)
    'PYG': { id: 'PYG', name: 'Gangtok (Sikkim)', lat: 27.3389, lng: 88.6065 },
    'HGI': { id: 'HGI', name: 'Itanagar (Arunachal Pradesh)', lat: 27.0844, lng: 93.6053 },
    'DMU': { id: 'DMU', name: 'Dimapur (Nagaland)', lat: 25.8856, lng: 93.7259 },
    'IMF': { id: 'IMF', name: 'Imphal (Manipur)', lat: 24.8170, lng: 93.9368 },
    'AJL': { id: 'AJL', name: 'Aizawl (Mizoram)', lat: 23.7307, lng: 92.7173 },
    'IXA': { id: 'IXA', name: 'Agartala (Tripura)', lat: 23.8315, lng: 91.2868 },
    'DIB': { id: 'DIB', name: 'Dibrugarh (Assam)', lat: 27.4728, lng: 94.9120 },

    // Additional Major Cities
    'PAB': { id: 'PAB', name: 'Bilaspur (Chhattisgarh)', lat: 22.0797, lng: 82.1409 },
    'NMB': { id: 'NMB', name: 'Daman (Daman & Diu)', lat: 20.3974, lng: 72.8328 },

    // Islands
    'IXZ': { id: 'IXZ', name: 'Port Blair (Andaman & Nicobar)', lat: 11.6234, lng: 92.7265 },
    'AGX': { id: 'AGX', name: 'Agatti (Lakshadweep)', lat: 10.8505, lng: 72.1873 }
};

export const nodes = {
    ...baseNodes,
    ...extraNodes
};
