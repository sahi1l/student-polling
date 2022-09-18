let course = "db"
let current=0; //current question
let curcategory="";
let categories;
let questions={0:{question:"What is your favorite color?",category:"trial"}};
function getquestions(){
    //uses AJAX to populate questions with id, question, and category
    $.ajax({
        url:"getquestions.cgi",
        dataType:"json",
        data: {course: course},
        success:populatequestions
    })
}
function catsort(a,b){
    let A=a.replace(/[0-9]+/g,"#")
    let B=b.replace(/[0-9]+/g,"#")
    if (A==B){
	return parseInt(a.replace(/^0-9/g,""))-parseInt(b.replace(/^0-9/g,""))
    } else {
	return (A>B)*2-1
    }
}
function populatequestions(data){
    //read through questions to get all the category names, then populate
    categories=[]
    questions={}
    
    for (let id of Object.keys(data)) {
        let item=data[id]
        questions[id]={
            "category":item.category,
            "question":item.question
        }
        //build the list of categories
        if (!categories.includes(item.category)){
            categories.push(item.category)
        }
    }
    let options="<option>ALL</option>\n"
    for (category of categories.sort(catsort)){
        options+=`<option>${category}</option>\n`
    }
    $("#menu").html(options)
    displaylist(curcategory)
}

function displaylist(category){
    //show a list of all the question titles with a given category in #list
    if(category==undefined){
        category=$("#menu").val()
    }
    curcategory=category
    $("#menu").val(category)
    let contents="";
    for (let qid in questions){
        let question=questions[qid];
        if(category=="ALL" || category==question.category){
            contents+=`<div class="Lquestion" id="Q${qid}">${question.question}</div>`
        }
    }
    $("#list").html(contents)
    $("#list>.Lquestion").on("click",ChooseQuestion)
    $("#Q"+$("#id").val()).addClass("selectedQ")
}

