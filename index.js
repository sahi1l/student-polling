let course="db"
let qid=""; //question id
let student;
function loadquestion(flashButton=true){
    $.ajax({
        url: "getnewquestion.cgi",
        data: {student:student, qid:qid, course: course},
        success: (data)=>{showquestion(data,flashButton)},
        error: function(j,t,x){console.log("error:",t,x);}
    });
        
}
function setupAnswer(answer,mathjax){
    let code=answer;
    let SP=answer.split("@")
    if(SP.length==2){
        answer=SP[1]
        code=SP[0]
    }
    answer=answer.replace(/^\*/,"")
    
    if(answer[0]=='$'){
        answer='\\('+answer.substr(1)+'\\)'
        mathjax=true
    }
    return `<label class="container">${answer}<input type="radio" name="answer" value="${code}"><span class="checkmark"></span></label>\n`
}
function showquestion(data, flashButton){
    if(data && !$.isEmptyObject(data)){
        let mathjax=false
        if(data.id!=qid){ //this is a new question
            qid=data.id;
            $('.question').html(data.question);
            //FIX: Add figure
	    if(data.question.includes("\\(")) {mathjax=true;}
            let answers=""
            data.answers.trim().split("\n").forEach(
		(answer) => {
		    answers += setupAnswer(answer);
		});
            $('#answers').html(answers);
            if(true || mathjax){
                MathJax.typeset([".container",".question"]) //always typeset
            }
            $("input:radio").on("change",saveresponse)
        } else if (flashButton) {
            let label = $("#next").html()
            $("#next").html("(hasn't changed)").addClass("hasntchanged")
            setTimeout(()=> $("#next").html(label).removeClass("hasntchanged"),1000)
        }
    } else {
	$('.question').html("(No question yet)")
    }
}
function saveresponse(){
    let value=$("input:radio:checked").val();
    $.ajax({
        dataType: "text",
        url: "saveresponse.cgi",
        data: {student: student,
               question: qid,
               response: value,
               course: course},
        success: function(x) {console.debug(value);},
        error: function(e, textStatus, errorThrown){console.error(errorThrown);}
    });
    
}
function savecomment() {
    let response=$("input:radio:checked").val();
    let comment=$("#comments").val()
    $.ajax({
        dataType: "text",
        url: "savecomment.cgi",
        data: {student: student,
               question: qid,
               response: response,
               comment: comment,
               course: course,
        },
        success: function(x) {
            let label = $("#commentsubmit").html()
            $("#commentsubmit").html("(submitted)").addClass("hasntchanged")
            setTimeout(()=> $("#commentsubmit").html(label).removeClass("hasntchanged"),1000)
            console.debug(comment);
        },
        error: function(e){console.error(e);}
    });
}
let seed;
function Login(email) {
    //record a login from a given email
    $.ajax({
	url: "login.cgi",
	data: {course: course, code: student, email: email},
	success: (response) => {console.debug("Login success",response)},
	error: (j,t,x) => {console.error("Login error",t,x)},
    })
}
function init() {
        seed=parseInt(Math.random()*1e17) //random integer
    //Generate student ID
    course = (document.location.pathname.split("/").reverse()[0].split(".")[0])
    //if called from 101.html then use 101
    if (getLogin()) {
	student = getLogin()
    } else if (Cookies.get("pollid")){
        student=Cookies.get("pollid")
    } else {
	student = seed
        Cookies.set("pollid",student)
    }
    /*
      course = document.location.search.substr(1)
    if (course == "") {
        course = document.location.pathname.split("/").pop().replace(".html","")
	}
    */
    $("#next").on("click",loadquestion)
    $("#commentsubmit").on("click", savecomment)
    loadquestion();
    oncein = ()=>  {
	Login( getLogin() )
//	student = getLogin()
//	loadquestion(false) //For now, this will register that they are present
    }
    onceout = ()=> {
	Login(null)
//	loadquestion(false)
    }
    setTimeout(cookielogin, 500)
}
$(init)
