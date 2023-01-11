#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
from readfields import default,readfields
def GetQuestions(category, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    if category:
        data=C.execute("SELECT id,category,question FROM questions WHERE category=? ORDER BY changed",(category,)).fetchall()
    else:
        data=C.execute("SELECT id,category,question FROM questions ORDER BY category").fetchall()
    #FIX: ORDER BY changed
    results={}
    for line in data:
        results[line[0]]={"category":line[1], "question":line[2]}
    return results

if __name__ == "__main__":
    print("Content-type: application/json\n")
    f = readfields(["category", "course"])
    results = GetQuestions(f.category, default(f.course,"db"))
    print(json.dumps(results))
