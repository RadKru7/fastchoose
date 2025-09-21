from flask import Flask, jsonify, request, render_template, url_for
from flask_cors import CORS
import json
import os # <--- WAŻNY IMPORT

app = Flask(__name__)
CORS(app)

# --- Symulacja Bazy Danych (bez zmian) ---
questions_db = {
    1: {'en': 'What is your budget?', 'es': '¿Cuál es tu presupuesto?', 'pl': 'Jaki masz budżet?', 'icon_path': 'icons/budget.svg'},
    2: {'en': 'What is the primary use of the phone?', 'es': '¿Cuál es el uso principal del teléfono?', 'pl': 'Do czego będziesz używać telefonu?', 'icon_path': 'icons/usage.svg'},
    3: {'en': 'How important is battery life?', 'es': '¿Qué tan importante es la duración de la batería?', 'pl': 'Jak ważna jest żywotność baterii?', 'icon_path': 'icons/battery.svg'},
    4: {'en': 'What screen size do you prefer?', 'es': '¿Qué tamaño de pantalla prefieres?', 'pl': 'Jaki rozmiar ekranu preferujesz?', 'icon_path': 'icons/screen.svg'},
    5: {'en': 'What is your priority for photos?', 'es': '¿Cuál es tu prioridad para las fotos?', 'pl': 'Jaki jest Twój priorytet w zdjęciach?', 'icon_path': 'icons/camera.svg'},
    6: {'en': 'How much internal memory do you need', 'es': '¿Cuánta memoria interna necesitas?', 'pl': 'Ile pamięci wewnętrznej potrzebujesz?', 'icon_path': 'icons/memory.svg'},
    7: {'en': 'How important is processing power for games?', 'es': '¿Qué tan importante es la potencia de procesamiento para juegos?', 'pl': 'Jak ważna jest moc do gier?', 'icon_path': 'icons/gaming.svg'},
    8: {'en': 'Which operating system do you prefer?', 'es': '¿Qué sistema operativo prefieres?', 'pl': 'Jaki system operacyjny preferujesz?', 'icon_path': 'icons/os.svg'},
    9: {'en': 'What is most important in terms of camera features?', 'es': '¿Qué es lo más importante en cuanto a características de la cámara?', 'pl': 'Co jest najważniejsze w aparacie?', 'icon_path': 'icons/camera_features.svg'},
    10: {'en': 'Which brand do you prefer?', 'es': '¿Qué marca prefieres?', 'pl': 'Jaką markę preferujesz?', 'icon_path': 'icons/brand.svg'},
    11: {'en': 'How important is fast charging?', 'es': '¿Qué tan importante es la carga rápida?', 'pl': 'Jak ważne jest szybkie ładowanie?', 'icon_path': 'icons/charging.svg'},
}
answers_db = {
    101: {'question_id': 1, 'next_question_id': 2, 'en': 'Under $350', 'es': 'Menos de $350', 'pl': 'Poniżej 1500 zł', 'icon_path': 'icons/price_low.svg'},
    102: {'question_id': 1, 'next_question_id': 2, 'en': '$350 - $700', 'es': '$350 - $700', 'pl': '1500 - 3000 zł', 'icon_path': 'icons/price_mid.svg'},
    103: {'question_id': 1, 'next_question_id': 2, 'en': 'Above $700', 'es': 'Más de $700', 'pl': 'Powyżej 3000 zł', 'icon_path': 'icons/price_high.svg'},
    201: {'question_id': 2, 'next_question_id': 3, 'en': 'Calls & basic use', 'es': 'Llamadas y uso básico', 'pl': 'Tylko dzwonienie i SMS-y', 'icon_path': 'icons/calls.svg'},
    202: {'question_id': 2, 'next_question_id': 5, 'en': 'Photos & videos', 'es': 'Fotos y videos', 'pl': 'Robienie zdjęć i filmów', 'icon_path': 'icons/camera.svg'},
    203: {'question_id': 2, 'next_question_id': 7, 'en': 'Gaming', 'es': 'Juegos', 'pl': 'Granie w gry', 'icon_path': 'icons/gaming.svg'},
    301: {'question_id': 3, 'next_question_id': 4, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważna', 'icon_path': 'icons/battery_full2.svg'},
    302: {'question_id': 3, 'next_question_id': 5, 'en': 'Important, but not the most important', 'es': 'Importante, pero no lo más importante', 'pl': 'Ważna, ale nie najważniejsza', 'icon_path': 'icons/battery_mid2.svg'},
    303: {'question_id': 3, 'next_question_id': 6, 'en': 'Of little importance', 'es': 'Poco importante', 'pl': 'Mało istotna', 'icon_path': 'icons/battery_low2.svg'},
    401: {'question_id': 4, 'next_question_id': 11, 'en': 'As large a screen as possible', 'es': 'La pantalla más grande posible', 'pl': 'Jak największy ekran', 'icon_path': 'icons/screen_big.svg'},
    402: {'question_id': 4, 'next_question_id': 11, 'en': 'Standard', 'es': 'Estándar', 'pl': 'Standardowy', 'icon_path': 'icons/screen_mid.svg'},
    403: {'question_id': 4, 'next_question_id': 11, 'en': 'Compact screen', 'es': 'Pantalla compacta', 'pl': 'Kompaktowy ekran', 'icon_path': 'icons/screen_small.svg'},
    501: {'question_id': 5, 'next_question_id': 9, 'en': 'Good photos during the day', 'es': 'Buenas fotos de día', 'pl': 'Dobre zdjęcia w dzień', 'icon_path': 'icons/sun.svg'},
    502: {'question_id': 5, 'next_question_id': 6, 'en': 'A good front camera for selfies', 'es': 'Una buena cámara frontal para selfies', 'pl': 'Dobry przedni aparat do selfie', 'icon_path': 'icons/selfie.svg'},
    503: {'question_id': 5, 'next_question_id': 6, 'en': 'Versatile rear camera (e.g., for landscapes, portraits)', 'es': 'Cámara trasera versátil (p. ej., para paisajes, retratos)', 'pl': 'Wszechstronny tylny aparat', 'icon_path': 'icons/camera_rear.svg'},
    601: {'question_id': 6, 'next_question_id': 11, 'en': '128 GB', 'es': '128 GB', 'pl': '128 GB', 'icon_path': 'icons/memory_low.svg'},
    602: {'question_id': 6, 'next_question_id': 11, 'en': '256 GB', 'es': '256 GB', 'pl': '256 GB', 'icon_path': 'icons/memory_nomrmal.svg'},
    603: {'question_id': 6, 'next_question_id': 11, 'en': '512 GB or more', 'es': '512 GB o más', 'pl': '512 GB lub więcej', 'icon_path': 'icons/memory_high.svg'},
   701: {'question_id': 7, 'next_question_id': 8, 'en': 'I need the highest possible performance', 'es': 'Necesito el máximo rendimiento posible', 'pl': 'Potrzebuję najwyższej wydajności', 'icon_path': 'icons/performance_high.svg'},
    702: {'question_id': 7, 'next_question_id': 8, 'en': 'I need high performance for gaming', 'es': 'Necesito alto rendimiento para juegos', 'pl': 'Potrzebuję wysokiej wydajności w grach', 'icon_path': 'icons/performance_normal.svg'},
    703: {'question_id': 7, 'next_question_id': 8, 'en': 'Standard performance is enough for less demanding games', 'es': 'El rendimiento estándar es suficiente para juegos menos exigentes', 'pl': 'Wystarczy mi standardowa wydajność w mniej wymagających tytułach', 'icon_path': 'icons/performance_low.svg'},
    801: {'question_id': 8, 'next_question_id': 9, 'en': 'Android', 'es': 'Android', 'pl': 'Android', 'icon_path': 'icons/android.svg'},
    802: {'question_id': 8, 'next_question_id': 9, 'en': 'iOS', 'es': 'iOS', 'pl': 'iOS', 'icon_path': 'icons/apple.svg'},
    901: {'question_id': 9, 'next_question_id': 10,'en': 'Optical zoom', 'es': 'Zoom óptico', 'pl': 'Zoom optyczny', 'icon_path': 'icons/zoom.svg'},
    902: {'question_id': 9, 'next_question_id': 10, 'en': 'Video image stabilization', 'es': 'Estabilización de imagen de video', 'pl': 'Stabilizacja obrazu video', 'icon_path': 'icons/stabilization.svg'},
    903: {'question_id': 9, 'next_question_id': 10,'en': 'Good quality photos at night', 'es': 'Buena calidad de fotos nocturnas', 'pl': 'Dobra jakość zdjęć w nocy', 'icon_path': 'icons/moon.svg'},
    1001: {'question_id': 10, 'next_question_id': 11, 'en': 'Samsung', 'es': 'Samsung', 'pl': 'Samsung', 'icon_path': 'icons/samsung.svg'},
    1002: {'question_id': 10, 'next_question_id': 11, 'en': 'Apple', 'es': 'Apple', 'pl': 'Apple', 'icon_path': 'icons/apple.svg'},
    1003: {'question_id': 10, 'next_question_id': 11, 'en': 'I don''t have a preference', 'es': 'No tengo preferencia', 'pl': 'Nie mam preferencji', 'icon_path': 'icons/any.svg'},
    1101: {'question_id': 11, 'next_question_id': None, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważne', 'icon_path': 'icons/charging_fast.svg'},
    1102: {'question_id': 11, 'next_question_id': None, 'en': 'Neutral', 'es': 'Neutral', 'pl': 'Neutralne', 'icon_path': 'icons/charging_normal.svg'},
    1103: {'question_id': 11, 'next_question_id': None, 'en': 'Not important', 'es': 'No importa', 'pl': 'Nie ważne', 'icon_path': 'icons/charging_never_mind.svg'},
}
answers_x_products = {
    # 101: Najtańsze telefony
    # Algorytm: Telefony posortowane rosnąco po cenie – najtańszy jako pierwszy, najdroższy jako ostatni.
    # Użytkownik dostaje najwięcej punktów za wybór najtańszego modelu dla tej odpowiedzi.
    101: [251, 250, 209, 212, 210, 211, 216, 249, 244, 217, 245, 246, 248, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 102: Przedział 1500–3000 zł
    # Algorytm: Telefony posortowane według odległości ceny od środka przedziału 1500–3000 zł (najbliższy 2250 zł na początku).
    102: [211, 210, 216, 249, 244, 217, 212, 209, 251, 250, 245, 246, 248, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 103: Najdroższe telefony
    # Algorytm: Telefony posortowane malejąco po cenie – najdroższy jako pierwszy, najtańszy jako ostatni.
    103: [201, 203, 202, 239, 238, 240, 246, 242, 243, 247, 241, 218, 248, 246, 245, 217, 244, 249, 216, 211, 210, 212, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 201: Dzwonienie/SMS
    # Algorytm: Telefony z najprostszą obsługą, dobrą baterią, solidnością i niską ceną na początku listy.
    201: [251, 250, 209, 212, 210, 211, 216, 249, 244, 217, 245, 246, 248, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 202: Zdjęcia i filmy (aparat)
    # Algorytm: Najlepsze aparaty (najwyższa jakość zdjęć, zoom, tryby nocne, stabilizacja) na początku listy.
    202: [201, 203, 239, 247, 218, 202, 246, 211, 217, 248, 210, 241, 240, 238, 242, 243, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 203: Gry (wydajność)
    # Algorytm: Telefony z najmocniejszym procesorem, najlepszym GPU, dużą pamięcią RAM i szybkim ekranem na początku listy.
    203: [201, 203, 239, 238, 240, 246, 202, 241, 248, 218, 211, 217, 210, 242, 243, 247, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 301: Bateria bardzo ważna
    # Algorytm: Telefony z największą pojemnością baterii i najlepszą optymalizacją na początku listy.
    301: [239, 238, 218, 246, 241, 211, 217, 210, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 243, 242, 247, 248, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 302: Bateria ważna, ale nie najważniejsza
    # Algorytm: Telefony z dobrą baterią, ale też dobrą ogólną specyfikacją.
    302: [241, 246, 218, 239, 238, 211, 217, 210, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 243, 242, 247, 248, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 303: Mało ważna bateria
    # Algorytm: Priorytet dla innych cech, np. wydajność, aparat, design – bateria nie jest brana pod uwagę.
    303: [201, 203, 202, 239, 238, 240, 241, 246, 248, 218, 247, 243, 242, 211, 217, 210, 212, 209, 250, 251, 244, 249, 216, 245, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 401: Duży ekran
    # Algorytm: Telefony z największym ekranem na początku listy.
    401: [239, 238, 240, 241, 246, 218, 201, 203, 202, 248, 247, 243, 242, 211, 217, 210, 212, 209, 250, 251, 244, 249, 216, 245, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 402: Standardowy ekran
    # Algorytm: Telefony o przekątnej ekranu w okolicach 6.1-6.4 cala, reszta dalej.
    402: [251, 250, 209, 212, 210, 211, 216, 249, 244, 217, 245, 246, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 501: Selfie
    # Algorytm: Telefony z najlepszym przednim aparatem (wysoka rozdzielczość, autofocus) na początku listy.
    501: [201, 203, 239, 247, 218, 202, 246, 211, 217, 248, 210, 241, 240, 238, 242, 243, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 502: Zdjęcia nocne
    # Algorytm: Telefony z najlepszym trybem nocnym i jasnym obiektywem na początku listy.
    502: [201, 203, 239, 247, 218, 202, 246, 211, 217, 248, 210, 241, 240, 238, 242, 243, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 503: Wszechstronny aparat
    # Algorytm: Telefony z kilkoma obiektywami, dobrym zoomem, szerokim kątem, makro itd.
    503: [201, 203, 239, 247, 218, 202, 246, 211, 217, 248, 210, 241, 240, 238, 242, 243, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 601: 128GB
    # Algorytm: Telefony z minimum 128GB pamięci, najtańsze na początku.
    601: [251, 250, 209, 212, 210, 211, 216, 249, 244, 217, 245, 246, 248, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 602: 256GB
    # Algorytm: Telefony z minimum 256GB pamięci, najtańsze na początku.
    602: [245, 246, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 251, 250, 209, 212, 210, 211, 216, 249, 244, 217],

    # 603: 512GB+
    # Algorytm: Telefony z minimum 512GB pamięci lub więcej, od najtańszego do najdroższego.
    603: [201, 203, 239, 238, 240, 246, 241, 247, 243, 242, 218, 248, 246, 245, 217, 244, 249, 216, 211, 210, 212, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 701: Top wydajność
    # Algorytm: Telefony z najlepszym SoC, największą ilością RAM, najnowszymi technologiami.
    701: [201, 203, 239, 238, 240, 246, 202, 241, 248, 218, 211, 217, 210, 242, 243, 247, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 702: Wysoka wydajność do gier
    # Algorytm: Tak jak wyżej, z naciskiem na GPU i szybkie ekrany.
    702: [201, 203, 239, 238, 240, 246, 202, 241, 248, 218, 211, 217, 210, 242, 243, 247, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 703: Standardowa wydajność
    # Algorytm: Telefony z podstawowym, ale stabilnym SoC, niższa cena.
    703: [251, 250, 209, 212, 210, 211, 216, 249, 244, 217, 245, 246, 248, 218, 241, 247, 243, 242, 246, 240, 238, 239, 202, 203, 201, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 801: Android
    # Algorytm: Wszystkie telefony z Androidem na początku listy.
    801: [239, 238, 240, 241, 246, 218, 248, 247, 243, 242, 211, 217, 210, 212, 209, 250, 251, 244, 249, 216, 245, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 201, 202, 203],

    # 802: iOS
    # Algorytm: Wszystkie telefony Apple na początku listy.
    802: [201, 202, 203, 239, 238, 240, 241, 246, 218, 248, 247, 243, 242, 211, 217, 210, 212, 209, 250, 251, 244, 249, 216, 245, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 901: Zoom optyczny
    # Algorytm: Telefony z najlepszym zoomem optycznym na początku.
    901: [201, 203, 239, 202, 246, 218, 248, 247, 243, 242, 211, 217, 210, 241, 240, 238, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 902: Stabilizacja video
    # Algorytm: Telefony z najlepszą stabilizacją OIS/EIS na początku.
    902: [201, 203, 239, 202, 246, 218, 248, 247, 243, 242, 211, 217, 210, 241, 240, 238, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 903: Jakość zdjęć nocnych
    # Algorytm: Telefony z najlepszym trybem nocnym i dużą matrycą na początku.
    903: [201, 203, 239, 202, 246, 218, 248, 247, 243, 242, 211, 217, 210, 241, 240, 238, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 1001: Samsung
    # Algorytm: Wszystkie telefony marki Samsung na początku.
    1001: [245, 246, 240, 238, 239, 241, 247, 243, 242, 218, 248, 201, 202, 203, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 250, 251, 209, 212, 210, 211, 216, 249, 244, 217],

    # 1002: Apple
    # Algorytm: Wszystkie telefony marki Apple na początku.
    1002: [201, 202, 203, 245, 246, 240, 238, 239, 241, 247, 243, 242, 218, 248, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 250, 251, 209, 212, 210, 211, 216, 249, 244, 217],

    # 1003: Dowolna marka
    # Algorytm: Wszystkie telefony w dowolnej kolejności.
    1003: [201, 203, 239, 202, 246, 218, 248, 247, 243, 242, 211, 217, 210, 241, 240, 238, 212, 249, 244, 216, 245, 209, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 1101: Bardzo ważne szybkie ładowanie
    # Algorytm: Telefony z najszybszym ładowaniem na początku listy.
    1101: [239, 238, 246, 218, 241, 247, 243, 242, 211, 217, 210, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 248, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 1102: Neutralne szybkie ładowanie
    # Algorytm: Telefony z szybkim (ale nie topowym) ładowaniem na początku.
    1102: [241, 246, 218, 239, 238, 211, 217, 210, 240, 201, 203, 249, 244, 216, 245, 212, 209, 250, 251, 202, 243, 242, 247, 248, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],

    # 1103: Nie ważne szybkie ładowanie
    # Algorytm: Szybkość ładowania nie ma znaczenia – dowolna kolejność.
    1103: [201, 203, 202, 239, 238, 240, 241, 246, 248, 218, 247, 243, 242, 211, 217, 210, 212, 209, 250, 251, 244, 249, 216, 245, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276],
}

products_db = {
201: {'pl': 'iPhone 15 Pro Max', 'en': 'iPhone 15 Pro Max', 'es': 'iPhone 15 Pro Max', 'image_path': 'graphic/iphone_15_pro_max.png'},
202: {'pl': 'iPhone 15', 'en': 'iPhone 15', 'es': 'iPhone 15', 'image_path': 'graphic/iphone_15.png'},
203: {'pl': 'iPhone 15 Pro', 'en': 'iPhone 15 Pro', 'es': 'iPhone 15 Pro', 'image_path': 'graphic/iphone_15_pro.png'},
204: {'pl': 'iPhone 15 Plus', 'en': 'iPhone 15 Plus', 'es': 'iPhone 15 Plus', 'image_path': 'graphic/iphone_15_plus.png'},
205: {'pl': 'iPhone 14 Pro Max', 'en': 'iPhone 14 Pro Max', 'es': 'iPhone 14 Pro Max', 'image_path': 'graphic/iphone_14_pro_max.png'},
206: {'pl': 'iPhone 14', 'en': 'iPhone 14', 'es': 'iPhone 14', 'image_path': 'graphic/iphone_14.png'},
207: {'pl': 'iPhone 14 Pro', 'en': 'iPhone 14 Pro', 'es': 'iPhone 14 Pro', 'image_path': 'graphic/iphone_14_pro.png'},
208: {'pl': 'iPhone 13', 'en': 'iPhone 13', 'es': 'iPhone 13', 'image_path': 'graphic/iphone_13.png'},
209: {'pl': 'iPhone SE 3rd Gen', 'en': 'iPhone SE 3rd Gen', 'es': 'iPhone SE 3rd Gen', 'image_path': 'graphic/iphone_se_3rd_gen.png'},
210: {'pl': 'iPhone 12', 'en': 'iPhone 12', 'es': 'iPhone 12', 'image_path': 'graphic/iphone_12.png'},
211: {'pl': 'Samsung Galaxy S23 Ultra', 'en': 'Samsung Galaxy S23 Ultra', 'es': 'Samsung Galaxy S23 Ultra', 'image_path': 'graphic/samsung_galaxy_s23_ultra.png'},
212: {'pl': 'Samsung Galaxy S23', 'en': 'Samsung Galaxy S23', 'es': 'Samsung Galaxy S23', 'image_path': 'graphic/samsung_galaxy_s23.png'},
213: {'pl': 'Samsung Galaxy S23 FE', 'en': 'Samsung Galaxy S23 FE', 'es': 'Samsung Galaxy S23 FE', 'image_path': 'graphic/samsung_galaxy_s23_fe.png'},
214: {'pl': 'Samsung Galaxy S22', 'en': 'Samsung Galaxy S22', 'es': 'Samsung Galaxy S22', 'image_path': 'graphic/samsung_galaxy_s22.png'},
215: {'pl': 'Samsung Galaxy A54', 'en': 'Samsung Galaxy A54', 'es': 'Samsung Galaxy A54', 'image_path': 'graphic/samsung_galaxy_a54.png'},
216: {'pl': 'Samsung Galaxy A34', 'en': 'Samsung Galaxy A34', 'es': 'Samsung Galaxy A34', 'image_path': 'graphic/samsung_galaxy_a34.png'},
217: {'pl': 'Samsung Galaxy A14', 'en': 'Samsung Galaxy A14', 'es': 'Samsung Galaxy A14', 'image_path': 'graphic/samsung_galaxy_a14.png'},
218: {'pl': 'Samsung Galaxy A14 5G', 'en': 'Samsung Galaxy A14 5G', 'es': 'Samsung Galaxy A14 5G', 'image_path': 'graphic/samsung_galaxy_a14_5g.png'},
219: {'pl': 'Samsung Galaxy A24', 'en': 'Samsung Galaxy A24', 'es': 'Samsung Galaxy A24', 'image_path': 'graphic/samsung_galaxy_a24.png'},
220: {'pl': 'Samsung Galaxy M14', 'en': 'Samsung Galaxy M14', 'es': 'Samsung Galaxy M14', 'image_path': 'graphic/samsung_galaxy_m14.png'},
221: {'pl': 'Samsung Galaxy A05s', 'en': 'Samsung Galaxy A05s', 'es': 'Samsung Galaxy A05s', 'image_path': 'graphic/samsung_galaxy_a05s.png'},
222: {'pl': 'Xiaomi Redmi Note 13', 'en': 'Xiaomi Redmi Note 13', 'es': 'Xiaomi Redmi Note 13', 'image_path': 'graphic/xiaomi_redmi_note_13.png'},
223: {'pl': 'Xiaomi Redmi Note 12', 'en': 'Xiaomi Redmi Note 12', 'es': 'Xiaomi Redmi Note 12', 'image_path': 'graphic/xiaomi_redmi_note_12.png'},
224: {'pl': 'Xiaomi Redmi Note 13 Pro', 'en': 'Xiaomi Redmi Note 13 Pro', 'es': 'Xiaomi Redmi Note 13 Pro', 'image_path': 'graphic/xiaomi_redmi_note_13_pro.png'},
225: {'pl': 'Xiaomi Redmi Note 12 Pro', 'en': 'Xiaomi Redmi Note 12 Pro', 'es': 'Xiaomi Redmi Note 12 Pro', 'image_path': 'graphic/xiaomi_redmi_note_12_pro.png'},
226: {'pl': 'Xiaomi Redmi 13C', 'en': 'Xiaomi Redmi 13C', 'es': 'Xiaomi Redmi 13C', 'image_path': 'graphic/xiaomi_redmi_13c.png'},
227: {'pl': 'Xiaomi Redmi 12C', 'en': 'Xiaomi Redmi 12C', 'es': 'Xiaomi Redmi 12C', 'image_path': 'graphic/xiaomi_redmi_12c.png'},
228: {'pl': 'Xiaomi Poco X6', 'en': 'Xiaomi Poco X6', 'es': 'Xiaomi Poco X6', 'image_path': 'graphic/xiaomi_poco_x6.png'},
229: {'pl': 'Xiaomi Poco X5', 'en': 'Xiaomi Poco X5', 'es': 'Xiaomi Poco X5', 'image_path': 'graphic/xiaomi_poco_x5.png'},
230: {'pl': 'Xiaomi Poco F5', 'en': 'Xiaomi Poco F5', 'es': 'Xiaomi Poco F5', 'image_path': 'graphic/xiaomi_poco_f5.png'},
231: {'pl': 'Oppo A78', 'en': 'Oppo A78', 'es': 'Oppo A78', 'image_path': 'graphic/oppo_a78.png'},
232: {'pl': 'Oppo Reno 11', 'en': 'Oppo Reno 11', 'es': 'Oppo Reno 11', 'image_path': 'graphic/oppo_reno_11.png'},
233: {'pl': 'Realme 11', 'en': 'Realme 11', 'es': 'Realme 11', 'image_path': 'graphic/realme_11.png'},
234: {'pl': 'Realme 10', 'en': 'Realme 10', 'es': 'Realme 10', 'image_path': 'graphic/realme_10.png'},
235: {'pl': 'Vivo Y36', 'en': 'Vivo Y36', 'es': 'Vivo Y36', 'image_path': 'graphic/vivo_y36.png'},
236: {'pl': 'Vivo Y16', 'en': 'Vivo Y16', 'es': 'Vivo Y16', 'image_path': 'graphic/vivo_y16.png'},
237: {'pl': 'Honor 90', 'en': 'Honor 90', 'es': 'Honor 90', 'image_path': 'graphic/honor_90.png'},
238: {'pl': 'Honor X7b', 'en': 'Honor X7b', 'es': 'Honor X7b', 'image_path': 'graphic/honor_x7b.png'},
239: {'pl': 'Motorola Moto G54 Power', 'en': 'Motorola Moto G54 Power', 'es': 'Motorola Moto G54 Power', 'image_path': 'graphic/motorola_moto_g54_power.png'},
240: {'pl': 'Motorola Moto G84', 'en': 'Motorola Moto G84', 'es': 'Motorola Moto G84', 'image_path': 'graphic/motorola_moto_g84.png'},
241: {'pl': 'Motorola Edge 40 Neo', 'en': 'Motorola Edge 40 Neo', 'es': 'Motorola Edge 40 Neo', 'image_path': 'graphic/motorola_edge_40_neo.png'},
242: {'pl': 'Google Pixel 8', 'en': 'Google Pixel 8', 'es': 'Google Pixel 8', 'image_path': 'graphic/google_pixel_8.png'},
243: {'pl': 'Google Pixel 8 Pro', 'en': 'Google Pixel 8 Pro', 'es': 'Google Pixel 8 Pro', 'image_path': 'graphic/google_pixel_8_pro.png'},
244: {'pl': 'Google Pixel 7a', 'en': 'Google Pixel 7a', 'es': 'Google Pixel 7a', 'image_path': 'graphic/google_pixel_7a.png'},
245: {'pl': 'Google Pixel 7', 'en': 'Google Pixel 7', 'es': 'Google Pixel 7', 'image_path': 'graphic/google_pixel_7.png'},
246: {'pl': 'Huawei P60 Pro', 'en': 'Huawei P60 Pro', 'es': 'Huawei P60 Pro', 'image_path': 'graphic/huawei_p60_pro.png'},
247: {'pl': 'Huawei Nova 12', 'en': 'Huawei Nova 12', 'es': 'Huawei Nova 12', 'image_path': 'graphic/huawei_nova_12.png'},
248: {'pl': 'OnePlus 12', 'en': 'OnePlus 12', 'es': 'OnePlus 12', 'image_path': 'graphic/oneplus_12.png'},
249: {'pl': 'OnePlus Nord 3', 'en': 'OnePlus Nord 3', 'es': 'OnePlus Nord 3', 'image_path': 'graphic/oneplus_nord_3.png'},
250: {'pl': 'Tecno Spark 20', 'en': 'Tecno Spark 20', 'es': 'Tecno Spark 20', 'image_path': 'graphic/tecno_spark_20.png'},
251: {'pl': 'Infinix Hot 40', 'en': 'Infinix Hot 40', 'es': 'Infinix Hot 40', 'image_path': 'graphic/infinix_hot_40.png'}
}
stores_db = {1: {'name': 'Amazon US', 'language': 'en'}, 2: {'name': 'Best Buy', 'language': 'en'}, 3: {'name': 'Allegro', 'language': 'pl'}, 4: {'name': 'Media Expert', 'language': 'pl'}, 5: {'name': 'Amazon ES', 'language': 'es'}}
product_links_db = {201: [{'store_id': 3, 'url': '#'}, {'store_id': 4, 'url': '#'}, {'store_id': 1, 'url': '#'}], 202: [{'store_id': 3, 'url': '#'}, {'store_id': 1, 'url': '#'}, {'store_id': 5, 'url': '#'}]}

# --- Punkty końcowe API ---

@app.route('/')
def home():
    return render_template('index.html')

# ============== JEDYNA DODANA ZMIANA ===============
@app.route('/quiz')
def quiz():
    return render_template('quiz.html')
# ===================================================

@app.route('/api/quiz/question', methods=['GET'])
def get_question():
    try:
        current_question_id = int(request.args.get('current_question_id', 1))
        language = request.args.get('language', 'en')

        question_data = questions_db.get(current_question_id)
        if not question_data:
            return jsonify({'error': 'Invalid question ID.'}), 404

        question_text = question_data.get(language, question_data['en'])
        
        # === BEZPIECZNE GENEROWANIE LINKU DO IKONY PYTANIA ===
        question_icon_url = ''
        icon_path = question_data.get('icon_path')
        if icon_path:
            # Sprawdź, czy plik istnieje, zanim wygenerujesz URL
            if os.path.exists(os.path.join(app.static_folder, icon_path)):
                question_icon_url = url_for('static', filename=icon_path)

        answers = []
        for ans_id, ans_data in answers_db.items():
            if ans_data['question_id'] == current_question_id:
                next_id = ans_data.get('next_question_id')
                next_id_for_frontend = next_id if next_id is not None else ''

                # === BEZPIECZNE GENEROWANIE LINKU DO IKONY ODPOWIEDZI ===
                answer_icon_url = ''
                icon_path = ans_data.get('icon_path')
                if icon_path:
                    # Sprawdź, czy plik istnieje, zanim wygenerujesz URL
                    if os.path.exists(os.path.join(app.static_folder, icon_path)):
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
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received.'}), 400

        path_answers = data.get('pathAnswers')
        language = data.get('language', 'en')

        if not path_answers or not isinstance(path_answers, list):
            return jsonify({'error': 'Invalid or missing "pathAnswers" parameter.'}), 400

        # NOWY ALGORYTM SCORINGOWY (answers_x_products)
        product_scores = {pid: 0 for pid in products_db.keys()}
        for answer_id in path_answers:
            ranking = answers_x_products.get(answer_id, [])
            n = len(ranking)
            for idx, phone_id in enumerate(ranking):
                if phone_id in product_scores:
                    product_scores[phone_id] += n - idx

        # Sortuj produkty po punktach malejąco, wybierz tylko te z punktami
        top_products = sorted(product_scores.items(), key=lambda x: x[1], reverse=True)
        product_ids = [pid for pid, score in top_products if score > 0][:3]

        if not product_ids:
            return jsonify({'recommendations': [], 'message': 'No specific recommendations found for your answers.'})

        recommendations = []
        matching_store_ids = [store_id for store_id, store_data in stores_db.items() if store_data['language'] == language]

        for product_id in product_ids:
            product_data = products_db.get(product_id)
            if not product_data:
                continue

            product_name = product_data.get(language, product_data['en'])

            product_links = []
            for link_data in product_links_db.get(product_id, []):
                if link_data['store_id'] in matching_store_ids:
                    store_name = stores_db[link_data['store_id']]['name']
                    product_links.append({
                        'store_name': store_name,
                        'link_url': link_data['url']
                    })

            image_url = ''
            if product_data.get('image_path'):
                if os.path.exists(os.path.join(app.static_folder, product_data['image_path'])):
                    image_url = url_for('static', filename=product_data['image_path'])

            recommendations.append({
                'product_id': product_id,
                'product_name': product_name,
                'image_url': image_url,
                'links': product_links
            })

        return jsonify({'recommendations': recommendations})

    except Exception as e:
        return jsonify({'error': 'An internal server error occurred', 'details': str(e)}), 500

@app.route('/api/languages', methods=['GET'])
def get_languages():
    languages = [
        {'code': 'en', 'name': 'English'},
        {'code': 'es', 'name': 'Español'},
        {'code': 'pl', 'name': 'Polski'}
    ]
    return jsonify({'languages': languages})

if __name__ == '__main__':
    app.run(debug=True)
