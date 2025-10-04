from flask import Flask, jsonify, request, render_template, url_for
from flask_cors import CORS
import json
import os # <--- WAŻNY IMPORT

app = Flask(__name__)
CORS(app)

# --- Symulacja Bazy Danych (bez zmian) ---
questions_db = {
    1: {'en': 'What is your budget?', 'es': '¿Cuál es tu presupuesto?', 'pl': 'Jaki masz budżet?', 'icon_path': 'icons/budgetx.svg'},
    2: {'en': 'What is the primary use of the phone?', 'es': '¿Cuál es el uso principal del teléfono?', 'pl': 'Do czego będziesz używać telefonu?', 'icon_path': 'icons/usagex.svg'},
    3: {'en': 'How important is battery life?', 'es': '¿Qué tan importante es la duración de la batería?', 'pl': 'Jak ważna jest żywotność baterii?', 'icon_path': 'icons/batteryx.svg'},
    4: {'en': 'What screen size do you prefer?', 'es': '¿Qué tamaño de pantalla prefieres?', 'pl': 'Jaki rozmiar ekranu preferujesz?', 'icon_path': 'icons/screenxx.svg'},
    5: {'en': 'What is your priority for photos?', 'es': '¿Cuál es tu prioridad para las fotos?', 'pl': 'Jaki jest Twój priorytet w zdjęciach?', 'icon_path': 'icons/questuins_camerax.svg'},
    6: {'en': 'How much internal memory do you need', 'es': '¿Cuánta memoria interna necesitas?', 'pl': 'Ile pamięci wewnętrznej potrzebujesz?', 'icon_path': 'icons/memoryx.svg'},
    7: {'en': 'How important is processing power for games?', 'es': '¿Qué tan importante es la potencia de procesamiento para juegos?', 'pl': 'Jak ważna jest moc do gier?', 'icon_path': 'icons/gamingx.svg'},
    8: {'en': 'Which operating system do you prefer?', 'es': '¿Qué sistema operativo prefieres?', 'pl': 'Jaki system operacyjny preferujesz?', 'icon_path': 'icons/osx.svg'},
    9: {'en': 'What is most important in terms of camera features?', 'es': '¿Qué es lo más importante en cuanto a características de la cámara?', 'pl': 'Co jest najważniejsze w aparacie?', 'icon_path': 'icons/camera_featuresx.svg'},
    10: {'en': 'Which brand do you prefer?', 'es': '¿Qué marca prefieres?', 'pl': 'Jaką markę preferujesz?', 'icon_path': 'icons/brandx.svg'},
    11: {'en': 'How important is fast charging?', 'es': '¿Qué tan importante es la carga rápida?', 'pl': 'Jak ważne jest szybkie ładowanie?', 'icon_path': 'icons/chargingx.svg'},
}
answers_db = {
    101: {'question_id': 1, 'next_question_id': 2, 'en': 'Under $350', 'es': 'Menos de $350', 'pl': 'Poniżej 1500 zł', 'icon_path': 'icons/price_low.svg', 'price_level': 1},
    102: {'question_id': 1, 'next_question_id': 2, 'en': '$350 - $700', 'es': '$350 - $700', 'pl': '1500 - 3000 zł', 'icon_path': 'icons/price_mid.svg', 'price_level': 2},
    103: {'question_id': 1, 'next_question_id': 2, 'en': 'Above $700', 'es': 'Más de $700', 'pl': 'Powyżej 3000 zł', 'icon_path': 'icons/price_high.svg', 'price_level': 3},
    201: {'question_id': 2, 'next_question_id': 3, 'en': 'Calls & basic use', 'es': 'Llamadas y uso básico', 'pl': 'Tylko dzwonienie i SMS-y', 'icon_path': 'icons/call.svg'},
    202: {'question_id': 2, 'next_question_id': 5, 'en': 'Photos & videos', 'es': 'Fotos y videos', 'pl': 'Robienie zdjęć i filmów', 'icon_path': 'icons/camera.svg'},
    203: {'question_id': 2, 'next_question_id': 7, 'en': 'Gaming', 'es': 'Juegos', 'pl': 'Granie w gry', 'icon_path': 'icons/gaming.svg'},
    301: {'question_id': 3, 'next_question_id': 4, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważna', 'icon_path': 'icons/battery_full2.svg'},
    302: {'question_id': 3, 'next_question_id': 5, 'en': 'Important, but not the most important', 'es': 'Importante, pero no lo más importante', 'pl': 'Ważna, ale nie najważniejsza', 'icon_path': 'icons/battery_mid2.svg'},
    303: {'question_id': 3, 'next_question_id': 6, 'en': 'Of little importance', 'es': 'Poco importante', 'pl': 'Mało istotna', 'icon_path': 'icons/battery_low2.svg'},
    401: {'question_id': 4, 'next_question_id': 11, 'en': 'As large a screen as possible', 'es': 'La pantalla más grande posible', 'pl': 'Jak największy ekran', 'icon_path': 'icons/screen_big.svg'},
    402: {'question_id': 4, 'next_question_id': 11, 'en': 'Standard', 'es': 'Estándar', 'pl': 'Standardowy', 'icon_path': 'icons/screen_mid.svg'},
    403: {'question_id': 4, 'next_question_id': 11, 'en': 'Compact screen', 'es': 'Pantalla compacta', 'pl': 'Kompaktowy ekran', 'icon_path': 'icons/screen_small.svg'},
    501: {'question_id': 5, 'next_question_id': 9, 'en': 'Good photos during the day', 'es': 'Buenas fotos de día', 'pl': 'Dobre zdjęcia w dzień', 'icon_path': 'icons/sun.svg'},
    502: {'question_id': 5, 'next_question_id': 11, 'en': 'A good front camera for selfies', 'es': 'Una buena cámara frontal para selfies', 'pl': 'Dobry przedni aparat do selfie', 'icon_path': 'icons/selfie.svg'},
    503: {'question_id': 5, 'next_question_id': 9, 'en': 'Versatile rear camera (e.g., for landscapes, portraits)', 'es': 'Cámara trasera versátil (p. ej., para paisajes, retratos)', 'pl': 'Wszechstronny tylny aparat', 'icon_path': 'icons/camera.svg'},
    601: {'question_id': 6, 'next_question_id': 10, 'en': '128 GB', 'es': '128 GB', 'pl': '128 GB', 'icon_path': 'icons/memory_low.svg'},
    602: {'question_id': 6, 'next_question_id': 10, 'en': '256 GB', 'es': '256 GB', 'pl': '256 GB', 'icon_path': 'icons/memory_normal.svg'},
    603: {'question_id': 6, 'next_question_id': 10, 'en': '512 GB or more', 'es': '512 GB o más', 'pl': '512 GB lub więcej', 'icon_path': 'icons/memory_high.svg'},
    701: {'question_id': 7, 'next_question_id': 8, 'en': 'I need the highest possible performance', 'es': 'Necesito el máximo rendimiento posible', 'pl': 'Potrzebuję najwyższej wydajności', 'icon_path': 'icons/performance_high.svg'},
    702: {'question_id': 7, 'next_question_id': 8, 'en': 'I need high performance for gaming', 'es': 'Necesito alto rendimiento para juegos', 'pl': 'Potrzebuję wysokiej wydajności w grach', 'icon_path': 'icons/performance_normal.svg'},
    703: {'question_id': 7, 'next_question_id': 8, 'en': 'Standard performance is enough for less demanding games', 'es': 'El rendimiento estándar es suficiente para juegos menos exigentes', 'pl': 'Wystarczy mi standardowa wydajność w mniej wymagających tytułach', 'icon_path': 'icons/performance_low.svg'},
    801: {'question_id': 8, 'next_question_id': 6, 'en': 'Android', 'es': 'Android', 'pl': 'Android', 'icon_path': 'icons/android.svg'},
    802: {'question_id': 8, 'next_question_id': 6, 'en': 'iOS', 'es': 'iOS', 'pl': 'iOS', 'icon_path': 'icons/apple.svg'},
    803: {'question_id': 8, 'next_question_id': 6, 'en': 'I have no preference', 'es': 'No tengo preferencia', 'pl': 'Nie mam preferencji', 'icon_path': 'icons/any.svg'},
    901: {'question_id': 9, 'next_question_id': 11,'en': 'Optical zoom', 'es': 'Zoom óptico', 'pl': 'Zoom optyczny', 'icon_path': 'icons/zoom.svg'},
    902: {'question_id': 9, 'next_question_id': 11, 'en': 'Video image stabilization', 'es': 'Estabilización de imagen de video', 'pl': 'Stabilizacja obrazu video', 'icon_path': 'icons/stabilization.svg'},
    903: {'question_id': 9, 'next_question_id': 11,'en': 'Good quality photos at night', 'es': 'Buena calidad de fotos nocturnas', 'pl': 'Dobra jakość zdjęć w nocy', 'icon_path': 'icons/moon.svg'},
    1001: {'question_id': 10, 'next_question_id': None, 'en': 'Samsung', 'es': 'Samsung', 'pl': 'Samsung', 'icon_path': 'icons/samsung.svg'},
    1002: {'question_id': 10, 'next_question_id': None, 'en': 'Apple', 'es': 'Apple', 'pl': 'Apple', 'icon_path': 'icons/apple.svg'},
    1003: {'question_id': 10, 'next_question_id': None, 'en': 'I prefer other brands', 'es': 'Prefiero otras marcas', 'pl': 'Preferuję inne marki', 'icon_path': 'icons/any.svg'},
    1101: {'question_id': 11, 'next_question_id': 10, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważne', 'icon_path': 'icons/charging_fast.svg'},
    1102: {'question_id': 11, 'next_question_id': 10, 'en': 'Neutral', 'es': 'Neutral', 'pl': 'Neutralne', 'icon_path': 'icons/charging_normal.svg'},
    1103: {'question_id': 11, 'next_question_id': 10, 'en': 'Not important', 'es': 'No importa', 'pl': 'Nie ważne', 'icon_path': 'icons/charging_never_mind.svg'},
}
answers_x_products = {
    # 101: Najtańsze telefony
    # Algorytm: Telefony posortowane rosnąco po cenie – najtańszy jako pierwszy, najdroższy jako ostatni.
    # Użytkownik dostaje najwięcej punktów za wybór najtańszego modelu dla tej odpowiedzi.
    101: [251, 250, 209, 212, 211, 216, 249, 244, 255, 245, 246, 218, 241, 247, 243, 242, 240, 238, 239, 202, 203, 217, 201, 252, 253, 254, 210],

    # 102: Przedział 1500–3000 zł
    # Algorytm: Telefony posortowane według odległości ceny od środka przedziału 1500–3000 zł (najbliższy 2250 zł na początku).
    102: [211, 216, 249, 244, 212, 209, 251, 250, 245, 246, 248, 218, 255, 241, 247, 243, 242, 240, 238, 239, 202, 203, 201, 252, 253, 254, 257, 259,210],

    # 103: Najdroższe telefony
    # Algorytm: Telefony posortowane malejąco po cenie – najdroższy jako pierwszy, najtańszy jako ostatni.
    103: [258, 259, 243, 257, 239, 248, 238, 253, 252, 240, 246, 242, 247, 241, 256, 218, 245, 201, 203,224, 202, 244, 249, 216, 211, 210, 212, 209, 250, 251, 254, 217],

    # 201: Dzwonienie/SMS
    # Algorytm: Telefony z najprostszą obsługą, dobrą baterią, solidnością i niską ceną na początku listy.
    201: [251, 250, 209, 212, 259, 211, 216, 249, 244, 255, 217, 245, 246, 248,257,210, 218, 241, 247, 243, 242,224, 240, 238, 239, 202, 203, 201, 252, 253, 254 ],

    # 202: Zdjęcia i filmy (aparat)
    # Algorytm: Najlepsze aparaty (najwyższa jakość zdjęć, zoom, tryby nocne, stabilizacja) na początku listy.
    202: [258, 201, 211, 245, 244, 237, 215, 224, 240, 239, 248, 257, 247, 218, 243, 253, 252, 202, 246, 203, 210, 241, 238, 242, 212, 249, 255, 216, 209, 250, 251, 254, 217],

    # 203: Gry (wydajność)
    # Algorytm: Telefony z najmocniejszym procesorem, najlepszym GPU, dużą pamięcią RAM i szybkim ekranem na początku listy.
    203: [259, 257, 256, 249, 213, 241, 230, 228, 224, 239, 248, 238, 240, 246, 202, 218, 211, 201, 203, 210, 242, 243, 247, 212, 244, 216, 245, 253, 252, 209, 250, 251, 254, 217, 255],

    # 301: Bateria bardzo ważna
    # Algorytm: Telefony z największą pojemnością baterii i najlepszą optymalizacją na początku listy.
    301: [220, 243, 211, 249, 241, 237, 248, 239, 238, 218, 259, 246, 240, 255, 244, 216, 245,224, 257, 212, 209, 250, 251, 202, 242, 201,210, 203, 247, 252, 253, 254,217],

    # 302: Bateria ważna, ale nie najważniejsza
    # Algorytm: Telefony z dobrą baterią, ale też dobrą ogólną specyfikacją.
    302: [220, 241, 246, 218, 243, 239, 238, 211, 258, 256, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 242, 247, 217, 210, 248, 252, 253, 254],

    # 303: Mało ważna bateria
    # Algorytm: nie uwględnia tej odpowiedzi gdyż jest nie istotna dla użytkownika
    303: [0],

    # 401: Duży ekran , 6.7 cala i więcej
    # Algorytm: Telefony z największym ekranem na początku listy.
    401: [259, 258, 202, 204, 205, 211, 221, 226, 227, 232, 233, 237, 238, 243, 247, 248, 249, 251],

    # 402: Standardowy ekran 6.5-6.69 cala
    # Algorytm: Telefony o przekątnej ekranu w okolicach  cala, reszta dalej.
    402: [224, 216, 253, 217, 218, 252, 219, 256, 220, 255, 222, 223, 225, 228, 229, 230,259, 231, 235, 236, 239, 240, 241, 246, 250],

    # Mały ekran poniżej 6.5 cala
    403: [201, 203, 206, 207, 257, 208, 209,212, 213, 214, 215,210, 234, 242, 244, 245],
    
    # 501: Selfie
    # Algorytm: Telefony z najlepszym przednim aparatem (wysoka rozdzielczość, autofocus) na początku listy.
    501: [201, 243, 248, 237, 241, 245, 215, 240, 224, 239, 247, 257,258, 218, 202,259, 246, 203, 211, 210, 238, 242, 212, 249, 244, 216, 209, 250, 251, 252, 253, 254, 217],

    # 502: Zdjęcia nocne
    # Algorytm: Telefony z najlepszym trybem nocnym i jasnym obiektywem na początku listy.
    502: [258, 243, 201, 245, 244, 237, 224, 215, 240, 239, 248, 247, 253, 218, 256,257, 202, 246, 211, 217, 252, 203, 210, 241, 238, 242, 212, 249, 216, 209, 250, 251, 254],

    # 503: Wszechstronny aparat
    # Algorytm: Telefony z kilkoma obiektywami, dobrym zoomem, szerokim kątem, makro itd.
    503: [258, 201, 211, 245, 244, 237, 215, 224, 240, 247, 246,253, 248,259, 257, 203, 239, 256, 218, 252, 217, 202, 210, 241, 238, 255, 242, 243, 212, 249, 216, 209, 250, 251, 254],

    # 601: 128GB
    # Algorytm: Telefony z minimum 128GB pamięci, najtańsze na początku.
    601: [251, 250, 209, 212, 211,257, 255, 216, 249, 253, 244, 217, 245, 246, 248,224, 218,210, 241, 247, 243, 242, 240, 238, 239, 202, 203, 201, 252, 254,],

    # 602: 256GB
    # Algorytm: Telefony z minimum 256GB pamięci, najtańsze na początku.
    602: [245, 246, 257, 248,258, 218,259, 256, 241, 253, 252,255, 247, 243, 242,224, 246, 240, 238, 239, 202, 203, 201, 254, 251, 250, 209, 212, 210, 211, 216, 249, 244, 217],

    # 603: 512GB+
    # Algorytm: Telefony z minimum 512GB pamięci lub więcej, od najtańszego do najdroższego.
    603: [257, 239,259,253, 238, 256, 240,258, 246, 201, 241, 247,255, 243, 242,224, 203, 218, 248, 245, 244, 249, 216, 211, 210, 212, 209, 250, 251, 252, 254,217],

    # 701: Top wydajność
    # Algorytm: Telefony z najlepszym SoC, największą ilością RAM, najnowszymi technologiami.
    701: [259, 257, 256, 249, 213, 214, 230, 228, 224, 248, 201, 239, 238, 240,258, 246, 202, 241, 218, 211, 203, 210, 242, 243, 247, 212, 244, 216, 245, 209, 250, 251, 252, 217],

    # 702: Wysoka wydajność do gier
    # Algorytm: Tak jak wyżej, z naciskiem na GPU i szybkie ekrany.
    702: [239, 238, 240, 246, 259,257,258, 202, 241, 248, 218, 211, 217,224, 210, 256, 242, 201, 252, 253, 243, 247, 212, 249, 244, 203, 216,255, 245, 209, 250, 251, 254],

    # 703: Standardowa wydajność
    # Algorytm: Telefony z podstawowym, ale stabilnym SoC, niższa cena.
    703: [251, 250, 209, 212, 211, 216, 249, 244, 217, 245, 246, 248, 218, 224, 241, 247, 243, 242, 210, 255, 252, 253, 240, 238, 239, 202, 203, 201],

    # 801: Android
    # Algorytm: Wszystkie telefony z Androidem na początku listy.
    801: [239, 259, 248,258, 238, 257, 240, 241, 246,256, 255, 218, 247, 243, 224, 242, 211, 217, 212, 254, 250, 251, 244, 249, 216, 245, 252, 253],

    # 802: iOS
    # Algorytm: Wszystkie telefony Apple na początku listy.
    802: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 239, 248, 238, 240, 241, 246, 218, 247, 243, 242, 211, 217, 212, 250, 251, 244, 249, 216],

    # 803: Nie mam preferencji
    # Jeżeli nie ma preferencji nie naliczaj punktów za tą odpowiedź.
    803: [0],
    
    # 901: Zoom optyczny
    # Algorytm: Telefony z najlepszym zoomem optycznym na początku.
    901: [201, 248, 259, 203, 258, 205, 207, 211, 243, 246, 252, 253],

    # 902: Stabilizacja video
    # Algorytm: Telefony z najlepszą stabilizacją OIS/EIS na początku.
    902: [258, 201, 211, 245, 244, 237, 215, 224, 240, 243, 248, 253, 259, 203, 257, 252, 202, 210, 242, 255, 224, 256, 246, 249, 212, 241, 216, 209, 218, 217, 239, 247, 238, 250, 251],

    # 903: Jakość zdjęć nocnych
    # Algorytm: Telefony z najlepszym trybem nocnym i dużą matrycą na początku.
    903: [201, 203, 239, 259, 253, 202, 252, 257, 246, 218, 248, 247, 224, 256, 243, 242, 211, 217, 210, 241, 240, 238, 212, 249, 244, 216, 245, 209, 250, 251, 254,],

    # 1001: Samsung
    # Algorytm: Wszystkie telefony marki Samsung na początku.
    1001: [257, 248, 245, 246, 240, 238, 239, 241, 247, 243, 242, 218, 252, 253, 254, 250, 251, 209, 212, 211, 216, 249, 244, 217],

    # 1002: Apple
    # Algorytm: Wszystkie telefony marki Apple na początku.
    1002: [201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 248, 245, 246, 240, 238, 239, 241, 247, 243, 242, 218, 252, 253, 254,250, 251, 212, 211, 216, 249, 244, 217],

    # 1003: Inne marki
    # Algorytm: Preferuje i punktuje marki inne niż apple i samsung.
    1003: [248, 259,253, 258, 245,256, 252, 246, 240,224, 238, 255, 239, 241, 254, 247, 243, 242, 253, 254,250, 251, 249, 244],

    # 1101: Bardzo ważne szybkie ładowanie
    # Algorytm: Telefony z najszybszym ładowaniem na początku listy.
    1101: [239, 257, 259, 248, 258, 238, 243, 252 ,253, 246, 256, 218, 241, 247,224, 242, 211, 217, 210, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 254],

    # 1102: Neutralne szybkie ładowanie
    # Algorytm: Telefony z szybkim (ale nie topowym) ładowaniem na początku.
    1102: [241, 246,258, 252, 253, 218, 239, 238, 259, 248, 211, 217, 257,  210, 240,224, 201,256, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 243, 242, 247, 254],

    # 1103: Nie ważne szybkie ładowanie
    # Algorytm: Szybkość ładowania nie ma znaczenia – dowolna kolejność.
    1103: [0],
}

products_db = {
    # iPhone
    201: {'pl': 'iPhone 15 Pro Max', 'en': 'iPhone 15 Pro Max', 'es': 'iPhone 15 Pro Max', 'image_path': 'graphic/iphone_15_pro_max.png', 'price_level': 3},
    202: {'pl': 'iPhone 15', 'en': 'iPhone 15', 'es': 'iPhone 15', 'image_path': 'graphic/iphone_15.png', 'price_level': 3},
    203: {'pl': 'iPhone 15 Pro', 'en': 'iPhone 15 Pro', 'es': 'iPhone 15 Pro', 'image_path': 'graphic/iphone_15_pro.png', 'price_level': 3},
    204: {'pl': 'iPhone 15 Plus', 'en': 'iPhone 15 Plus', 'es': 'iPhone 15 Plus', 'image_path': 'graphic/iphone_15_plus.png', 'price_level': 3},
    205: {'pl': 'iPhone 14 Pro Max', 'en': 'iPhone 14 Pro Max', 'es': 'iPhone 14 Pro Max', 'image_path': 'graphic/iphone_14_pro_max.png', 'price_level': 3},
    206: {'pl': 'iPhone 14', 'en': 'iPhone 14', 'es': 'iPhone 14', 'image_path': 'graphic/iphone_14.png', 'price_level': 3},
    207: {'pl': 'iPhone 14 Pro', 'en': 'iPhone 14 Pro', 'es': 'iPhone 14 Pro', 'image_path': 'graphic/iphone_14_pro.png', 'price_level': 3},
    208: {'pl': 'iPhone 13 Pro', 'en': 'iPhone 13 Pro', 'es': 'iPhone 13 Pro', 'image_path': 'graphic/iphone_13.png', 'price_level': 3},
    209: {'pl': 'iPhone SE 3rd Gen', 'en': 'iPhone SE 3rd Gen', 'es': 'iPhone SE 3rd Gen', 'image_path': 'graphic/iphone_se_3rd_gen.png', 'price_level': 1},
    210: {'pl': 'iPhone 13', 'en': 'iPhone 13', 'es': 'iPhone 13', 'image_path': 'graphic/iphone_12.png', 'price_level': 2},

    # Samsung
    211: {'pl': 'Samsung Galaxy S23 Ultra', 'en': 'Samsung Galaxy S23 Ultra', 'es': 'Samsung Galaxy S23 Ultra', 'image_path': 'graphic/samsung_galaxy_s23_ultra.png', 'price_level': 3},
    212: {'pl': 'Samsung Galaxy S23', 'en': 'Samsung Galaxy S23', 'es': 'Samsung Galaxy S23', 'image_path': 'graphic/samsung_galaxy_s23.png', 'price_level': 3},
    213: {'pl': 'Samsung Galaxy S23 FE', 'en': 'Samsung Galaxy S23 FE', 'es': 'Samsung Galaxy S23 FE', 'image_path': 'graphic/samsung_galaxy_s23_fe.png', 'price_level': 2},
    214: {'pl': 'Samsung Galaxy S22', 'en': 'Samsung Galaxy S22', 'es': 'Samsung Galaxy S22', 'image_path': 'graphic/samsung_galaxy_s22.png', 'price_level': 2},
    215: {'pl': 'Samsung Galaxy A54', 'en': 'Samsung Galaxy A54', 'es': 'Samsung Galaxy A54', 'image_path': 'graphic/samsung_galaxy_a54.png', 'price_level': 1},
    216: {'pl': 'Samsung Galaxy A36', 'en': 'Samsung Galaxy A36', 'es': 'Samsung Galaxy A36', 'image_path': 'graphic/samsung_galaxy_a34.png', 'price_level': 1},
    217: {'pl': 'Samsung Galaxy A05s', 'en': 'Samsung Galaxy A05s', 'es': 'Samsung Galaxy A05s', 'image_path': 'graphic/samsung_galaxy_a14.png', 'price_level': 1},
    218: {'pl': 'Samsung Galaxy A17 5G', 'en': 'Samsung Galaxy A17 5G', 'es': 'Samsung Galaxy A17 5G', 'image_path': 'graphic/samsung_galaxy_a14_5g.png', 'price_level': 1},
    219: {'pl': 'Samsung Galaxy A26', 'en': 'Samsung Galaxy A26', 'es': 'Samsung Galaxy A26', 'image_path': 'graphic/samsung_galaxy_a24.png', 'price_level': 1},
    220: {'pl': 'Samsung Galaxy M14', 'en': 'Samsung Galaxy M14', 'es': 'Samsung Galaxy M14', 'image_path': 'graphic/samsung_galaxy_m14.png', 'price_level': 1},
    221: {'pl': 'Samsung Galaxy M15 5G', 'en': 'Samsung Galaxy M15 5G', 'es': 'Samsung Galaxy M15 5G', 'image_path': 'graphic/samsung_galaxy_a05s.png', 'price_level': 1},
    257: {'pl': 'Samsung Galaxy S25', 'en': 'Samsung Galaxy S25', 'es': 'Samsung Galaxy S25', 'image_path': 'graphic/samsung_galaxy_s23.png', 'price_level': 3},
    
    # Xiaomi
    222: {'pl': 'Xiaomi Redmi Note 13', 'en': 'Xiaomi Redmi Note 13', 'es': 'Xiaomi Redmi Note 13', 'image_path': 'graphic/xiaomi_redmi_note_13.png', 'price_level': 1},
    223: {'pl': 'Xiaomi Redmi Note 12', 'en': 'Xiaomi Redmi Note 12', 'es': 'Xiaomi Redmi Note 12', 'image_path': 'graphic/xiaomi_redmi_note_12.png', 'price_level': 1},
    224: {'pl': 'Xiaomi Redmi Note 13 Pro', 'en': 'Xiaomi Redmi Note 13 Pro', 'es': 'Xiaomi Redmi Note 13 Pro', 'image_path': 'graphic/xiaomi_redmi_note_13_pro.png', 'price_level': 1},
    225: {'pl': 'Xiaomi Redmi Note 12 Pro', 'en': 'Xiaomi Redmi Note 12 Pro', 'es': 'Xiaomi Redmi Note 12 Pro', 'image_path': 'graphic/xiaomi_redmi_note_12_pro.png', 'price_level': 1},
    226: {'pl': 'Xiaomi Redmi 13C', 'en': 'Xiaomi Redmi 13C', 'es': 'Xiaomi Redmi 13C', 'image_path': 'graphic/xiaomi_redmi_13c.png', 'price_level': 1},
    227: {'pl': 'Xiaomi Redmi 12C', 'en': 'Xiaomi Redmi 12C', 'es': 'Xiaomi Redmi 12C', 'image_path': 'graphic/xiaomi_redmi_12c.png', 'price_level': 1},
    228: {'pl': 'Xiaomi Poco X6', 'en': 'Xiaomi Poco X6', 'es': 'Xiaomi Poco X6', 'image_path': 'graphic/xiaomi_poco_x6.png', 'price_level': 1},
    229: {'pl': 'Xiaomi Poco X5', 'en': 'Xiaomi Poco X5', 'es': 'Xiaomi Poco X5', 'image_path': 'graphic/xiaomi_poco_x5.png', 'price_level': 1},
    230: {'pl': 'Xiaomi Poco F5', 'en': 'Xiaomi Poco F5', 'es': 'Xiaomi Poco F5', 'image_path': 'graphic/xiaomi_poco_f5.png', 'price_level': 1},
    254: {'pl': 'Xiaomi Poco X7', 'en': 'Xiaomi Poco X7', 'es': 'Xiaomi Poco X7', 'image_path': 'graphic/xiaomi_poco_x6.png', 'price_level': 1},
    255: {'pl': 'Xiaomi Redmi Note 14 5G', 'en': 'Xiaomi Redmi Note 14 5G', 'es': 'Xiaomi Redmi Note 14 5G', 'image_path': 'graphic/xiaomi_redmi_note_13.png', 'price_level': 1},
    256: {'pl': 'Xiaomi 15', 'en': 'Xiaomi 15', 'es': 'Xiaomi 15', 'image_path': 'graphic/xiaomi_15.png', 'price_level': 3},
    
    # Oppo, Realme, Vivo, Honor, Motorola, Google, Huawei, OnePlus, Tecno, Infinix
    231: {'pl': 'Oppo A78', 'en': 'Oppo A78', 'es': 'Oppo A78', 'image_path': 'graphic/oppo_a78.png', 'price_level': 1},
    232: {'pl': 'Oppo Reno 14', 'en': 'Oppo Reno 14', 'es': 'Oppo Reno 14', 'image_path': 'graphic/oppo_reno_14.png', 'price_level': 2},
    233: {'pl': 'Realme 14 5G', 'en': 'Realme 11', 'es': 'Realme 11', 'image_path': 'graphic/realme_11.png', 'price_level': 1},
    234: {'pl': 'Realme 14 Pro+', 'en': 'Realme 10', 'es': 'Realme 10', 'image_path': 'graphic/realme_14_pro.png', 'price_level': 1},
    235: {'pl': 'Vivo Y29 5G', 'en': 'Vivo Y29 5G', 'es': 'Vivo Y29 5G', 'image_path': 'graphic/vivo_y29_5g.png', 'price_level': 1},
    236: {'pl': 'Vivo V50', 'en': 'Vivo V50', 'es': 'Vivo V50', 'image_path': 'graphic/vivo_v50.png', 'price_level': 2},
    237: {'pl': 'Honor 200', 'en': 'Honor 200', 'es': 'Honor 200', 'image_path': 'graphic/honor_200.png', 'price_level': 2},
    238: {'pl': 'Honor X7d 5G', 'en': 'Honor X7d 5G', 'es': 'Honor X7d 5G', 'image_path': 'graphic/honor_x7d_5g.png', 'price_level': 1},
    
    239: {'pl': 'Motorola Moto G55', 'en': 'Motorola Moto G55', 'es': 'Motorola Moto G55', 'image_path': 'graphic/motorola_moto_g54_power.png', 'price_level': 1},
    240: {'pl': 'Moto G Stylus 5G', 'en': 'Moto G Stylus 5G', 'es': 'Moto G Stylus 5G', 'image_path': 'graphic/motorola_g_stylus_5g.png', 'price_level': 2},
    241: {'pl': 'Motorola Razr 60 Ultra', 'en': 'Motorola Razr 60 Ultra', 'es': 'Motorola Razr 60 Ultra', 'image_path': 'graphic/motorola_razr_60_ultra.png', 'price_level': 3},

    # Google Pixels
    242: {'pl': 'Google Pixel 8', 'en': 'Google Pixel 8', 'es': 'Google Pixel 8', 'image_path': 'graphic/google_pixel_8.png', 'price_level': 3},
    243: {'pl': 'Google Pixel 8 Pro', 'en': 'Google Pixel 8 Pro', 'es': 'Google Pixel 8 Pro', 'image_path': 'graphic/google_pixel_8_pro.png', 'price_level': 3},
    244: {'pl': 'Google Pixel 7a', 'en': 'Google Pixel 7a', 'es': 'Google Pixel 7a', 'image_path': 'graphic/google_pixel_7a.png', 'price_level': 2},
    245: {'pl': 'Google Pixel 7', 'en': 'Google Pixel 7', 'es': 'Google Pixel 7', 'image_path': 'graphic/google_pixel_7.png', 'price_level': 2},
    252: {'pl': 'Google Pixel 9', 'en': 'Google Pixel 9', 'es': 'Google Pixel 9', 'image_path': 'graphic/google_pixel_9.png', 'price_level': 3},
    253: {'pl': 'Google Pixel 10', 'en': 'Google Pixel 10', 'es': 'Google Pixel 10', 'image_path': 'graphic/google_pixel_10.png', 'price_level': 3},
    258: {'pl': 'Google Pixel 10 Pro XL', 'en': 'Google Pixel 10 Pro XL', 'es': 'Google Pixel 10 Pro XL', 'image_path': 'graphic/pixel_10_pro_xl.png', 'price_level': 3},
    
    246: {'pl': 'Huawei P60 Pro', 'en': 'Huawei P60 Pro', 'es': 'Huawei P60 Pro', 'image_path': 'graphic/huawei_p60_pro.png', 'price_level': 3},
    247: {'pl': 'Huawei Nova 13', 'en': 'Huawei Nova 13', 'es': 'Huawei Nova 13', 'image_path': 'graphic/huawei_nova_13.png', 'price_level': 2},
    
    248: {'pl': 'OnePlus 12', 'en': 'OnePlus 12', 'es': 'OnePlus 12', 'image_path': 'graphic/oneplus_12.png', 'price_level': 3},
    249: {'pl': 'OnePlus Nord 4', 'en': 'OnePlus Nord 4', 'es': 'OnePlus Nord 4', 'image_path': 'graphic/oneplus_nord_3.png', 'price_level': 2},
    259: {'pl': 'OnePlus 13', 'en': 'OnePlus 13', 'es': 'OnePlus 13', 'image_path': 'graphic/oneplus_13.png', 'price_level': 3},
    
    250: {'pl': 'Tecno Spark 20', 'en': 'Tecno Spark 20', 'es': 'Tecno Spark 20', 'image_path': 'graphic/tecno_spark_20.png', 'price_level': 1},
    251: {'pl': 'Infinix Hot 40', 'en': 'Infinix Hot 40', 'es': 'Infinix Hot 40', 'image_path': 'graphic/infinix_hot_40.png', 'price_level': 1},

}
stores_db = {
    # Język polski
    1: {
        'language': 'pl',
        'name': 'Zamów na Allegro',
        # Kategoria smartfony i telefony komórkowe (ID 165)
        'affiliate_url': 'https://allegro.pl/kategoria/smartfony-i-telefony-komorkowe-165?string='  # + NAZWA TELEFONU (spacje %20)
    },
    2: {
        'language': 'pl',
        'name': 'Zamów na MediaMarkt',
        # Kategoria: Telefony i Smartfony (CAT_PL_MM_25975//CAT_PL_MM_25983)
        # NAZWA TELEFONU w środku, potem &category=...
        'affiliate_url': 'https://mediamarkt.pl/pl/search.html?query={}&category=CAT_PL_MM_25975//CAT_PL_MM_25983'  # .format(query)
    },
    3: {
        'language': 'pl',
        'name': 'Zamów na Euro RTV AGD',
        # Kategoria: Telefony i smartfony (ID 178)
        'affiliate_url': 'https://www.euro.com.pl/search2.bhtml?keyword='  # + NAZWA TELEFONU (spacje %20)
    },

    # Język angielski
    4: {
        'language': 'en',
        'name': 'Order on Amazon.com',
        # Kategoria cell phones & smartphones (id 2407749011), k=product
        'affiliate_url': 'https://www.amazon.com/s?i=mobile&rh=n%3A2407749011&k='  # + NAZWA TELEFONU (spacje +)
    },
    5: {
        'language': 'en',
        'name': 'Order on Amazon.co.uk',
        # Kategoria Mobile Phones & Smartphones (id 356496011), k=product
        'affiliate_url': 'https://www.amazon.co.uk/s?i=mobile&k='  # + NAZWA TELEFONU (spacje +)
    },
    6: {
        'language': 'en',
        'name': 'Order on Flipkart',
        # Kategoria Mobiles (tylko query wystarczy)
        'affiliate_url': 'https://www.flipkart.com/search?q='  # + NAZWA TELEFONU (spacje +)
    },

    # Język hiszpański
    7: {
        'language': 'es',
        'name': 'Ordenar en Amazon.es',
        # Kategoria: Móviles y smartphones (id 938008031), k=product
        'affiliate_url': 'https://www.amazon.es/s?i=mobile&k='  # + NAZWA TELEFONU (spacje +)
    },
    8: {
        'language': 'es',
        'name': 'Ordenar en Amazon.com.mx',
        # Kategoria: Celulares y Smartphones (id 17934631011), k=product
        'affiliate_url': 'https://www.amazon.com.mx/s?i=mobile&k='  # + NAZWA TELEFONU (spacje +)
    },
    9: {
        'language': 'es',
        'name': 'Ordenar en MercadoLibre',
        # Kategoria: Celulares y Smartphones (adres z as_word, nie wymaga ID kategorii)
        'affiliate_url': 'https://www.mercadolibre.com.ar/jm/search?as_word='  # + NAZWA TELEFONU (spacje +)
    }
}

product_links_db = {
    # iPhone – szeroko dostępne
    201: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    202: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    203: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    204: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    205: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    206: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    207: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    208: {'pl': [1], 'en': [4,5], 'es': [7,8,9]},
    209: {'pl': [1,2,3], 'en': [4,5], 'es': [7,9]},
    210: {'pl': [1], 'en': [4,5], 'es': [7,9]},

    # Samsung – szeroko dostępne
    211: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    212: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    213: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    214: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    215: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    216: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    217: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    218: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    219: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    220: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    221: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    257: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},

    # Xiaomi – szeroko dostępne
    222: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    223: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    224: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    225: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    226: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    227: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    228: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    229: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    230: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    254: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    255: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    256: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},
    
    # Oppo, Realme, Vivo, Honor – najczęściej szeroko dostępne, ale czasem ograniczone (np. Honor slabiej na Amazon USA)
    231: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Oppo A78
    232: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Oppo Reno 14
    233: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Realme 14 5G
    234: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Realme 14 Pro+
    235: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Vivo Y29 5G
    236: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]}, # Vivo V50

    # Honor 
    237: {'pl': [1,2,3], 'en': [5,6], 'es': [7,8,9]},   # Honor 90
    238: {'pl': [1,2,3], 'en': [], 'es': [7,8]},        # Honor X7b

    # Motorola – najnowsze modele nie zawsze na Amazon USA/UK
    239: {'pl': [1,2,3], 'en': [4,5,6], 'es': [7,8,9]},      # Motorola Moto G55'
    240: {'pl': [1], 'en': [4,5], 'es': [8,9]},      # Motorola Moto G Stylus 5G
    241: {'pl': [1,2,3], 'en': [4,56], 'es': [8,9]},      # Motorola Razr 60 Ultra

    # Google Pixel – szeroko w Amazon.com/co.uk, czasami mniej na Amazon.es/mx
    242: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},      # Google Pixel 8
    243: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},      # Google Pixel 8 Pro
    244: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},      # Google Pixel 7a
    245: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},      # Google Pixel 7
    252: {'pl': [1], 'en': [4,5,6], 'es': [7,8,9]},      # Google Pixel 9
    253: {'pl': [1], 'en': [4,5], 'es': [7]},      # Google Pixel 10
    258: {'pl': [1,2,3], 'en': [4,5], 'es': [7]},      # Google Pixel 10 Pro XL
    
    # Huawei – ograniczona dostępność w USA/UK, lepsza w Europie i Am. Łac.
    246: {'pl': [1,2,3], 'en': [5], 'es': [7,8,9]},       # Huawei P60 Pro
    247: {'pl': [1], 'en': [5], 'es': [9]},            # Huawei Nova 13

    # OnePlus – szeroko Amazon UK/EU, słabo w USA
    248: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},        # OnePlus 12
    249: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},        # OnePlus Nord 3
    259: {'pl': [1,3], 'en': [4,5,6], 'es': [7,8,9]},        # OnePlus 13

    # Tecno, Infinix – głównie Allegro, MediaMarkt, czasem Amazon.es/mx
    250: {'pl': [1,2], 'en': [], 'es': [7,8]},         # Tecno Spark 20
    251: {'pl': [1,2], 'en': [], 'es': [7,8]}         # Infinix Hot 40
}
# --- Punkty końcowe API ---

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/api/quiz/question', methods=['GET'])
def get_question():
    try:
        current_question_id = int(request.args.get('current_question_id', 1))
        language = request.args.get('language', 'en')

        question_data = questions_db.get(current_question_id)
        if not question_data:
            return jsonify({'error': 'Invalid question ID.'}), 404

        question_text = question_data.get(language, question_data['en'])
        question_icon_url = ''
        icon_path = question_data.get('icon_path')
        if icon_path and os.path.exists(os.path.join(app.static_folder, icon_path)):
            question_icon_url = url_for('static', filename=icon_path)

        answers = []
        for ans_id, ans_data in answers_db.items():
            if ans_data['question_id'] == current_question_id:
                next_id = ans_data.get('next_question_id')
                next_id_for_frontend = next_id if next_id is not None else ''
                answer_icon_url = ''
                icon_path = ans_data.get('icon_path')
                if icon_path and os.path.exists(os.path.join(app.static_folder, icon_path)):
                    answer_icon_url = url_for('static', filename=icon_path)
                answers.append({
                    'answer_id': ans_id,
                    'answer_text': ans_data.get(language, ans_data['en']),
                    'next_question_id': next_id_for_frontend,
                    'icon_url': answer_icon_url
                })

        return jsonify({
            'question_id': current_question_id,
            'question_text': question_text,
            'question_icon_url': question_icon_url,
            'answers': answers
        })
    except (ValueError, KeyError):
        return jsonify({'error': 'Invalid question ID or language.'}), 400


