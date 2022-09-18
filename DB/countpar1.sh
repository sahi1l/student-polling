#sqlite3 $1.db "select student,COUNT(student) as cnt from responses WHERE student<>UPPER(student) OR student<>LOWER(student) GROUP BY student ORDER BY cnt;"
#sqlite3 $1.db "SELECT student,COUNT(student) as cnt FROM responses WHERE length(student)=8 GROUP BY question,student ORDER BY cnt,student;"





sqlite3 $1.db "SELECT A.student, COUNT(A.student) as cnt FROM (select distinct student,question FROM responses WHERE length(student)=8 AND response IS NOT NULL) A GROUP BY A.student ORDER BY cnt,A.student;" | sed 's/|/	/g'
