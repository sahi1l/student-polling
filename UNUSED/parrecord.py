#!/usr/bin/env python3
#Goal: given an id code, return which dates they participated in and their score
import sqlite3
from readfields import readfields

def get(student):
    C = sqlite3.connect("DB/101.db")
    valid_dates = {} #key = date, value = 0 (mwf) or 1 (tr)
    #Step 1: get all the valid dates with section number attached
#    cursor = C.execute("SELECT DISTINCT DATE(changed), strftime('%w',changed)%2 from questions")
    cursor = C.execute("SELECT DISTINCT DATE(date), strftime('%w',date)%2, strftime('%w',date) from responses")
    for i in cursor:
#        print(i[0],i[1],i[2])
        if i[2]=='0' or i[2]=='6': continue #weekend
        valid_dates[i[0]] = i[1]
#    print(valid_dates)
    date_count = {key:0 for key in valid_dates}
    #Step 2: Find all the student logins on those particular days that correspond to student
    cursor = C.execute("SELECT distinct date(DATE) from logins where student=?",(student,))
    count = [0,0]
    for date in cursor:
        date = date[0]
        if date in valid_dates:
            weekday = valid_dates[date]
            count[weekday] += 1
            date_count[date] += 1
    tab = '\t'
    theirclass=-1
    if count[0] == count[1]:
        return #that doesn't make sense
    theirclass = 0 if count[0]>count[1] else theirclass=1
    totaldates = [x for x in valid_dates if valid_dates[x]==theirclass]
    #NEXT: make a list of dates they attended next, same process
        
    return count,date_count

if __name__ == "__main__":
    fields = readfields(["student"])
    if fields.student:
        print(get(fields.student))
