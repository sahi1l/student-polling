#sqlite3 $1.db "select student,COUNT(student) as cnt from responses WHERE student<>UPPER(student) OR student<>LOWER(student) GROUP BY student ORDER BY cnt;"
sqlite3 $1.db "select distinct logins.student,COUNT(logins.student) from responses RIGHT JOIN logins WHERE logins.code==responses.student AND responses.response IS NOT NULL GROUP BY logins.student ORDER BY cnt,student;"

#"SELECT student,COUNT(student) as cnt FROM responses WHERE length(student)=8 GROUP BY student ORDER BY cnt,student;"
