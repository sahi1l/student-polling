#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import json
from readfields import default,readfields

def GetQuestion(id, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    if id: #getting a specific question
        data=C.execute("SELECT question,category,figure,answers,id FROM questions WHERE id=?",(id,)).fetchone()
    else: #getting the current question
        data=C.execute("SELECT question,category,figure,answers,id FROM questions WHERE current=1").fetchone()
    
    if data:
        question, category, figure, answers, id = data
        return json.dumps({"question":question,
                "category":category,
                "figure":figure,
                "answers":answers,
                "id":id})
    else:
        return json.dumps({})

if __name__ == "__main__":
    print("Content-type:application/json\n")
    f = readfields(["id", "course"])
    print(GetQuestion(f.id, default(f.course, "db")))
