#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
form=cgi.FieldStorage()
print("Content-type: text/json\n")
C=sqlite3.connect("DB/db.db")
if "question" in form:
    question=form["question"].value
else:
    data=C.execute("SELECT id FROM questions WHERE current=1").fetchone()
    if data:
        question=data[0]
    else:
        question=None

result={}
if not question==None:
    data=C.execute("SELECT response,COUNT(*) FROM responses GROUP BY response") #does a histogram
    if data:
        for a,b in data.fetchall():
            result[a]=b
print(json.dumps(result))
        
