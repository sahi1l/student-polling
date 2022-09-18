let curcategory="";
let categories;
let questions={0:{question:"What is your favorite color?",category:"trial"}};
function catsort(a,b){
    let A=a.replace(/[0-9]+/g,"#")
    let B=b.replace(/[0-9]+/g,"#")
    if (A==B){
	return parseInt(a.replace(/^0-9/g,""))-parseInt(b.replace(/^0-9/g,""))
    } else {
	return (A>B)*2-1
    }
}
function getquestions(){
    //uses AJAX to populate questions with id, question, and category
    $.ajax({
        url:"getquestions.cgi",
        dataType:"json",
        data: {course: course},
        success:populatequestions
    })
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


function sidebarInit() {
    course = Cookies.get("showcourse")??"db"
    $("#menu").on("change", function(x){
        displaylist($(x.target).val());
    });
     $("#topmakecurrent").on("click",makecurrent)
       $("#edit #category").on("change",CheckDirty)
    $("#course input").on("click", setCourse);
    $("#category").val("")

}
