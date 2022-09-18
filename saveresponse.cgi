#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import json
from readfields import default,readfields
def saveResponse(student, question, response, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")    
    C.execute("INSERT OR IGNORE INTO responses (student,question) VALUES (?,?)",(student,question))
    C.execute("UPDATE responses SET response=?, date=datetime('now','localtime') WHERE student=? AND question=?",(response,student,question))
    C.commit()

if __name__ == "__main__":
    f = readfields(["student", "question", "response", "course"])
    saveResponse(f.student, f.question, f.response, default(f.course,"db"))
    print("Status: 200 OK")
    print("Content-type:text/plain\n")

