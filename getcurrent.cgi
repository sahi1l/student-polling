#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
import sys
from readfields import default,readfields
form=cgi.FieldStorage()
def extract(val,default):
    if val:
        return val[0]
    else:
        return default

def getCurrent(qid, since, course="db"):
    C=sqlite3.connect(f"DB/{course}.db")
    if not qid:
        qid=extract(
            C.execute("SELECT id FROM questions WHERE current=1").fetchone(),
            "")
    if not qid:
        return
    #Get data on the current question
    data = C.execute("SELECT question,answers,correct,category FROM questions WHERE id=?",(qid,)).fetchone()
    (question, answers, correct, category) = data

#    today = C.execute("SELECT DATE(date) FROM responses WHERE question=? ORDER BY date DESC",(qid,)).fetchone()

    if since:
        responselist=C.execute("SELECT response FROM responses WHERE question=? AND datetime(DATE)>datetime(?)", (qid,since)).fetchall()
        comments = C.execute("SELECT response,comment FROM comments WHERE question=? AND datetime(DATE)>datetime(?) ORDER BY DATE DESC", (qid,since)).fetchall()
    else:
        responselist=C.execute("SELECT response FROM responses WHERE question=? ", (qid,)).fetchall()
        comments = C.execute("SELECT response,comment FROM comments WHERE question=? ORDER BY DATE DESC", (qid,)).fetchall()

    total=len(responselist) #all 

    if since:
        totaltoday=len(C.execute("SELECT DISTINCT student FROM responses WHERE datetime(DATE)>date(?)",(since,)).fetchall())
    else:
        totaltoday=0


    responses={}
    answersdict={}
    for answer in answers.split("\n"):
        A=answer.split("@")
        if len(A)>1:
            code=A[0]
            answer=A[1].strip("*")
        else:
            code=answer=answer.strip("*")
        responses[code]=0
        answersdict[code]=answer
    
    totalresponse=0
    for resitem in responselist:
        res=resitem[0]
        if not res == None:
            responses[res]=responses.get(res,0)+1
            totalresponse+=1

    return {"id":qid,
            "question":question,
            "answers":answersdict,
            "seen":total,
            "today":totaltoday,
            "category":category,
            "responded":totalresponse,
            "responses":responses,
            "correct":correct,
            "comments": comments,
            }

if __name__ == "__main__":
    f = readfields(["qid", "since", "course"])
    result = getCurrent(f.qid, f.since, default(f.course, "db"))
    print("Content-type: application/json\n")
    print(json.dumps(result))


#question (<-questions): String text of the question
#answers (<-questions): In the format code@response\ncode@response etc
#correct (<-questions): Should be a code
#responselist(<-response): Should be a list of codes
#responses: A dictionary keyed by codes
