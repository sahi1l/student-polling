#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import json
from readfields import default,readfields
import sys
from console import getDB
def AddQuestion(P):
    C=getDB(P.course)
    if P.id == "NEW":
        P.id=C.execute("SELECT MAX(id) from questions").fetchone()[0]
        if type(P.id)==type(None):
           P.id=0
        P.id+=1
        C.execute("INSERT INTO questions (id,category,question,figure,answers,correct,changed) VALUES (?,?,?,?,?,?,DATETIME('now','localtime'))",(P.id,P.category,P.question,P.figure,P.answers,P.correct))
    else:
        C.execute("UPDATE questions SET category=?,question=?,figure=?,answers=?,correct=?,changed=DATETIME('now','localtime') WHERE id=?",(P.category,P.question,P.figure,P.answers,P.correct,P.id))
    if P.current==1 or P.current=="1":
#        sys.stderr.write(f"Making the question {id=} current because {current=}.")
        C.execute("UPDATE questions SET current=0 WHERE id!=?",(P.id,))
        C.execute("UPDATE questions SET current=1 WHERE id=?",(P.id,))
    else:
        pass
#        sys.stderr.write(f"Actually current was equal to {current=}.")

    C.commit()
    result = {
        "id": P.id,
        }
    return result

if __name__ == "__main__":
    f = readfields(["id", "category", "question", "answers", "figure", "correct", "current", "course"])
    sys.stderr.write(json.dumps(f))
    result = AddQuestion(f)
    print("Content-type:application/json\n")
    print(json.dumps(result))


#FIX: Error catching
