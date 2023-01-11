//IDEA: Separate this into three objects: the sidebar, the current question, and the edited question
function catsort(a,b){
    let A=a.replace(/[0-9]+/g,"#")
    let B=b.replace(/[0-9]+/g,"#")
    if (A==B){
	return parseInt(a.replace(/^0-9/g,""))-parseInt(b.replace(/^0-9/g,""))
    } else {
	return (A>B)*2-1
    }
}
let $div = (parent, className) => {
    return $("<div/>").addClass(className).appendTo(parent)
}
let $checkbox = ($root,label) => {
    let $label = $("<label></label>")
    let $result = $("<input type='checkbox'/>").appendTo($label)
    $label.append(label).appendTo($root)
    return $label
}
let $button = ($root, label, fn, data={}) => {
    return $("<button/>").html(label).appendTo($root).on("click", data, fn.bind(this))
}
class Bar {
    constructor($parent, description){
	this.num = 0
	this.den = 0
	this.ok = false
	this.$widget = $div($parent, "bar")
	this.$text = $div(this.$widget, "bartext") //this needs a fixed width
	this.$out = $div(this.$widget, "barout")
	this.$in = $div(this.$out, "barin")
	this.$percent = $div(this.$widget, "percent")
    }
    check() {
	let ok = true
	if (isNaN(this.num)) {ok = false}
	if (this.den == 0) {ok = false}
	this.ok = ok
	return ok
    }
	    
    show() {
	let width = 0
	let pct = this.pct()
	let txt = "--"
	if (this.ok) {
	    let pct = this.pct()
	    width = this.$out.width() * Math.min(pct,1)
	    txt = `${parseInt(pct)*100}% (${this.num})`
	}
	this.$in.width(width)
	this.$percent.html(txt)
    }
    pct() {
	if (this.ok) {return this.num/this.den}
	return null
    }
    //----------------------------------------
    set(num,den) {
	if(num) {this.num = num}
	if(den) {this.den = den}
	this.check()
	this.show()
    }
}

class Sidebar {
    constructor() {
	this._course = "db"
	this._category = ""
	this._question = 0 //selected question
	this.categories = []
	this.questions = {0:{question:"What is your favorite color?",category:"trial"}};
	this.$menu = $("#menu")
	this.$list = $("#list")
    }
    //----------------------------------------
    fetchQuestions() {
	$.ajax({
            url:"getquestions.cgi",
            dataType:"json",
            data: {course: this.course},
            success:this.populate
	})
    }
    //----------------------------------------
    chooseQuestion(e) {
	let id = e.data.id
	this.question = id //everything else taken care of by setter
    }
    populate(data) {
	//populate the sidebar with the details
	this.categories = new Set() //{} //using this as a set, but including total number b/c maybe useful?
	this.questions = {}
	for (let id of Object.keys(data)) {
	    let item = data[id]
	    questions[id] = {
		category: item.category,
		question: item.question,
		$widget: $("<div></div>").addClass("Lquestion").html(item.question).on("click", {id: id}, this.chooseQuestion.bind(this))
	    }
	    categories.add(item.category)
	}
	for (category of ["ALL"]+Array.from(categories).sort(catsort)) {
	    options += `<option>${category}</option>\n`
	}
	this.$menu.html(options)
	this.displayList()
    }
    //----------------------------------------
    displayList() {
	let category = this.category
	this.$list.html("")
	for (let qid in questions) {
	    let question = questions[qid]
	    if ( category == "ALL" || category == question.category ) {
		this.$list.append(question.$widget)
	    }
	}
	this.question = this.question //if there is a default value, activate the setter
    }
    //----------------------------------------
    get course() {return this._course}
    set course(value) {
	this._course = value
	//change the button
    }
    get category() {return this._category}
    set category(value) {
	this._category = value
	this.$menu.val(this._category)
	this.displayList()
    }
    //----------------------------------------
    get question() {return this._question}
    set question(value) {
	this._question = value
	$(".selectedQ").removeClass("selectedQ")
	if (value in this.questions) {
	    this.questions[value].$widget.addClass("selectedQ")
	    this.category = this.questions[value].category
	    editing.question = value //tell Edit to change too
	} else {this._question = 0}
    }
    //----------------------------------------
}
//============================================================
class Current {
    constructor() {
	this.$root = $("#current")
	this._showall = false
	this.$table = $("#responses table")
	this.$question = $("#Cquestion")
	//attach the widget where appropriate
	this.render()
    }
    render() {
	this.$root.append("<H2>Current Question</H2>")
	$button(this.$root, "No Current Question", this.noCurrent)
	this.$question = $("<div></div>").appendTo(this.$root)
	this.$table = $("<table></table>")
	$div(this.$root, "responses").append(this.$table) //not sure I need the div, just put $table into $root?
//	this.$root.append("<div></div>").addClass("responses").append(this.$table) //NOTE: not sure I need the div?

	this.$auto = $checkbox(this.$root, "Auto")
	this.$showall = $checkbox(this.$root, "Show All")

	$button(this.$root, "Refresh", this.refresh)
	$button(this.$root, "Clear Responses", this.clearResponses)

	this.bar = new Bar(this.$root, "from students who saw this question")
	this.today = new Bar(this.$root, "from students here today")

	this.$comments = $div(this.$root)
    }
    refresh() {}
    clearResponses() {}
	
    noCurrent() {
	//#nocurrent button code goes here
    }
    fetch() {
	$.ajax({
	    url: "getcurrent.cgi", //maybe this should be built into question instead?
	    data: {"showall": this.showall,
		   "course": main.course}
	    dataType: "json",
	    success: this.populate,
	    error: (a,b,e) => {console.debug("GetCurrent Error:",e)}
	})
    }
    populate(data) {
	if (data==undefined || !("question" in data)) {//no current problem
	    this.$question.html("--")
	    this.$table.html("")
	    this.bar.set(0,0)
	    this.today.set(0,0)
	} else {
	    let alphabet = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	    $table.html("")
	    let question = data["question"]
	    let answers = data["answers"] //a dictionary keyed by code
	    let letters = {}
	    for (let code of Object.keys(answers)) {
		letters[code] = alphabet.shift()
	    }
	    this.$question.html(question)
	    let responses = data["responses"]
	    if (!main.category) {
		main.category = data["category"]
	    }
	    this.bar.set(data["responded"], data["seen"])
	    this.today.set(data["responded"], data["today"])

	    let stuff = "" //not sure what this is for?
	    
	    
	
    }
    //----------------------------------------
    set showall(value) {
	this._showall = value
	this.$showall.prop("checked", value)
	//start or stop the checking
    }
    get showall() {
	return this._showall
    }
}

class Question {
    //all the structure of a certain question
    constructor(id) {
	this.answers = []
    }
    
}
class Editing {
    constructor() {
	this._dirty = false
	this.$savequestion = $("#savequestion"); //button
    }
    set dirty(value) {
	this._dirty = value
	this.$savequestion.html( value?"SAVE QUESTION":"Save Question" )
	//Add cleaning here
    }
    
}

let main;
let current;
let editing;

function init(){
    main = new Sidebar()
    current = new Current()
    editing = new Editing()
}
