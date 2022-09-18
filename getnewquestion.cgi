#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
from readfields import default,readfields
def getNewQuestion(student, qid, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    data=C.execute("SELECT question,figure,answers,id FROM questions WHERE current=1").fetchone()
    if data:
        question,figure,answers,id=data
        if not qid==id: #this is a new question so register in the system
            C.execute("INSERT OR IGNORE INTO responses (student,question,date) VALUES (?,?,datetime('now','localtime'))",(student,id))
            C.commit()

        return {"question":question,
                "figure":figure,
                "answers":answers,
                "id":id}
    else:
        return

if __name__ == "__main__":
    f = readfields(["student", "qid", "course"])
    print("Content-type:application/json\n")
    print( json.dumps( getNewQuestion( f.student, f.qid, default(f.course,"db") )))