function ChooseQuestion(e){
    let qid;
    if(typeof(e)=="object"){
	let $target = $(e.target)
	if (! $target.hasClass("Lquestion")) {
	    $target = $target.parents(".Lquestion")
	}
	try {
            qid=$target.attr("id").substr(1)
	} catch (err) {
	    console.log("Choose Question called on ",$target,"which has no attr")
	    console.log(err)
	}
    } else {
        qid=e;
    }
    console.log(qid)
    getquestion(qid)
}
function pcttext(num,den){
    if(isNaN(num) || den==0){
	return "--"
    }
    return parseInt((num/den)*100)+"% ("+num+")"
}
function setbar(w,num,den){
    let pctxt=pcttext(num,den)
    let width=0
    if(pctxt!="--"){
	let max=$(w).find(".barout").width()
	let pct=num/den
	width=Math.min(max,max*pct)
    }
    $(w).find(".barin").width(width)
    $(w).find(".percent").html(pctxt)

}
function getcurrent(){
    //use AJAX to get stats for the current question
    let showall=$("#showall").prop("checked")
    console.log("Sending showall=",showall)
    $.ajax({
        url:"getcurrent.cgi",
	data:{"showall":showall, "course": course},
        dataType:"json",
        success:showcurrent,
        error:function(a,b,e){console.log("GetCurrent Error:",e)}
    })
}
let cleanversion=""
function SetDirty(dirt){
    if(dirt){
	$("#savequestion").html("SAVE QUESTION")
    } else {
	$("#savequestion").html("Save Question")
    }
}
function CheckDirty(){
    let dirty=(serialize(true).answers!=cleanversion)
    //    $("#savequestion").prop("disabled",!dirty)
    SetDirty(dirty)
    return dirty
}
function serialize(introQ){
    
    let answers=""
    let correct=""
    if(introQ){
        answers=$("#edit #category").val()+"\n"+$("#Equestion").val()+"\n"
    }
    $("#edit #answers>tbody tr").each(
        function(idx,w){
            debug=w
            let iscorrect=$(w).find(".Icorrect").prop("checked")
            let code=$(w).find(".Icode").html().trim()
            let response=$(w).find(".Iresponse").val().trim()
            if(iscorrect){
                correct=code
//                json["correct"]=code //I'm going to use the code to keep track of answers
                response="*"+response
            }
            answers+=code+"@"+response+"\n"
        }
    )
    return {"answers":answers,"correct":correct}
}
let sortcomments = false;
function showcurrent(data){
    //called by getcurrent
    console.log("ShowAll:",data.showall)
    console.log("OnlyToday:",data.onlytoday)
    let $table=$("#responses table")
    if (data==undefined || !("question" in data)){ //no current problem
        $("#Cquestion").html("--")
        $table.html("")
        $("#this .barin").width(0)
        $("#today .barin").width(0)
    } else {
        let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        $table.html("")
        let question=data["question"]
        let answers=data["answers"] //this is a dictionary keyed by the code
        let letters = {}
        for (let code of Object.keys(answers)) {
            letters[code] = alphabet[0]
            alphabet = alphabet.substr(1)
        }
        $("#Cquestion").html(question)
        let responses=data["responses"]
	if ($('#menu').val()==undefined){
	    displaylist(data["category"])
	}
	setbar("#this",data["responded"],data["seen"])
	setbar("#today",data["responded"],data["today"])
        $("#debug").html("Responded: "+data["responded"]+", Seen: "+data["seen"]+", Today: "+data["today"])
        let stuff=""
        let max=$("#this .barout").width()
        for (let response of Object.keys(responses)){
            if(response==""){break}
            let $row=$("<tr></tr>").appendTo($table)

            let count=responses[response]
            let percent=count/data["responded"]
	    showpct=pcttext(count,data["responded"])
            let width=0
            if (!isNaN(percent)) {width=max*percent}
            let code=response;
            if (code==data["correct"]){
                $row.addClass("correct")
            }
            let responsetext=answers[response]
            if(responsetext[0]=='$'){
                responsetext="\\("+responsetext.substr(1)+"\\)"
            }
	    $("<th/>").appendTo($row).html(letters[response]+")")
            $("<th/>").appendTo($row).html(responsetext)
            $("<td/>").appendTo($row).html(`<div class="barout"><div class="barin" style="width:${width}px"></div></div>`)
            $("<td/>").appendTo($row).html(showpct).addClass("percent")
//            stuff+=`<tr ${correct}><th ${correct}>${answers[response]}<td><td class="percent">${showpct}</td></tr>`
            let comments = []
            for (row of data["comments"]) {
                let response = letters[row[0]] //fix: match with answer
                let comment = row[1]
                comments.push(`<B>${response}</B>: ${comment}`)
            }
            if (sortcomments) {comments=comments.sort()}
            $("#comments").html(comments.join("<br>"))
        }
        MathJax.typeset(["#responses"])
	MathJax.typeset(["#list>div"])
	MathJax.typeset(["#Cquestion"])
//        $("#responses table").html(stuff)
    }
}
//var autohandle; //the handle of the interval
function autorefresh(){
    if(!$("#autorefresh").prop("checked")){
        getcurrent()
        setTimeout(autorefresh,3000)
    }
}
function setauto(onQ) {
    console.log("setauto",onQ)
    clearInterval(autoQ)
    if (onQ) {autoQ = setInterval(getcurrent,3000)}
}
function getquestion(qid){
    $.ajax({
        dataType: "json",
        url:"getquestion.cgi",
        data: {id:qid, course:course},
        success:populatequestion,
        error: function(a,b,e){console.log("getquestion Error: ",e,a,b)}
    })
}
let debug;
let codes=[];
function RandomSequence(){
    let result="";
    do {
        result=""
        let alphabet="abcdefghijklmnopqrstuvwxyz"
        for (let i=0;i<3;i++){
            result+=alphabet.charAt(Math.floor(Math.random()*alphabet.length));
        }
    } while (codes.includes(result))
    codes.push(result)
    return result
}
function newanswer(num){
    if(typeof(num)!=="string" || num==""){
        num=RandomSequence()
    }
    let code=$(`<tr id="${num}"></tr>`)
    code.append('<td><input type="radio" name="correct" class="Icorrect"></input></td>\n')
    code.append(`<td class="Icode">${num}</td>`)
    code.append(`<td><input class="Iresponse" id="IR-${num}"></input></td>`)
    code.append('<td style="width:80px"><div><button class="Iup">&uparrow;</button><button class="Idown">&downarrow;</button></div></td>')
    code.append('<td><div class="barout"><div class="barin" style="width:0px"></div></div></td>')
    code.append('<td class="percent"></td>')
    code.append(`<div class="mathify" id="IR-${num}math"></div>`)
    $("#edit #answers>tbody").append(code)
    setupMathify(`IR-${num}`)
    $(".Iresponse").on("keypress",answerpressreturn)
    //Focus the new answer
    $("#edit #answers>tbody tr:last .Iresponse").focus()
    //FIX: assign a random code to this particular answer (timestamp?), make sure it doesn't match the others
    return code
}
function answerpressreturn(e){
    let w=e.target
    let key=e.originalEvent.charCode
    let shift=e.originalEvent.shiftKey
    if(key==13){
        CheckDirty()
        //get the location of the next answer blank
        let next;
        if(shift){
            next=$(w).parents("tr").prev().find(".Iresponse")
        } else {
            next=$(w).parents("tr").next().find(".Iresponse")
        }
        //if the answer is blank, then delete that row entirely
        let contents=$(w).val()
        if(contents==""){
            $(w).parents("tr").remove()
        }
        //advance to the next answer blank, or if this is the bottom and you didn't delete it, call newanswer
        if(next.length){
            $(next).focus()
        } else if(contents!=""){
            if(!shift){newanswer()}
        } else {
            $("#edit #answers>tbody tr:last .Iresponse").focus()
        }
    }
}
function populatequestion(data){
    $("#list div").removeClass("selectedQ")
    if (data){
        $("#list #Q"+(data.id)).addClass("selectedQ")
        $("#edit #id").val(data.id)
	if(data.category.startsWith("~")){
	    $("#edit #hidden").prop("checked",true)
	    data.category=data.category.substring(1)
	} else {
	    $("#edit #hidden").prop("checked",false)
	}
        $("#edit #category").val(data.category)
        $("#Equestion").val(data.question)
	mathify("Equestion")
        //FIX: figure
        let qid=data.id
        codes=[]
        $("#edit #answers>tbody").html("")
        for (let answer of data.answers.trim().split("\n")){
            answer=answer.split("@",2)
            if(answer.length==2){
                var code=answer[0]
                answer=answer[1]
                var w=newanswer(code)
            } else {
                var w=newanswer()
            }
            let correctQ=(answer[0]=="*")
            $(w).find(".Icorrect").prop("checked",correctQ)
            if(correctQ){
                answer=answer.substr(1)
                $(w).addClass("correct")
            }
            $(w).find(".Iresponse").val(answer)
	    mathify(`IR-${code}`)
        }
        $(".Iup").on("mouseup",MoveUp)
        $(".Idown").on("mouseup",MoveDown)
        $(".Iresponse").on("change",CheckDirty)
        $(".Icode").on("change",CheckDirty)
        getstats(qid)
    }
    cleanversion=serialize(true).answers
    SetDirty(false)
//    $("#savequestion").prop("disabled",true)
}
function getstats(qid){
    let showall=$("#showall").prop("checked")
        $.ajax({
            url:"getcurrent.cgi",
            dataType:"json",
            data:{qid:qid, showall:showall, course: course},
            success:showstats,
            error:function(a,b,e){console.log("GetCurrent Error:",e,"qid",qid)}
        })
}
function showstats(data){
    let responses=data["responses"]
    let correct=data["correct"]
    $("#edit #answers>tbody tr").each(
        function(idx,w){
            let code=$(w).find(".Icode").html().trim()
            if (responses[code]){
		//                setbar($(w),responses[code]/data["seen"],responses[code])
		setbar($(w),responses[code],data["seen"])
            } else {
                setbar($(w))
            }
        }
    )
}
function newquestion(){
    //When Clicking the new question button
    $("#list div").removeClass("selectedQ")
    $("#edit #id").val("NEW")
    $("#edit #category").val(curcategory)
    $("#Equestion").val("")
    $("#edit #answers tbody").html("")
    newanswer()
}
function dupquestion(){
    //get all the data from the current question
    //call newquestion
    //fill in the answers
}

