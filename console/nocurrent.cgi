#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
from readfields import default,readfields
def noCurrent(course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    C.execute("UPDATE questions SET current=0")
    C.commit()

if __name__ == "__main__":
    f = readfields(["course"])
    noCurrent(default(f.course, "db"))
    print("Content-type:application/json\n\n",json.dumps({}))
