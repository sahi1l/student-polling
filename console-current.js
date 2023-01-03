let sortcomments = false;
let since = null;
function showcurrent(data){
    //called by getcurrent
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
function getcurrent(){
    //use AJAX to get stats for the current question
    let showall=$("#showall").prop("checked")
    data = {course: course}
    if (!showall && since) {data.since = since}
    $.ajax({
        url:"getcurrent.cgi",
	data: data,
        dataType:"json",
        success:showcurrent,
        error:function(a,b,e){console.log("GetCurrent Error:",e)}
    })
}
function setSince() {
    since = new Date().toISOString();
    $("#since").html("SINCE")
    getcurrent()
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
let autoQ=undefined
//function clearResponses(){
//    if (confirm("Clear all the responses?")) {
//	$.ajax({
//	    url:"clearcurrent.cgi",
//            data: {course: course},
//	    success:function(){
//		getcurrent()
//	    }
//	})
//    }
//}

function currentInit() {
    $("#nocurrent").on("click",nocurrent)
    $("#since").on("click",setSince)
//    $("#clear").on("click",clearResponses)
    $("#current #refresh").on("click",getcurrent)
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


}
