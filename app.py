from flask import Flask, jsonify, request, render_template, url_for
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# --- Symulacja Bazy Danych ---

# Pytania z ikonami
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

# Odpowiedzi z ikonami
answers_db = {
    101: {'question_id': 1, 'next_question_id': 2, 'en': 'Under $350', 'es': 'Menos de $350', 'pl': 'Poniżej 1500 zł', 'icon_path': 'icons/price_low.svg'},
    102: {'question_id': 1, 'next_question_id': 2, 'en': '$350 - $700', 'es': '$350 - $700', 'pl': '1500 - 3000 zł', 'icon_path': 'icons/price_mid.svg'},
    103: {'question_id': 1, 'next_question_id': 2, 'en': 'Above $700', 'es': 'Más de $700', 'pl': 'Powyżej 3000 zł', 'icon_path': 'icons/price_high.svg'},
    201: {'question_id': 2, 'next_question_id': 3, 'en': 'Calls & basic use', 'es': 'Llamadas y uso básico', 'pl': 'Tylko dzwonienie i SMS-y', 'icon_path': 'icons/calls.svg'},
    202: {'question_id': 2, 'next_question_id': 5, 'en': 'Photos & videos', 'es': 'Fotos y videos', 'pl': 'Robienie zdjęć i filmów', 'icon_path': 'icons/camera.svg'},
    203: {'question_id': 2, 'next_question_id': 7, 'en': 'Gaming', 'es': 'Juegos', 'pl': 'Granie w gry', 'icon_path': 'icons/gaming.svg'},
    301: {'question_id': 3, 'next_question_id': 4, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważna', 'icon_path': 'icons/battery_full.svg'},
    302: {'question_id': 3, 'next_question_id': 5, 'en': 'Important, but not the most important', 'es': 'Importante, pero no lo más importante', 'pl': 'Ważna, ale nie najważniejsza', 'icon_path': 'icons/battery_mid.svg'},
    303: {'question_id': 3, 'next_question_id': 6, 'en': 'Of little importance', 'es': 'Poco importante', 'pl': 'Mało istotna', 'icon_path': 'icons/battery_low.svg'},
    401: {'question_id': 4, 'next_question_id': 11, 'en': 'As large a screen as possible', 'es': 'La pantalla más grande posible', 'pl': 'Jak największy ekran', 'icon_path': 'icons/screen_large.svg'},
    402: {'question_id': 4, 'next_question_id': 11, 'en': 'Standard', 'es': 'Estándar', 'pl': 'Standardowy', 'icon_path': 'icons/screen_mid.svg'},
    403: {'question_id': 4, 'next_question_id': 11, 'en': 'Compact screen', 'es': 'Pantalla compacta', 'pl': 'Kompaktowy ekran', 'icon_path': 'icons/screen_small.svg'},
    501: {'question_id': 5, 'next_question_id': 9, 'en': 'Good photos during the day', 'es': 'Buenas fotos de día', 'pl': 'Dobre zdjęcia w dzień', 'icon_path': 'icons/sun.svg'},
    502: {'question_id': 5, 'next_question_id': 6, 'en': 'A good front camera for selfies', 'es': 'Una buena cámara frontal para selfies', 'pl': 'Dobry przedni aparat do selfie', 'icon_path': 'icons/selfie.svg'},
    503: {'question_id': 5, 'next_question_id': 6, 'en': 'Versatile rear camera (e.g., for landscapes, portraits)', 'es': 'Cámara trasera versátil (p. ej., para paisajes, retratos)', 'pl': 'Wszechstronny tylny aparat', 'icon_path': 'icons/camera_versatile.svg'},
    601: {'question_id': 6, 'next_question_id': 11, 'en': '128 GB', 'es': '128 GB', 'pl': '128 GB', 'icon_path': 'icons/memory.svg'},
    602: {'question_id': 6, 'next_question_id': 11, 'en': '256 GB', 'es': '256 GB', 'pl': '256 GB', 'icon_path': 'icons/memory.svg'},
    603: {'question_id': 6, 'next_question_id': 11, 'en': '512 GB or more', 'es': '512 GB o más', 'pl': '512 GB lub więcej', 'icon_path': 'icons/memory.svg'},
    701: {'question_id': 7, 'next_question_id': 8, 'en': 'High performance', 'es': 'Alto rendimiento', 'pl': 'Wysoka wydajność', 'icon_path': 'icons/performance.svg'},
    801: {'question_id': 8, 'next_question_id': 9, 'en': 'Android', 'es': 'Android', 'pl': 'Android', 'icon_path': 'icons/android.svg'},
    802: {'question_id': 8, 'next_question_id': 9, 'en': 'iOS', 'es': 'iOS', 'pl': 'iOS', 'icon_path': 'icons/apple.svg'},
    901: {'question_id': 9, 'next_question_id': 10,'en': 'Optical zoom', 'es': 'Zoom óptico', 'pl': 'Zoom optyczny', 'icon_path': 'icons/zoom.svg'},
    902: {'question_id': 9, 'next_question_id': 10, 'en': 'Video image stabilization', 'es': 'Estabilización de imagen de video', 'pl': 'Stabilizacja obrazu video', 'icon_path': 'icons/stabilization.svg'},
    903: {'question_id': 9, 'next_question_id': 10,'en': 'Good quality photos at night', 'es': 'Buena calidad de fotos nocturnas', 'pl': 'Dobra jakość zdjęć w nocy', 'icon_path': 'icons/moon.svg'},
    1001: {'question_id': 10, 'next_question_id': 11, 'en': 'Samsung', 'es': 'Samsung', 'pl': 'Samsung', 'icon_path': 'icons/samsung.svg'},
    1002: {'question_id': 10, 'next_question_id': 11, 'en': 'Apple', 'es': 'Apple', 'pl': 'Apple', 'icon_path': 'icons/apple.svg'},
    1003: {'question_id': 10, 'next_question_id': 11, 'en': 'I don''t have a preference', 'es': 'No tengo preferencia', 'pl': 'Nie mam preferencji', 'icon_path': 'icons/any.svg'},
    1101: {'question_id': 11, 'next_question_id': None, 'en': 'Very important', 'es': 'Muy importante', 'pl': 'Bardzo ważne', 'icon_path': 'icons/charging_fast.svg'},
    1102: {'question_id': 11, 'next_question_id': None, 'en': 'Neutral', 'es': 'Neutral', 'pl': 'Neutralne', 'icon_path': 'icons/any.svg'},
    1103: {'question_id': 11, 'next_question_id': None, 'en': 'Not important', 'es': 'No importa', 'pl': 'Nie ważne', 'icon_path': 'icons/charging_slow.svg'},
}

# === TWOJA NAJNOWSZA WERSJA paths_db ===
paths_db = {
    (101,201,301,401,1101): [201, 202, 203],
    (101,202,301,401,1101): [304, 305, 306],
    (101,201,302,401,1101): [407, 408, 409],
    (102,201,301,402,1101): [201, 202, 203],
    (102,202,301,402,1101): [304, 305, 306],
    (102,201,302,402,1101): [407, 408, 409]
}

products_db = {
    201: {'pl': 'Xiaomi Redmi Note 13', 'en': 'Xiaomi Redmi Note 13', 'es': 'Xiaomi Redmi Note 13', 'image_path': 'graphic/xiaomi_redmi_note_13.png'},
    202: {'pl': 'Motorola Moto G54 Power', 'en': 'Motorola Moto G54 Power', 'es': 'Motorola Moto G54 Power', 'image_path': 'graphic/motorola_moto_g54.png'},
    203: {'pl': 'Samsung Galaxy A15', 'en': 'Samsung Galaxy A15', 'es': 'Samsung Galaxy A15', 'image_path': 'graphic/samsung_galaxy_a15.png'},
    304: {'pl': 'Samsung Galaxy S23 FE', 'en': 'Samsung Galaxy S23 FE', 'es': 'Samsung Galaxy S23 FE', 'image_path': 'graphic/samsung_galaxy_s23_fe.png'},
    305: {'pl': 'Google Pixel 7a', 'en': 'Google Pixel 7a', 'es': 'Google Pixel 7a', 'image_path': 'graphic/google_pixel_7a.png'},
    306: {'pl': 'Xiaomi 13T', 'en': 'Xiaomi 13T', 'es': 'Xiaomi 13T', 'image_path': 'graphic/xiaomi_13t.png'},
    407: {'pl': 'OnePlus 12', 'en': 'OnePlus 12', 'es': 'OnePlus 12', 'image_path': 'graphic/oneplus_12.png'},
    408: {'pl': 'ASUS ROG Phone 8', 'en': 'ASUS ROG Phone 8', 'es': 'ASUS ROG Phone 8', 'image_path': 'graphic/asus_rog_phone_8.png'},
    409: {'pl': 'Samsung Galaxy S24 Ultra', 'en': 'Samsung Galaxy S24 Ultra', 'es': 'Samsung Galaxy S24 Ultra', 'image_path': 'graphic/samsung_galaxy_s24_ultra.png'},
}
stores_db = {1: {'name': 'Amazon US', 'language': 'en'}, 2: {'name': 'Best Buy', 'language': 'en'}, 3: {'name': 'Allegro', 'language': 'pl'}, 4: {'name': 'Media Expert', 'language': 'pl'}, 5: {'name': 'Amazon ES', 'language': 'es'}, 6: {'name': 'El Corte Inglés', 'language': 'es'},}
product_links_db = {201: [{'store_id': 3, 'url': '#'}, {'store_id': 4, 'url': '#'}, {'store_id': 1, 'url': '#'}], 202: [{'store_id': 3, 'url': '#'}, {'store_id': 1, 'url': '#'}, {'store_id': 5, 'url': '#'}], 203: [{'store_id': 3, 'url': '#'}, {'store_id': 1, 'url': '#'}], 304: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}], 305: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}], 306: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}], 407: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}], 408: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}], 409: [{'store_id': 1, 'url': '#'}, {'store_id': 2, 'url': '#'}, {'store_id': 3, 'url': '#'}],}

# --- Punkty końcowe API ---

@app.route('/')
def home():
    return render_template('index.html')

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
        if question_data.get('icon_path'):
            question_icon_url = url_for('static', filename=question_data['icon_path'])

        answers = []
        for ans_id, ans_data in answers_db.items():
            if ans_data['question_id'] == current_question_id:
                next_id = ans_data.get('next_question_id')
                next_id_for_frontend = next_id if next_id is not None else ''

                answer_icon_url = ''
                if ans_data.get('icon_path'):
                    answer_icon_url = url_for('static', filename=ans_data['icon_path'])

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

        path_key = tuple(sorted(path_answers))
        product_ids = paths_db.get(path_key)

        if not product_ids:
            return jsonify({'recommendations': [], 'message': 'No specific recommendations found for this path.'})

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
