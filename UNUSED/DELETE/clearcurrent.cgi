#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import json
import sys
from readfields import default,readfields

def ClearCurrent(course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    data=C.execute("SELECT id FROM questions WHERE current=1").fetchone()
    if data:
        C.execute("DELETE FROM responses WHERE question=?",data)
        C.execute("DELETE FROM comments WHERE question=?",data)
        C.commit()
        return 1
    else:
        return 0

if __name__ == "__main__":
    f = readfields(["course"])
    print(ClearCurrent(default(f.course, "db")))
    print("Content-type:application/json\n")

