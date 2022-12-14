let cleanversion=""
function $Edit(val) {
    return $(`#edit ${val}`)
}
function serialize(introQ) {
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

class Dirty {
    constructor() {
        this.cleanversion = ""
        this._dirty = false
	this.check = this.check.bind(this)
    }
    set(val) {
	this._dirty = val
        if (val) {
	    $Edit("#savequestion").html("SAVE QUESTION")
        } else {
            this.cleanversion = serialize(true).answers
	    $Edit("#savequestion").html("Save Question")
        }
    }
    check() {
        this._dirty = (serialize(true).answers!=this.cleanversion)
	this.set(this._dirty)
        return this._dirty
    }
}
let dirty = new Dirty()
function getEditFields() {
    //I just want to grab everything from the form into a dictionary here
    results = {}
    results.id = $Edit("#id").val()
    results.category = $Edit("#category").val()
    results.hidden = $Edit("#hidden").prop("checked")
    results.question = $Edit("#Equestion").val()
    results.answers = []
    results.correct = ""
    $Edit("#answers>tbody tr").each(
	function(idx,w) {
	    let iscorrect = $(w).find(".Icorrect").prop("checked")
	    let code = $(w).find(".Icode").html().trim()
	    let response = $(w).find(".Iresponse").val().trim()
	    if (iscorrect) {
		results.correct = code
	    }
	    results.answers.push({code: code, response: response, correct: iscorrect})
	}
    )
    return results
}
function setEditFields(results) {
    $Edit("#category").val(results.category)
    $Edit("#hidden").prop("checked",results.hidden)
    $Edit("#Equestion").val(results.question)
    clearAnswers()
    codes.clear()
    for (let answer of results.answers) {
	let code = newanswer().attr("id")
	console.log(code, answer.response)
	$Edit(`#answers>tbody tr#${code} .Iresponse`).val(answer.response)
	$Edit(`#answers>tbody tr#${code} .Icorrect`).prop("checked", answer.correct)
    }
}
//----------------------------------------
class Codes {
    constructor() {
	this.codes = []
    }
    clear() {
	this.codes = []
    }
    choose() {
	let result;
	do {
            result=""
            let alphabet="abcdefghijklmnopqrstuvwxyz"
            for (let i=0;i<3;i++){
		result+=alphabet.charAt(Math.floor(Math.random()*alphabet.length));
            }
	} while (this.codes.includes(result))
	this.codes.push(result)
	return result
    }
}
codes = new Codes()
//----------------------------------------
function newanswer(num){
    if(typeof(num)!=="string" || num==""){
        num=codes.choose()
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
        dirty.check(); //assign to dummy variable if necessary?
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

function clearAnswers() {
    $Edit("#answers>tbody").html("")
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
        codes.clear()
	clearAnswers()
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
        $(".Iresponse").on("change",dirty.check)
        $(".Icode").on("change",dirty.check)
        getstats(qid)
    }
    dirty.set(false)
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
    let data = getEditFields()
    //call newquestion
    newquestion()
    console.log(data)
    //fill in the answers
    setEditFields(data)
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

function makecurrent(){
    savequestion(true)
    window.scrollTo(0,0)
}
//FIX: Mark the edited question as dirty or clean. Hide Save question if clean.
function MoveDown(e){
    console.log("MoveDown")
    let w=$(e.target).parents("tr") //this is the row to move
    console.log(w)
    let next=$(w).next() //this is the next row
    console.log(next)
    $(w).before(next) //insert before after $w
}
function MoveUp(e){
    let w=$(e.target).parents("tr")
    let prev=$(w).prev()
    $(w).after(prev)
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

function editInit(){
    $("#newquestion").on("click",newquestion)
    $("#dupquestion").on("click",dupquestion)
    $("#makecurrent").on("click",makecurrent)
    $("#savequestion").on("click",savequestion)
    $("#edit #category").on("change",dirty.check)
    setupMathify("Equestion")
    $("#Equestion").on("change",dirty.check)
    $("#edit #refresh").on("click",function(){
        let qid=$("#edit #id").val()
        getstats(qid)
    })
    $("input#Equestion").val("")
    $("#id").val("")//I think this goes here?
    $("#newanswer").on("click",newanswer)

}
