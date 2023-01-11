#!/usr/bin/env -S PATH=${PATH}:/usr/local/bin/secure python3
import sqlite3
import cgi
import json
import sys
from readfields import default,readfields
from console import getDB
form=cgi.FieldStorage()
def extract(val,default):
    if val:
        return val[0]
    else:
        return default

def getCurrent(qid, since, course="db"):
    with open("LOG","a") as F:
        F.write(f"------------\n")
    C=getDB(course)
    if not qid:
        qid=extract(
            C.execute("SELECT id FROM questions WHERE current=1").fetchone(),
            "")
    if not qid:
        return
    #Get data on the current question
    data = C.execute("SELECT question,answers,correct,category FROM questions WHERE id=?",(qid,)).fetchone()
    (question, raw_answers, correct, category) = data
    if not since: since = 0 #This lets me do everything once, not twice

    #List of all the responses for a specific question. Max of one response per student
    #This includes blanks, which are just people seeing the question
    responselist = C.execute("""
    SELECT response FROM responses
    WHERE question=? AND datetime(date)>datetime(?)
    """, (qid,since)
                            ).fetchall()

    #List of all the comments with corresponding response
    #Max of one comment per student
    comments = C.execute("""
    SELECT response,comment FROM comments
    WHERE question=? AND datetime(date)>datetime(?)
    ORDER BY DATE DESC
    """, (qid,since)
                        ).fetchall()

    #A list of all the login-codes corresponding to the responses made
    #This includes students who only just saw the question
    #Does not include anonymous logins
    roster = C.execute("""
    SELECT DISTINCT logins.student, code
    FROM responses LEFT JOIN logins ON responses.student = logins.code
    WHERE responses.question=?
    AND datetime(responses.date)>datetime(?)
    AND code IS NOT NULL
    """, (qid,since)
                       ).fetchall()
    if roster:
        roster = [x[0] for x in roster if x[0]]
    with open("LOG","a") as F:
        F.write(f"{roster}\n")

    totalseen = len(responselist) #The number of students who have seen the question
    anonymous = totalseen - len(roster)

    totalsince = len(
        C.execute("""
        SELECT DISTINCT student FROM responses
        WHERE datetime(DATE)>date(?)
        """, (since,)
                  ).fetchall()
    ) #students who have seen *any* question


    responses={} #this is a histogram
    answers={} #connects the code to the actual answer. DEPRECATE?
    for answer in raw_answers.split("\n"):
        A=answer.split("@")
        if len(A)>1:
            code=A[0]
            answer=A[1].strip("*")
        else:
            code = answer = answer.strip("*")
        responses[code] = 0
        answers[code] = answer
    
    totalresponse=0 #number of students who actually responded
    for resitem in responselist:
        res = resitem[0]
        if not res == None:
            responses[res] = responses.get(res,0) + 1
            totalresponse += 1

    return {"id":qid,
            "question":question, #text of the question
            "category":category, #category of the question
            "answers":answers, #a dictionary of code->answer text
            "correct":correct, #the code of the correct answer
            "seen":totalseen, #number of students who saw this question
            "today":totalsince, #number of students who saw any question
            "responded":totalresponse, #number of students who responded
            "responses":responses, #dictionary: histogram of responses
            "comments": comments, #list of comments
            "roster": roster, #list of students who saw this
            "anonymous": anonymous, #number of students who haven't logged in, but saw this
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