function savequestion(current){
    if(current==true){
        current=1
	displaylist($("#edit #category").val())
    } else {
        current=0
    }
    //setup JSON
    let json={
        "id":$("#edit #id").val(),
        "category":$("#edit #category").val(),
        "question":$("#Equestion").val(),
        "answers":"",
        "correct":"",
        "current":current,
        "course":course,
    }
    if($("#edit #hidden").prop("checked")){
	json["category"]="~"+json["category"]
    }
    let answers=serialize()
    json["answers"] = answers.answers
    json["correct"] = answers.correct
    $.ajax({url:"addquestion.cgi",
           dataType: "json",
           data: json,
            success: function(data){
                console.log("addquestion success",json,data)
                $("#edit #id").val(data["id"])
                if (current) {
                    getcurrent()
               }
               getquestions()
               //FIX: Select the current category and the current question
           },
            error:function(a,b,e){
                console.log("addquestion Error:",e)
            }
           })
}

function nocurrent(){
    $.ajax({url:"nocurrent.cgi",
            dataType:"json",
            data: {course: course},
            success: function(data){
                showcurrent()
            },
            error: function(a,b,e){console.log("nocurrent Error:",e)}
           })
}
function makecurrent(){
    savequestion(true)
    window.scrollTo(0,0)
}

