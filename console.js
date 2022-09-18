let course = "db"
let current=0; //current question

//BARS
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
//----------------------------------------
let debug;


function reset() {
    getquestions()
    getcurrent()
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
function init(){
    sidebarInit()
    editInit()
    currentInit()
    reset()
    //FIX: When a new correct answer is chosen, move the class to that bit
}
$(init);