@app.route('/api/quiz/result', methods=['POST'])
def get_result():
    """
    Algorytm po zmianie:
    1. Budżet (101/102/103) – jeśli występuje jako PIERWSZA odpowiedź (Twoja obecna logika),
       stosujemy FILTR produktów po price_level.
       (Jeśli chcesz później brać ostatnią odpowiedź budżetową – mogę dodać.)
    2. Scoring: niezależnie od długości listy rankingowej:
         pozycja 0 -> 50 pkt, 1 -> 49 ... 49 -> 1, >=50 -> 0.
       Odpowiedź 803 (brak preferencji OS) – ignorowana (nie dodaje punktów).
    3. Sklepy: score *= (shops / max_shops), produkty z 0 sklepów odrzucane.
    4. Różnorodność marek (Apple/Samsung) – ostatnia pozycja może zostać podmieniona na inną markę.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received.'}), 400

        path_answers = data.get('pathAnswers')
        language = data.get('language', 'en')
        if not path_answers or not isinstance(path_answers, list):
            return jsonify({'error': 'Invalid or missing "pathAnswers" parameter.'}), 400

        # --- FILTR BUDŻETU (obecna wersja: patrzy tylko na pierwszą odpowiedź) ---
        allowed_products = list(products_db.keys())
        first_answer_id = path_answers[0] if path_answers else None
        if first_answer_id in (101, 102, 103) and answers_db.get(first_answer_id, {}).get('question_id') == 1:
            user_price_level = answers_db[first_answer_id].get('price_level')
            allowed_products = [
                pid for pid, pdata in products_db.items()
                if pdata.get('price_level') == user_price_level
            ]
            if not allowed_products:
                return jsonify({'recommendations': [], 'message': 'No products for selected budget.'})

        # Inicjalizacja punktów
        product_scores = {pid: 0 for pid in allowed_products}

        MAX_POINTS = 50  # stała wartość dla pozycji 0

        # --- SCORING (stałe punkty 50..1) ---
        for answer_id in path_answers:
            # Pomijamy odpowiedź "nie mam preferencji" (803) – nie wpływa na ranking
            if answer_id == 803:
                continue
            ranking = answers_x_products.get(answer_id, [])
            if not ranking:
                continue
            for pos, product_id in enumerate(ranking):
                if product_id not in product_scores:
                    continue  # poza filtrem budżetu
                base_points = MAX_POINTS - pos
                if base_points <= 0:
                    break  # dalsze pozycje = 0, można przerwać pętlę dla tej listy
                product_scores[product_id] += base_points

        # --- DOSTĘPNOŚĆ (filtruj i skaluj) ---
        max_shops = 0
        products_with_availability = {}
        for pid in product_scores:
            shop_count = len(product_links_db.get(pid, {}).get(language, []))
            products_with_availability[pid] = shop_count
            if shop_count > max_shops:
                max_shops = shop_count

        adjusted_scores = {}
        for pid, raw_score in product_scores.items():
            shops = products_with_availability.get(pid, 0)
            if shops == 0:
                continue
            factor = (shops / max_shops) if max_shops else 0
            adjusted_scores[pid] = raw_score * factor

        if not adjusted_scores:
            return jsonify({'recommendations': [], 'message': 'No available products for selected criteria.'})

        # --- RÓŻNORODNOŚĆ MAREK ---
        def get_brand(product_name: str):
            name = product_name.lower()
            if 'iphone' in name:
                return 'apple'
            if 'samsung' in name:
                return 'samsung'
            return 'other'

        top_products = sorted(adjusted_scores.items(), key=lambda x: x[1], reverse=True)
        product_ids = [pid for pid, sc in top_products if sc > 0][:3]

        brands = [get_brand(products_db[pid]['pl']) for pid in product_ids]
        if len(product_ids) == 3 and all(b in ('apple', 'samsung') for b in brands):
            for pid, sc in top_products[3:]:
                if get_brand(products_db[pid]['pl']) == 'other':
                    product_ids[-1] = pid
                    break

        if not product_ids:
            return jsonify({'recommendations': [], 'message': 'No recommendations found.'})

        selected_stores = [s for s in stores_db.values() if s['language'] == language][:3]

        def generate_store_link(store, product_name):
            if store['name'].startswith('Zamów na MediaMarkt'):
                query = product_name.replace(' ', '%20')
                return store['affiliate_url'].format(query)
            elif 'allegro' in store['affiliate_url'] or 'euro' in store['affiliate_url']:
                return store['affiliate_url'] + product_name.replace(' ', '%20')
            elif 'amazon.com' in store['affiliate_url']:
                from urllib.parse import quote_plus
                return f"https://www.amazon.com/s?i=mobile&rh=n%3A2407749011&k={quote_plus(product_name)}"
            elif 'amazon.co.uk' in store['affiliate_url']:
                from urllib.parse import quote_plus
                return f"https://www.amazon.co.uk/s?i=mobile&rh=n%3A2407749011&k={quote_plus(product_name)}"
            elif 'amazon.es' in store['affiliate_url']:
                from urllib.parse import quote_plus
                return f"https://www.amazon.es/s?i=mobile&rh=n%3A2407749011&k={quote_plus(product_name)}"
            elif 'amazon.mx' in store['affiliate_url']:
                from urllib.parse import quote_plus
                return f"https://www.amazon.mx/s?i=mobile&rh=n%3A2407749011&k={quote_plus(product_name)}"
            else:
                return store['affiliate_url'] + product_name.replace(' ', '+')

        recommendations = []
        for pid in product_ids:
            pdata = products_db.get(pid)
            if not pdata:
                continue
            product_name = pdata.get(language, pdata.get('en'))
            image_url = ''
            if pdata.get('image_path') and os.path.exists(os.path.join(app.static_folder, pdata['image_path'])):
                image_url = url_for('static', filename=pdata['image_path'])

            links = [{
                'store_name': store['name'],
                'link_url': generate_store_link(store, product_name)
            } for store in selected_stores]

            recommendations.append({
                'product_id': pid,
                'product_name': product_name,
                'image_url': image_url,
                'links': links,
                'price_level': pdata.get('price_level')
            })

        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': 'An internal server error occurred', 'details': str(e)}), 500


@app.route('/api/languages', methods=['GET'])
def get_languages():
    return jsonify({'languages': [
        {'code': 'en', 'name': 'English'},
        {'code': 'es', 'name': 'Español'},
        {'code': 'pl', 'name': 'Polski'}
    ]})


if __name__ == '__main__':
    app.run(debug=True)
