# Sprawdź wszystkie możliwe ścieżki w quizie i zlicz liczbę pytań w każdej ścieżce

def build_paths(answers_db, start_qid):
    # Mapowanie: pytanie -> lista odpowiedzi
    question_to_answers = {}
    for ans_id, ans in answers_db.items():
        qid = ans['question_id']
        question_to_answers.setdefault(qid, []).append((ans_id, ans.get('next_question_id')))

    paths = []

    def dfs(qid, path):
        if qid not in question_to_answers:
            # Brak odpowiedzi na to pytanie, kończymy ścieżkę
            paths.append(path.copy())
            return
        for ans_id, next_qid in question_to_answers[qid]:
            path.append((qid, ans_id))
            if not next_qid or next_qid == "" or next_qid == None:
                # Brak następnego pytania, kończymy ścieżkę
                paths.append(path.copy())
            else:
                dfs(int(next_qid), path)
            path.pop()

    dfs(start_qid, [])
    return paths

# --- Twój kod: załaduj questions_db i answers_db ---
# questions_db = {...}
# answers_db = {...}

if __name__ == "__main__":
    start_question_id = 1
    all_paths = build_paths(answers_db, start_question_id)
    print(f"Liczba ścieżek: {len(all_paths)}\n")
    for idx, path in enumerate(all_paths, 1):
        qids = [str(qid) for qid, ans_id in path]
        print(f"Ścieżka {idx}: długość={len(qids)}, pytania={qids}")
