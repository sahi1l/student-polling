#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
from readfields import default,readfields

def doLogin(course, code, email):
    try:
        C = sqlite3.connect(f"DB/{course}.db")
        data = C.execute("INSERT INTO logins (code, student, date) VALUES (?,?,datetime('now','localtime'))", (code, email))
        C.commit()
        return "OK"
    #   return "Status: 200 OK\n\n"
    except Exception as e:
        return f"ERROR: {e}"
    #        return f"Status: 400 Error\n\n{e}"

if __name__ == "__main__":
    f = readfields(["course", "code", "email"])
    print("Content-type:application/json\n")
    print( json.dumps( doLogin(f.course, f.code, f.email) ) )


