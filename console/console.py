#!/usr/bin/env python3
import sqlite3
def getDB(course):
    #have a default?
    return sqlite3.connect(f"../DB/{course}.db")
