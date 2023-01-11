#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
from readfields import default,readfields
from console import getDB
def noCurrent(): 
    C=getDB(course)
    C.execute("UPDATE questions SET current=0")
    C.commit()

if __name__ == "__main__":
    f = readfields(["course"])
    noCurrent(f.course)
    print("Content-type:application/json\n\n",json.dumps({}))
