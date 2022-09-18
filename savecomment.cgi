#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import json
from readfields import default,readfields
def saveComment(student, question, response, comment, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")    
    C.execute("INSERT OR IGNORE INTO comments (student,question) VALUES (?,?)",(student,question))
    C.execute("UPDATE comments SET comment=?, response=?, date=datetime('now','localtime') WHERE student=? AND question=?",(comment,response,student,question))
    C.commit()

if __name__ == "__main__":
    f = readfields(["student", "question", "response", "comment", "course"])
    saveComment(f.student, f.question, f.response, f.comment, default(f.course,"db"))
    print("Status: 200 OK")
    print("Content-type:text/plain\n")