//FIX: Mark the edited question as dirty or clean. Hide Save question if clean.
function MoveDown(e){
    let w=$(e.target).parents("tr")
    let next=$(w).next()
    $(w).before(next)
}
function MoveUp(e){
    let w=$(e.target).parents("tr")
    let prev=$(w).prev()
    $(w).after(prev)
}
let autoQ=undefined
function clearResponses(){
    if (confirm("Clear all the responses?")) {
	$.ajax({
	    url:"clearcurrent.cgi",
            data: {course: course},
	    success:function(){
		getcurrent()
	    }
	})
    }
}

function reset() {
    getquestions()
    getcurrent()
//    autorefresh()
    newquestion()
    $("#debug").html("")
    $("#comments").html("")
}
let mobile=false
function switchToMobile(){
    mobile=true
    $("#sidebar").css({position:"relative", width:"100%",height:"auto"})
    $(".barout").css({width:50})
    $("#mobile").hide()
    $("body").css({"margin-left":"0px"})
}
function mathify(id) {
    console.log("Mathify",id)
    let val = $(`#${id}`).val()
    let $tgt = $(`#${id}math`)
    if (val.includes("\\(") || val.includes("$")) {
	console.log(`val=${val}`)
	if (val.startsWith("$") && (val.match(/\$/g)||[]).length){
	    val = "\\("+val.slice(1)+"\\)"
	}	
	$tgt.html(val)
	MathJax.typeset([`#${id}math`])
    } else {
	$tgt.html("")
    }
}
function setupMathify(id) {
    console.log("Setting up mathify on",id,$(`#${id}`))
    
    $(`#${id}`).on("change",    {id: id}, (e) => {mathify(e.data.id)})
    $(`#${id}`).on("keypress",  {id: id}, (e) => {mathify(e.data.id)}); //FIX: add a short delay 
    $(`#${id}math`).on("click", {id: id}, (e) => {mathify(e.data.id)})
}
function setCourse(c) {
    if (typeof(c) == "object") {
	try {
	    c = c.target.value
	} catch {;}
    }
    course = c
    let age = 3600*24*7 //number of seconds in a week
    Cookies.set("showcourse", course, {sameSite: 'strict', expires: age})
    reset()
}
function init(){
    course = Cookies.get("showcourse")??"db"
    $("#menu").on("change", function(x){
        displaylist($(x.target).val());
    });
    $("#newquestion").on("click",newquestion)
    $("#dupquestion").on("click",dupquestion)
    setupMathify("Equestion")
//    $("#Equestion").on("change",(e) => mathify("Equestion"))
    $("#makecurrent").on("click",makecurrent)
    $("#topmakecurrent").on("click",makecurrent)
    $("#savequestion").on("click",savequestion)
    $("#nocurrent").on("click",nocurrent)
    $("#clear").on("click",clearResponses)
    $("#current #refresh").on("click",getcurrent)
    $("#edit #category").on("change",CheckDirty)
    $("#Equestion").on("change",CheckDirty)
    $("#edit #refresh").on("click",function(){
        let qid=$("#edit #id").val()
        getstats(qid)
    })
    $("#course input").on("click", setCourse);
    $("#category").val("")
    $("input#Equestion").val("")
    $("#id").val("")
    $("#autorefresh").on("change",function(e){
        if($(e.target).prop("checked")){
	    setauto(true)
        } else {
	    setauto(false)
        }
    })
    {
	let startautorefresh = false
	if (startautorefresh) {setauto(true)}
	$("#autorefresh").prop("checked",startautorefresh)
    }
    $("#comments").on("click",()=>{sortcomments=!sortcomments; getcurrent()})
    $("#newanswer").on("click",newanswer)
    $("#mobile").on("click",switchToMobile)
    reset()
    //FIX: When a new correct answer is chosen, move the class to that bit
}
$(init);
